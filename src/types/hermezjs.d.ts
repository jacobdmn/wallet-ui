/**
 * HermezJS Type Definitions
 *
 * Some types and props are currently commented because are not used by this app.
 * They are kept in case we eventually decide to move this typings file to the
 * HermezJS library to enable it with TypeScript support.
 * */
declare module "@hermeznetwork/*" {
  import { TxState, TxType } from "@hermeznetwork/hermezjs/src/enums";

  // We expose the inputs supported by both, the native BigInt constructor (scalar_native)
  // and the BigNumber.js lib (scalar_bigint case) used by ffjavascript.
  export type ScalarValue = string | number | bigint;

  export type ISOStringDate = string;

  export type FiatExchangeRates = Record<string, number>;

  export interface HermezApiResourceItem {
    itemId: number;
  }

  export type Token = HermezApiResourceItem & {
    decimals: number;
    ethereumAddress: string;
    ethereumBlockNum: number;
    id: number;
    name: string;
    symbol: string;
    USD: number | null;
    // fiatUpdate: ISOStringDate | null;
  };

  export interface L1Info {
    // amountSuccess: boolean;
    depositAmount: string;
    // depositAmountSuccess: boolean;
    // ethereumBlockNum: number;
    // historicDepositAmountUSD: number | null;
    // toForgeL1TransactionsNum: number | null;
    // userOrigin: boolean;
  }

  export interface L2Info {
    fee: number;
    historicFeeUSD: number | null;
    // nonce: number;
  }

  export interface MerkleProof {
    root: string;
    siblings: string[];
    // fnc: number;
    // isOld0: boolean;
    // key: string;
    // oldKey: string;
    // oldValue: string;
    // value: string;
  }

  export type Exit = HermezApiResourceItem & {
    accountIndex: string;
    batchNum: number;
    delayedWithdraw: number | null;
    instantWithdraw: number | null;
    token: Token;
    merkleProof: MerkleProof;
    balance: string;
    // bjj: string;
    delayedWithdrawRequest: number | null;
    // fee: number;
    // hash: string;
    // hezEthereumAddress: string;
  };

  export type HistoryTransaction = HermezApiResourceItem & {
    batchNum: number | null;
    fromAccountIndex: string | null;
    fromHezEthereumAddress: string | null;
    id: string;
    toHezEthereumAddress: string | null;
    type: TxType;
    amount: string;
    // fromBJJ: string | null;
    historicUSD: number | null;
    L1Info: L1Info | null;
    L1orL2: "L1" | "L2";
    L2Info: L2Info | null;
    // position: number;
    timestamp: ISOStringDate;
    // toAccountIndex: string;
    toBJJ: string | null;
    token: Token;
  };

  export type PoolTransaction = HermezApiResourceItem & {
    amount: string;
    errorCode?: number | null;
    fee: number;
    fromAccountIndex: string;
    fromBJJ: string | null;
    fromHezEthereumAddress: string | null;
    state: TxState;
    timestamp: ISOStringDate;
    toAccountIndex: string | null;
    toBJJ: string | null;
    toHezEthereumAddress: string | null;
    token: Token;
    type: TxType;
    batchNum?: number | null;
    id: string;
    // errorType?: string | null;
    // info: string | null;
    // maxNumBatch?: number;
    // nonce: number;
    // requestAmount: string | null;
    // requestFee: number | null;
    // requestFromAccountIndex: string | null;
    // requestNonce: number | null;
    // requestToAccountIndex: string | null;
    // requestToBJJ: string | null;
    // requestToHezEthereumAddress: string | null;
    // requestTokenId: number | null;
    // signature: string;
  };

  export type Account = HermezApiResourceItem & {
    accountIndex: string;
    balance: string;
    bjj: string;
    hezEthereumAddress: string;
    // nonce: number;
    token: Token;
  };

  // Coordinator State
  export interface CoordinatorState {
    node: Node;
    network: Network;
    // metrics: Metrics;
    // rollup: Rollup;
    // auction: Auction;
    withdrawalDelayer: WithdrawalDelayer;
    recommendedFee: RecommendedFee;
  }

  interface Node {
    forgeDelay: number;
    poolLoad: number;
  }

  // interface CollectedFees;

  type Batch = HermezApiResourceItem & {
    //   batchNum: number;
    //   ethereumTxHash: string;
    //   ethereumBlockNum: number;
    //   ethereumBlockHash: string;
    timestamp: ISOStringDate;
    //   forgerAddr: string;
    //   collectedFees: CollectedFees;
    //   historicTotalCollectedFeesUSD: number;
    //   stateRoot: string;
    //   numAccounts: number;
    //   exitRoot: string;
    //   forgeL1TransactionsNum: number;
    //   slotNum: number;
    //   forgedTransactions: number;
  };

  type Coordinator = HermezApiResourceItem & {
    // bidderAddr: string;
    forgerAddr: string;
    // ethereumBlock: number;
    URL: string;
  };

  interface Period {
    // slotNum: number;
    // fromBlock: number;
    // toBlock: number;
    // fromTimestamp: ISOStringDate;
    toTimestamp: ISOStringDate;
  }

  export interface NextForger {
    coordinator: Coordinator;
    period: Period;
  }

  interface Network {
    // lastEthereumBlock: number;
    // lastSynchedBlock: number;
    lastBatch: Batch;
    // currentSlot: number;
    nextForgers: NextForger[];
    // pendingL1Transactions?: number;
  }

  // interface Metrics {
  //   transactionsPerBatch: number;
  //   batchFrequency: number;
  //   transactionsPerSecond: number;
  //   tokenAccounts: number;
  //   wallets: number;
  //   avgTransactionFee: number;
  //   estimatedTimeToForgeL1: number;
  // };

  // interface Bucket {
  //   ceilUSD: string;
  //   blockStamp: string;
  //   withdrawals: string;
  //   rateBlocks: string;
  //   rateWithdrawals: string;
  //   maxWithdrawals: string;
  // };

  // interface Rollup {
  //   ethereumBlockNum: number;
  //   feeAddToken: string;
  //   forgeL1L2BatchTimeout: number;
  //   withdrawalDelay: number;
  //   buckets: Bucket[];
  //   safeMode: boolean;
  // };

  // interface Auction {
  //   ethereumBlockNum: number;
  //   donationAddress: string;
  //   bootCoordinator: string;
  //   bootCoordinatorUrl: string;
  //   defaultSlotSetBid: string[];
  //   defaultSlotSetBidSlotNum?: number;
  //   closedAuctionSlots: number;
  //   openAuctionSlots: number;
  //   allocationRatio: number[];
  //   outbidding: number;
  //   slotDeadline: number;
  // };

  interface WithdrawalDelayer {
    // ethereumBlockNum: number;
    // hermezGovernanceAddress: string;
    // emergencyCouncilAddress: string;
    withdrawalDelay: number;
    // emergencyModeStartingBlock: number;
    emergencyMode: boolean;
  }

  export interface RecommendedFee {
    existingAccount: number;
    createAccount: number;
    createAccountInternal: number;
  }

  // persistence
  export interface HistoryTransactions {
    transactions: HistoryTransaction[];
    pendingItems: number;
  }

  export interface Exits {
    exits: Exit[];
    pendingItems: number;
  }

  export interface Accounts {
    accounts: Account[];
    pendingItems: number;
  }

  export interface Tokens {
    tokens: Token[];
    pendingItems: number;
  }

  export interface AccountAuthorization {
    signature: string;
    // bjj: string;
    // hezEthereumAddress: string;
    // timestamp: ISOStringDate;
  }

  // library modules
  export { default as HermezWallet } from "@hermeznetwork/hermezjs/src/hermez-wallet";
  export { default as Utils } from "@hermeznetwork/hermezjs/src/utils";
  export { default as Tx } from "@hermeznetwork/hermezjs/src/tx";
  export { default as TxUtils } from "@hermeznetwork/hermezjs/src/tx-utils";
  export { default as TxFees } from "@hermeznetwork/hermezjs/src/tx-fees";
  export { default as TxPool } from "@hermeznetwork/hermezjs/src/tx-pool";
  export { default as CoordinatorAPI } from "@hermeznetwork/hermezjs/src/api";
  export { default as Constants } from "@hermeznetwork/hermezjs/src/constants";
  export { default as HermezCompressedAmount } from "@hermeznetwork/hermezjs/src/hermez-compressed-amount";
  export { default as Addresses } from "@hermeznetwork/hermezjs/src/addresses";
  export { default as Providers } from "@hermeznetwork/hermezjs/src/providers";
  export { default as Signers } from "@hermeznetwork/hermezjs/src/signers";
  export { default as Environment } from "@hermeznetwork/hermezjs/src/environment";
  export { default as Enums } from "@hermeznetwork/hermezjs/src/enums";
  export { default as AtomicUtils } from "@hermeznetwork/hermezjs/src/atomic-utils";
  export { default as HTTP } from "@hermeznetwork/hermezjs/src/http";
}

// Wallet
declare module "@hermeznetwork/hermezjs/src/hermez-wallet" {
  import { SignerData } from "@hermeznetwork/hermezjs/src/signers";
  export class HermezWallet {
    constructor(privateKey: Buffer, hermezEthereumAddress: string);
    privateKey: Buffer;
    hermezEthereumAddress: string;
    publicKeyBase64: string;
    publicKeyCompressedHex: string;
    // publicKey: string[];
    // publicKeyHex: string[];
    // publicKeyCompressed: string;
    // signTransaction (transaction, encodedTransaction): HistoryTransaction;
    signCreateAccountAuthorization(providerUrl?: string, signerData?: SignerData): Promise<string>;
  }

  // function createWalletFromEtherAccount();
  // function createWalletFromBjjPvtKey();
}

// Utils
declare module "@hermeznetwork/hermezjs/src/utils" {
  import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
  // function bufToHex();
  function hexToBuffer(hex: string): Buffer;
  function getTokenAmountString(amountBigInt: BigNumberish, decimals: number): string;
  function getTokenAmountBigInt(amountString: BigNumberish, decimals: number): BigNumber;
  // function padZeros();
  // function extract();
  // function getRandomBytes();
}

// Tx
declare module "@hermeznetwork/hermezjs/src/tx" {
  import {
    Token,
    HermezWallet,
    Exit,
    Signers,
    HermezCompressedAmount,
    MerkleProof,
  } from "@hermeznetwork/hermezjs";
  import { TxType } from "@hermeznetwork/hermezjs/src/enums";
  import { SignerData } from "@hermeznetwork/hermezjs/src/signers";

  export interface TxData {
    hash: string;
    // type: number;
    // accessList: unknown;
    // blockHash: unknown;
    // blockNumber: unknown;
    // transactionIndex: unknown;
    // confirmations: number;
    // from: string;
    // gasPrice: BigNumber;
    // maxPriorityFeePerGas: BigNumber;
    // maxFeePerGas: BigNumber;
    // gasLimit: BigNumber;
    // to: string;
    // value: BigNumber;
    // nonce: number;
    // data: string;
    // r: string;
    // s: string;
    // v: number;
    // creates: unknown;
    // chainId: number;
  }

  interface Tx {
    type: TxType;
    from: string;
    to: string | null;
    amount: HermezCompressedAmount;
    fee: number;
    nonce?: number;
    maxNumBatch?: number;
  }

  interface SendL2TransactionResponse {
    status: number;
    id: string;
    nonce: number;
  }

  function deposit(
    amount: HermezCompressedAmount,
    hezEthereumAddress: string,
    token: Token,
    babyJubJub: string,
    signerData: SignerData,
    providerUrl?: string,
    gasLimit?: number,
    gasMultiplier?: number
  ): Promise<TxData>;

  // function withdraw();
  function isInstantWithdrawalAllowed(
    amount: string,
    accountIndex: string,
    token: Token,
    babyJubJub: string,
    batchNum?: number,
    merkleProofSiblings?: MerkleProof["siblings"]
  ): Promise<unknown[]>;
  // function sendL2Transaction();

  function generateAndSendL2Tx(
    tx: Tx,
    wallet: HermezWallet.HermezWallet,
    token: Token,
    nextForgers: string[],
    addToTxPool?: boolean
  ): Promise<SendL2TransactionResponse>;

  function withdrawCircuit(
    exit: Exit,
    isInstant: boolean,
    wasmFilePath: string,
    zkeyFilePath: string,
    signerData: Signers.SignerData
  ): Promise<TxData>;

  function delayedWithdraw(
    hezEthereumAddress: string,
    token: Token,
    signerData: Signers.SignerData
  ): Promise<TxData>;

  function forceExit(
    amount: HermezCompressedAmount,
    accountIndex: string,
    token: Token,
    signerData: Signers.SignerData
  ): Promise<TxData>;

  // function sendAtomicGroup();
  // function generateAndSendAtomicGroup();
}

// TxUtils
declare module "@hermeznetwork/hermezjs/src/tx-utils" {
  import { ScalarValue } from "@hermeznetwork/hermezjs";
  import { TxType } from "@hermeznetwork/hermezjs/src/enums";
  import { Tx } from "@hermeznetwork/hermezjs/src/tx";

  // function _encodeTransaction();

  function getL1UserTxId(toForgeL1TxsNum: number, currentPosition: number): string;

  // function getL2TxId();
  function getFeeIndex(fee: ScalarValue, amount: ScalarValue): number;

  function getFeeValue(feeIndex: number, amount: ScalarValue): bigint;

  function getMaxAmountFromMinimumFee(minimumFee: ScalarValue, balance: ScalarValue): ScalarValue;

  function getTransactionType(transaction: Pick<Tx, "to">): TxType;

  // function getNonce();
  // function _buildTxCompressedData();
  // function buildTransactionHashMessage();
  // function buildTxCompressedDataV2();
  // function generateL2Transaction();
  // function computeL2Transaction();
  // function generateAtomicTransaction();
  // function beautifyTransactionStat();
}

// TxFees
declare module "@hermeznetwork/hermezjs/src/tx-fees" {
  import { Token, Signers } from "@hermeznetwork/hermezjs";
  import { CallOverrides, BigNumber } from "ethers";

  // function estimateDepositGasLimit();
  // function estimateWithdrawGasLimit();

  function estimateWithdrawCircuitGasLimit(
    token: Token,
    amount: BigNumber,
    overrides: CallOverrides,
    isInstant: boolean,
    signerData?: Signers.SignerData,
    providerUrl?: string
  ): Promise<number>;
}

// TxPool
declare module "@hermeznetwork/hermezjs/src/tx-pool" {
  import { PoolTransaction } from "@hermeznetwork/hermezjs";
  import { PaginationOrder } from "@hermeznetwork/hermezjs/src/api";

  function initializeTransactionPool(): void;

  function getPoolTransactions(
    address: string | undefined,
    state: string,
    type?: string,
    tokenId?: number,
    accountIndex?: string,
    fromItem?: number,
    order?: PaginationOrder,
    limit?: number,
    axiosConfig?: Record<string, unknown>
  ): Promise<PoolTransaction[]>;

  // function addPoolTransaction();
  // function removePoolTransaction();
}

// CoordinatorAPI
declare module "@hermeznetwork/hermezjs/src/api" {
  import {
    Account,
    Accounts,
    HistoryTransaction,
    Exit,
    Exits,
    HistoryTransactions,
    CoordinatorState,
    Token,
    Tokens,
    PoolTransaction,
    AccountAuthorization,
  } from "@hermeznetwork/hermezjs";

  export type PaginationOrder = "ASC" | "DESC";

  // function _getPageData();
  // function setBaseApiUrl();
  // function getBaseApiUrl();

  function getAccounts(
    address: string,
    tokenIds?: number[],
    fromItem?: number,
    order?: PaginationOrder,
    limit?: number,
    axiosConfig?: Record<string, unknown>
  ): Promise<Accounts>;

  function getAccount(accountIndex: string): Promise<Account>;

  function getTransactions(
    address?: string,
    tokenId?: number,
    batchNum?: number,
    accountIndex?: string,
    fromItem?: number,
    order?: PaginationOrder,
    limit?: number,
    axiosConfig?: Record<string, unknown>
  ): Promise<HistoryTransactions>;

  function getHistoryTransaction(
    transactionId: string,
    axiosConfig?: Record<string, unknown>
  ): Promise<HistoryTransaction>;

  function getPoolTransaction(
    transactionId: string,
    axiosConfig?: Record<string, unknown>
  ): Promise<PoolTransaction>;

  // function postPoolTransaction();
  // function postAtomicGroup();

  function getExit(
    batchNum: number,
    accountIndex: string,
    axiosConfig?: Record<string, unknown>
  ): Promise<Exit>;

  function getExits(
    address: string,
    onlyPendingWithdraws: boolean,
    tokenId?: number,
    fromItem?: number
  ): Promise<Exits>;

  function getTokens(
    tokenIds?: number[],
    tokenSymbols?: string[],
    fromItem?: number,
    order?: PaginationOrder,
    limit?: number,
    axiosConfig?: Record<string, unknown>
  ): Promise<Tokens>;

  function getToken(tokenId: number): Promise<Token>;

  function getState(
    axiosConfig?: Record<string, unknown>,
    apiUrl?: string
  ): Promise<CoordinatorState>;

  // function getBatches();
  // function getBatch();
  // function getCoordinators();
  // function getSlot();
  // function getBids();

  function getCreateAccountAuthorization(
    hezEthereumAddress: string,
    axiosConfig?: Record<string, unknown>
  ): Promise<AccountAuthorization>;

  type PostCreateAccountAuthorizationResponse =
    | {
        success: "OK";
      }
    | { message: string; code: number; type: string };

  function postCreateAccountAuthorization(
    hezEthereumAddress: string,
    bJJ: string,
    signature: string,
    nextForgerUrls?: string[],
    axiosConfig?: Record<string, unknown>
  ): Promise<PostCreateAccountAuthorizationResponse>;
  // function getCreateAccountAuthorization();
  // function getConfig();

  function getPoolTransactions(
    accountIndex: string,
    publicKeyCompressedHex: string
  ): Promise<HistoryTransaction[]>;

  // function getHealth();
}

// Constants
declare module "@hermeznetwork/hermezjs/src/constants" {
  // const TRANSACTION_POOL_KEY: string;
  const METAMASK_MESSAGE: string;
  // const CREATE_ACCOUNT_AUTH_MESSAGE: string;
  // const EIP_712_VERSION: string;
  // const EIP_712_PROVIDER: string;
  const ETHER_TOKEN_ID: number;
  // const GAS_LIMIT: number;
  // const GAS_LIMIT_HIGH: number;
  const GAS_LIMIT_LOW: number;
  // const GAS_STANDARD_ERC20_TX: number;
  // const GAS_LIMIT_WITHDRAW: number;
  // const SIBLING_GAS_COST: number;
  // const NON_INSTANT_WITHDRAW_ERC20_GAS_COST: number;
  // const NON_INSTANT_WITHDRAW_ETH_GAS_COST: number;
  // const GAS_MULTIPLIER: number;
  // const DEFAULT_PAGE_SIZE: number;
  // const API_VERSION: string;
  // const BASE_API_URL: string;
  // const BATCH_EXPLORER_URL: string;
  // const ETHERSCAN_URL: string;
  const ContractNames: {
    Hermez: string;
    WithdrawalDelayer: string;
  };
  // const CONTRACT_ADDRESSES: Record<string, string>;
  // const STORAGE_VERSION_KEY: string;
  // const STORAGE_VERSION: number;
  // const APPROVE_AMOUNT: string;
  const INTERNAL_ACCOUNT_ETH_ADDR: string;
  // const EMPTY_BJJ_ADDR: string;
  // const MAX_NLEVELS: number;
  // const WITHDRAWAL_CIRCUIT_NLEVELS: number;
  // const WITHDRAWAL_WASM_URL: string;
  // const WITHDRAWAL_ZKEY_URL: string;
  // const ETHER_ADDRESS: string;
  // const TX_ID_BYTES: number;
}

// HermezCompressedAmount
declare module "@hermeznetwork/hermezjs/src/hermez-compressed-amount" {
  import { ScalarValue } from "@hermeznetwork/hermezjs";

  export default class HermezCompressedAmount {
    constructor(value: number);
    static type: "HermezCompressedAmount";
    static value: number;
    // static isHermezCompressedAmount(instance: HermezCompressedAmount): boolean;
    static decompressAmount(hermezCompressedAmount: HermezCompressedAmount): ScalarValue;
    static compressAmount(value: string): HermezCompressedAmount;
    static floorCompressAmount(value: ScalarValue): HermezCompressedAmount;
  }
}

// Addresses
declare module "@hermeznetwork/hermezjs/src/addresses" {
  function getHermezAddress(ethereumAddress: string): string;

  function getEthereumAddress(accountIndex: string): string;

  function isHermezEthereumAddress(addressToCheck: string): boolean;

  function isHermezBjjAddress(addressToCheck: string): boolean;

  function isEthereumAddress(addressToCheck: string): boolean;

  // function isHermezAccountIndex();
  // function getAccountIndex();
  // function hexToBase64BJJ();
  // function base64ToHexBJJ();
  // function getAySignFromBJJ();
}

// Providers
declare module "@hermeznetwork/hermezjs/src/providers" {
  import { Web3Provider } from "@ethersproject/providers";

  const PROVIDER_TYPES: {
    WEB3: "web3";
  };
  function setProvider(
    providerData?: string | Record<string, unknown>,
    providerType?: string
  ): Web3Provider;

  function getProvider(
    providerData?: string | Record<string, unknown>,
    providerType?: string
  ): Web3Provider;
}

// Signers
declare module "@hermeznetwork/hermezjs/src/signers" {
  import { Web3Provider } from "@ethersproject/providers";
  import { Signer } from "@ethersproject/abstract-signer";

  export enum SignerType {
    JSON_RPC = "JSON-RPC",
    WALLET = "WALLET",
  }

  export interface JsonRpcSignerData {
    type: "JSON-RPC";
    addressOrIndex?: null | string | number;
  }

  export interface WalletSignerData {
    type: "WALLET";
    privateKey: string;
  }

  export type SignerData = JsonRpcSignerData | WalletSignerData;

  function getSigner(provider: Web3Provider, signerData: SignerData): Promise<Signer>;
}

// Environment
declare module "@hermeznetwork/hermezjs/src/environment" {
  function setEnvironment(env: number | Record<string, unknown>): void;

  // function getCurrentEnvironment();
  // function getSupportedEnvironments();

  function isEnvironmentSupported(chainId: number): boolean;

  function getBatchExplorerUrl(): string;
  function getEtherscanUrl(): string;
}

// Enums
declare module "@hermeznetwork/hermezjs/src/enums" {
  export enum TxType {
    Deposit = "Deposit",
    CreateAccountDeposit = "CreateAccountDeposit",
    Transfer = "Transfer",
    TransferToEthAddr = "TransferToEthAddr",
    TransferToBJJ = "TransferToBJJ",
    Withdraw = "Withdrawn",
    Exit = "Exit",
    ForceExit = "ForceExit",
  }

  export enum TxState {
    Forged = "fged",
    Forging = "fing",
    Pending = "pend",
    Invalid = "invl",
  }

  export enum TxLevel {
    L1 = "L1",
    L2 = "L2",
  }
}

// AtomicUtils
declare module "@hermeznetwork/hermezjs/src/atomic-utils" {
  // function hasLinkedTransaction();
  // function addLinkedTransaction();
  // function buildAtomicTransaction();
  // function generateAtomicGroup();
  // function generateAtomicID();
}

// HTTP
declare module "@hermeznetwork/hermezjs/src/http" {
  const HttpStatusCode: {
    NOT_FOUND: 404;
  };

  // function extractJSON()
}

// HermezABI
declare module "@hermeznetwork/hermezjs/src/abis/HermezABI" {
  import { Fragment, JsonFragment } from "@ethersproject/abi";
  const HermezABI: string | ReadonlyArray<Fragment | JsonFragment | string>;
  export default HermezABI;
}
