export const transactionActionTypes = {
  LOAD_TOKENS: '[TRANSACTION] LOAD TOKENS',
  LOAD_TOKENS_SUCCESS: '[TRANSACTION] LOAD TOKENS SUCCESS',
  LOAD_TOKENS_FAILURE: '[TRANSACTION] LOAD TOKENS FAILURE',
  LOAD_METAMASK_TOKENS: '[TRANSACTION] LOAD METAMASK TOKENS',
  LOAD_METAMASK_TOKENS_SUCCESS: '[TRANSACTION] LOAD METAMASK TOKENS SUCCESS',
  LOAD_METAMASK_TOKENS_FAILURE: '[TRANSACTION] LOAD METAMASK TOKENS FAILURE',
  LOAD_FEES: '[TRANSACTION] LOAD FEES',
  LOAD_FEES_SUCCESS: '[TRANSACTION] LOAD FEES SUCCESS',
  LOAD_FEES_FAILURE: '[TRANSACTION] LOAD FEESFAILURE'
}

function loadTokens () {
  return {
    type: transactionActionTypes.LOAD_TOKENS
  }
}

function loadTokensSuccess (tokens) {
  return {
    type: transactionActionTypes.LOAD_TOKENS_SUCCESS,
    tokens
  }
}

function loadTokensFailure () {
  return {
    type: transactionActionTypes.LOAD_TOKENS_FAILURE
  }
}

function loadMetaMaskTokens () {
  return {
    type: transactionActionTypes.LOAD_METAMASK_TOKENS
  }
}

function loadMetaMaskTokensSuccess (metaMaskTokens) {
  return {
    type: transactionActionTypes.LOAD_METAMASK_TOKENS_SUCCESS,
    metaMaskTokens
  }
}

function loadMetaMaskTokensFailure (error) {
  return {
    type: transactionActionTypes.LOAD_METAMASK_TOKENS_FAILURE,
    error
  }
}

function loadFees () {
  return {
    type: transactionActionTypes.LOAD_FEES
  }
}

function loadFeesSuccess (fees) {
  return {
    type: transactionActionTypes.LOAD_FEES_SUCCESS,
    fees
  }
}

function loadFeesFailure (error) {
  return {
    type: transactionActionTypes.LOAD_FEES_FAILURE,
    error
  }
}

export {
  loadTokens,
  loadTokensSuccess,
  loadTokensFailure,
  loadMetaMaskTokens,
  loadMetaMaskTokensSuccess,
  loadMetaMaskTokensFailure,
  loadFees,
  loadFeesSuccess,
  loadFeesFailure
}
