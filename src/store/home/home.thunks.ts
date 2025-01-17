import axios from "axios";
import { CoordinatorAPI } from "@hermeznetwork/hermezjs";
import { TxType } from "@hermeznetwork/hermezjs/src/enums";
import { getPoolTransactions } from "@hermeznetwork/hermezjs/src/tx-pool";

import { AppState, AppDispatch, AppThunk } from "src/store";
import { createAccount } from "src/utils/accounts";
import { convertTokenAmountToFiat } from "src/utils/currencies";
import * as globalThunks from "src/store/global/global.thunks";
import * as homeActions from "src/store/home/home.actions";
// domain
import { FiatExchangeRates, HermezAccount, PendingDeposit, PoolTransaction } from "src/domain";
import { Accounts } from "src/persistence";

let refreshCancelTokenSource = axios.CancelToken.source();

/**
 * Fetches the accounts for a Hermez Ethereum address and calculates the total balance.
 */
function fetchTotalBalance(
  hermezEthereumAddress: string,
  poolTransactions: PoolTransaction[],
  pendingDeposits: PendingDeposit[],
  fiatExchangeRates: FiatExchangeRates,
  preferredCurrency: string
): AppThunk {
  return (dispatch: AppDispatch, getState: () => AppState) => {
    const {
      global: { tokensPriceTask },
    } = getState();
    dispatch(homeActions.loadTotalBalance());

    return CoordinatorAPI.getAccounts(hermezEthereumAddress, undefined, undefined, undefined, 2049)
      .then((res) => {
        const accounts = res.accounts.map((account) =>
          createAccount(
            account,
            poolTransactions,
            pendingDeposits,
            tokensPriceTask,
            preferredCurrency,
            fiatExchangeRates
          )
        );

        return { ...res, accounts };
      })
      .then((res) => {
        const pendingCreateAccountDeposits = pendingDeposits.filter(
          (deposit) => deposit.type === TxType.CreateAccountDeposit
        );
        const totalPendingCreateAccountDepositsBalance = pendingCreateAccountDeposits.reduce(
          (totalBalance, deposit) => {
            const tokenPrice =
              tokensPriceTask.status === "successful"
                ? { ...tokensPriceTask.data[deposit.token.id] }
                : { ...deposit.token };

            const fiatBalance = convertTokenAmountToFiat(
              deposit.amount,
              tokenPrice,
              preferredCurrency,
              fiatExchangeRates
            );

            return totalBalance + Number(fiatBalance);
          },
          0
        );
        const totalAccountsBalance = res.accounts.reduce((totalBalance, account) => {
          return account.fiatBalance !== undefined
            ? totalBalance + Number(account.fiatBalance)
            : totalBalance;
        }, 0);
        const totalBalance = totalPendingCreateAccountDepositsBalance + totalAccountsBalance;

        dispatch(homeActions.loadTotalBalanceSuccess(totalBalance));
      })
      .catch((err) => dispatch(homeActions.loadTotalBalanceFailure(err)));
  };
}

/**
 * Fetches the accounts for a Hermez address
 */
function fetchAccounts(
  hermezAddress: string,
  poolTransactions: PoolTransaction[],
  pendingDeposits: PendingDeposit[],
  preferredCurrency: string,
  fiatExchangeRates?: FiatExchangeRates,
  fromItem?: number
): AppThunk {
  return (dispatch: AppDispatch, getState: () => AppState) => {
    const {
      home: { accountsTask },
      global: { tokensPriceTask },
    } = getState();

    if (fromItem === undefined && accountsTask.status === "successful") {
      return dispatch(
        refreshAccounts(
          hermezAddress,
          poolTransactions,
          pendingDeposits,
          preferredCurrency,
          fiatExchangeRates
        )
      );
    }

    dispatch(homeActions.loadAccounts());

    if (fromItem) {
      refreshCancelTokenSource.cancel();
    }

    return CoordinatorAPI.getAccounts(hermezAddress, undefined, fromItem, undefined)
      .then((res) => {
        const accounts = res.accounts.map((account) =>
          createAccount(
            account,
            poolTransactions,
            pendingDeposits,
            tokensPriceTask,
            preferredCurrency,
            fiatExchangeRates
          )
        );

        return { ...res, accounts };
      })
      .then((res) => dispatch(homeActions.loadAccountsSuccess(res)))
      .catch((err) => dispatch(homeActions.loadAccountsFailure(err)));
  };
}

/**
 * Refreshes the accounts information for the accounts that have already been
 * loaded
 */
function refreshAccounts(
  hermezAddress: string,
  poolTransactions: PoolTransaction[],
  pendingDeposits: PendingDeposit[],
  preferredCurrency: string,
  fiatExchangeRates?: FiatExchangeRates
): AppThunk {
  return (dispatch: AppDispatch, getState: () => AppState) => {
    const {
      home: { accountsTask },
      global: { tokensPriceTask },
    } = getState();

    if (accountsTask.status === "successful") {
      dispatch(homeActions.refreshAccounts());

      refreshCancelTokenSource = axios.CancelToken.source();

      const axiosConfig = { cancelToken: refreshCancelTokenSource.token };
      const initialReq = CoordinatorAPI.getAccounts(
        hermezAddress,
        undefined,
        undefined,
        undefined,
        undefined,
        axiosConfig
      );
      const requests = accountsTask.data.fromItemHistory.reduce(
        (requests, fromItem) => [
          ...requests,
          CoordinatorAPI.getAccounts(
            hermezAddress,
            undefined,
            fromItem,
            undefined,
            undefined,
            axiosConfig
          ),
        ],
        [initialReq]
      );

      Promise.all(requests)
        .then((results) => {
          const accounts = results
            .reduce((acc: HermezAccount[], result: Accounts) => [...acc, ...result.accounts], [])
            .map((account) =>
              createAccount(
                account,
                poolTransactions,
                pendingDeposits,
                tokensPriceTask,
                preferredCurrency,
                fiatExchangeRates
              )
            );
          const pendingItems = results[results.length - 1]
            ? results[results.length - 1].pendingItems
            : 0;

          return { accounts, pendingItems };
        })
        .then((res) => dispatch(homeActions.refreshAccountsSuccess(res)))
        .catch(() => ({}));
    }
  };
}

/**
 * Fetches the transactions which are in the transactions pool
 */
function fetchPoolTransactions(): AppThunk {
  return (dispatch: AppDispatch, getState: () => AppState) => {
    dispatch(homeActions.loadPoolTransactions());

    const {
      global: { wallet },
    } = getState();

    if (wallet !== undefined) {
      getPoolTransactions(undefined, wallet.publicKeyCompressedHex)
        .then((transactions) => dispatch(homeActions.loadPoolTransactionsSuccess(transactions)))
        .catch((err) => dispatch(homeActions.loadPoolTransactionsFailure(err)));
    }
  };
}

/**
 * Fetches the exit data for transactions of type Exit
 */
function fetchExits(): AppThunk {
  return (dispatch: AppDispatch, getState: () => AppState) => {
    const {
      global: { wallet },
    } = getState();

    if (wallet !== undefined) {
      dispatch(homeActions.loadExits());

      return CoordinatorAPI.getExits(wallet.hermezEthereumAddress, true)
        .then((exits) => {
          dispatch(globalThunks.recoverPendingDelayedWithdrawals(exits));
          dispatch(homeActions.loadExitsSuccess(exits));
        })
        .catch((err) => dispatch(homeActions.loadExitsFailure(err)));
    }
  };
}

export { fetchTotalBalance, fetchAccounts, refreshAccounts, fetchPoolTransactions, fetchExits };
