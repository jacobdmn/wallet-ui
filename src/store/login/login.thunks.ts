import { keccak256 } from "js-sha3";
import { push } from "connected-react-router";
import { utils } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Web3Provider } from "@ethersproject/providers";
import { Signer } from "@ethersproject/abstract-signer";
import hermez from "@hermeznetwork/hermezjs";
import { isEnvironmentSupported } from "@hermeznetwork/hermezjs/src/environment";

import { AppState, AppDispatch, AppThunk } from "src/store";
import { getNextForgerUrls } from "src/utils/coordinator";
import * as globalActions from "src/store/global/global.actions";
import * as globalThunks from "src/store/global/global.thunks";
import * as loginActions from "src/store/login/login.actions";
// domain
import { Signers, HermezWallet } from "src/domain";
// persistence
import * as persistence from "src/persistence";
import { getAuthSignatures, setAuthSignatures } from "src/persistence/local-storage";

/**
 * Helper function that signs the authentication message depending on Wallet type
 */
function signMessageHelper(
  providerOrSigner: Web3Provider | Signer,
  message: string,
  address: string
): Promise<string> {
  if (providerOrSigner instanceof Web3Provider) {
    if (providerOrSigner.provider instanceof WalletConnectProvider) {
      const rawMessageLength = new Blob([message]).size;
      const messageInBytes = utils.toUtf8Bytes(
        `\x19Ethereum Signed Message:\n${rawMessageLength}${message}`
      );
      const msgParams = [address.toLowerCase(), utils.keccak256(messageInBytes)];
      return providerOrSigner.provider.connector.signMessage(msgParams).then((signature) => {
        if (typeof signature === "string") {
          return Promise.resolve(signature);
        } else {
          return Promise.reject(
            "Oops... The function signMessage() from the WalletConnectProvider's connector did not return a valid string signature"
          );
        }
      });
    } else {
      return Promise.reject(
        "Oops... The Web3Provider passed as providerOrSigner to the function signMessageHelper is not a valid WalletConnectProvider"
      );
    }
  } else {
    return providerOrSigner.signMessage(message);
  }
}

/**
 * Asks the user to login using a compatible wallet and stores its data in the Redux
 * store
 */
function fetchWallet(walletName: loginActions.WalletName): AppThunk {
  return async (dispatch: AppDispatch, getState: () => AppState) => {
    try {
      switch (walletName) {
        case loginActions.WalletName.WALLET_CONNECT: {
          const walletConnectProvider = new WalletConnectProvider({
            infuraId: process.env.REACT_APP_INFURA_API_KEY,
            bridge: process.env.REACT_APP_WALLETCONNECT_BRIDGE,
          });
          hermez.Providers.setProvider(walletConnectProvider, hermez.Providers.PROVIDER_TYPES.WEB3);
          break;
        }
        case loginActions.WalletName.METAMASK: {
          hermez.Providers.setProvider();
          break;
        }
      }

      const provider = hermez.Providers.getProvider();

      dispatch(loginActions.loadWallet(walletName));

      if (walletName === loginActions.WalletName.METAMASK) {
        try {
          await provider.send("eth_requestAccounts", []);
        } catch (err) {
          console.error(err);
        }
      }

      const signerData = { type: "JSON-RPC" as const };
      const signer = await hermez.Signers.getSigner(provider, signerData);

      if (provider.provider instanceof WalletConnectProvider) {
        // Enable shows the QR or uses the stored session
        await provider.provider.enable();
      }

      const { chainId, name: chainName } = await provider.getNetwork();

      if (process.env.REACT_APP_ENV === "production" && !isEnvironmentSupported(chainId)) {
        dispatch(
          globalActions.openSnackbar("Please, switch your network to Mainnet or Rinkeby to login")
        );
        dispatch(loginActions.goToWalletSelectorStep());

        if (provider.provider instanceof WalletConnectProvider) {
          // Close the stored session to avoid storing a network not supported by Hermez
          await provider.provider.disconnect();
        }

        return;
      }

      dispatch(globalThunks.setHermezEnvironment(chainId, chainName));

      const address = await signer.getAddress();
      const hermezAddress = hermez.Addresses.getHermezAddress(address);
      const providerOrSigner =
        walletName === loginActions.WalletName.WALLET_CONNECT ? provider : signer;
      const signature = await signMessageHelper(
        providerOrSigner,
        hermez.Constants.METAMASK_MESSAGE,
        address
      );
      const hashedSignature = keccak256(signature);
      const signatureBuffer = hermez.Utils.hexToBuffer(hashedSignature);
      const wallet = new hermez.HermezWallet.HermezWallet(signatureBuffer, hermezAddress);
      const {
        login: { step },
      } = getState();

      if (step.type === "wallet-loader") {
        dispatch(globalActions.loadWallet(wallet));
        const signerDataWithAddress: Signers.SignerData = {
          ...signerData,
          addressOrIndex: address,
        };
        dispatch(globalActions.setSigner(signerDataWithAddress));
        dispatch(loginActions.goToCreateAccountAuthStep(wallet));
      }
    } catch (error) {
      const {
        login: { step },
      } = getState();
      if (step.type === "wallet-loader") {
        const stringError = persistence.getErrorMessage(error);
        dispatch(loginActions.loadWalletFailure(stringError));
        dispatch(globalActions.openSnackbar(stringError));
        dispatch(loginActions.goToPreviousStep());
      }
    }
  };
}

/**
 * Find out if the coordinator has the ability to create accounts associated
 * with an Ethereum address.
 */
async function getCreateAccountAuthorization(
  hermezEthereumAddress: string
): Promise<string | null> {
  try {
    const { signature } = await hermez.CoordinatorAPI.getCreateAccountAuthorization(
      hermezEthereumAddress
    );
    return signature;
  } catch {
    return null;
  }
}

export interface SignatureAuth {
  signature: string;
  sendSignature: boolean;
}

async function getSignature(
  wallet: HermezWallet.HermezWallet,
  storageSignature: string
): Promise<SignatureAuth> {
  if (storageSignature) {
    return { signature: storageSignature, sendSignature: true };
  }

  const apiSignature = await getCreateAccountAuthorization(wallet.hermezEthereumAddress);

  if (apiSignature) {
    return { signature: apiSignature, sendSignature: false };
  }
  const signature = await wallet.signCreateAccountAuthorization();

  return { signature, sendSignature: true };
}

/**
 * Sends a create account authorization request if it hasn't been done
 * for the current coordinator
 */
function postCreateAccountAuthorization(wallet: HermezWallet.HermezWallet): AppThunk {
  return async (dispatch: AppDispatch, getState: () => AppState) => {
    const {
      login: { accountAuthSignatures },
      global: { redirectRoute, ethereumNetworkTask, coordinatorStateTask },
    } = getState();
    if (
      (coordinatorStateTask.status === "successful" ||
        coordinatorStateTask.status === "reloading") &&
      (ethereumNetworkTask.status === "successful" || ethereumNetworkTask.status === "reloading")
    ) {
      const nextForgerUrls = getNextForgerUrls(coordinatorStateTask.data);
      const chainIdSignatures = accountAuthSignatures[ethereumNetworkTask.data.chainId] || {};
      const storageSignature = chainIdSignatures[wallet.hermezEthereumAddress];

      try {
        const { signature, sendSignature } = await getSignature(wallet, storageSignature);

        dispatch(setAccountAuthSignature(wallet.hermezEthereumAddress, signature));

        if (sendSignature) {
          await persistence.postCreateAccountAuthorization(
            wallet.hermezEthereumAddress,
            wallet.publicKeyBase64,
            signature,
            nextForgerUrls
          );
        }

        dispatch(loginActions.addAccountAuthSuccess());
        dispatch(push(redirectRoute));
      } catch (error) {
        console.error(error);
        const stringError = persistence.getErrorMessage(error);
        dispatch(loginActions.addAccountAuthFailure(stringError));
        dispatch(globalActions.openSnackbar(stringError));
        dispatch(loginActions.goToWalletSelectorStep());
      }
    }
  };
}

/**
 * Saves already created Create Account Authorization signatures in LocalStorage
 */
function setAccountAuthSignature(hermezEthereumAddress: string, signature: string): AppThunk {
  return (dispatch: AppDispatch, getState: () => AppState) => {
    const {
      global: { ethereumNetworkTask },
    } = getState();
    if (ethereumNetworkTask.status === "successful" || ethereumNetworkTask.status === "reloading") {
      const {
        data: { chainId },
      } = ethereumNetworkTask;

      const authSignatures = getAuthSignatures();
      const chainAuthSignatures = authSignatures[chainId] || {};
      const newAccountAuthSignature = {
        ...authSignatures,
        [chainId]: {
          ...chainAuthSignatures,
          [hermezEthereumAddress]: signature,
        },
      };
      setAuthSignatures(newAccountAuthSignature);
      dispatch(loginActions.setAccountAuthSignature(chainId, hermezEthereumAddress, signature));
    }
  };
}

export { fetchWallet, postCreateAccountAuthorization, setAccountAuthSignature };
