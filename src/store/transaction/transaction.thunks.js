import { CoordinatorAPI } from 'hermezjs'

import * as transactionActions from './transaction.actions'
import { TransactionType } from '../../views/transaction/transaction.view'
import { getMetaMaskTokens } from '../../utils/metamask'

function fetchAccount (tokenId, transactionType) {
  return (dispatch, getState) => {
    const { global: { metaMaskWalletTask } } = getState()

    dispatch(transactionActions.loadAccount())

    if (metaMaskWalletTask.status !== 'successful') {
      return dispatch(transactionActions.loadAccountFailure('MetaMask wallet is not loaded'))
    }

    if (transactionType === TransactionType.Deposit) {
      return CoordinatorAPI.getTokens()
        .then((hermezTokens) => {
          getMetaMaskTokens(metaMaskWalletTask.data, hermezTokens)
            .then(metaMaskTokens => {
              const account = metaMaskTokens.find((account) => account.id === tokenId)

              dispatch(transactionActions.loadAccountSuccess(account))
            })
            .catch(error => dispatch(transactionActions.loadAccountFailure(error.message)))
        })
    } else {
      return CoordinatorAPI.getAccounts(
        metaMaskWalletTask.data.hermezEthereumAddress,
        [tokenId]
      )
        .then((res) => dispatch(transactionActions.loadAccountSuccess(res.accounts[0])))
        .catch(error => dispatch(transactionActions.loadAccountFailure(error.message)))
    }
  }
}

function fetchExit (tokenId, batchNum, accountIndex) {
  return async function (dispatch, getState) {
    const { global: { metaMaskWalletTask } } = getState()

    if (metaMaskWalletTask.status !== 'successful') {
      return dispatch(transactionActions.loadAccountFailure('MetaMask wallet is not loaded'))
    }

    dispatch(transactionActions.loadExit())

    Promise.all([
      CoordinatorAPI.getAccounts(metaMaskWalletTask.data.hermezEthereumAddress, [tokenId]),
      CoordinatorAPI.getExit(batchNum, accountIndex)
    ]).then(([accountsRes, exit]) => {
      dispatch(transactionActions.loadExitSuccess(accountsRes.accounts[0], exit, metaMaskWalletTask.data.hermezEthereumAddress))
    }).catch(err => dispatch(transactionActions.loadExitFailure(err.message)))
  }
}

/**
 * Fetches all accounts for a hermezEthereumAddress
 */
function fetchAccounts (transactionType, fromItem) {
  return (dispatch, getState) => {
    const { global: { metaMaskWalletTask } } = getState()

    dispatch(transactionActions.loadAccounts())

    if (metaMaskWalletTask.status !== 'successful') {
      return dispatch(transactionActions.loadAccountsFailure('MetaMask wallet is not loaded'))
    }

    // TODO: Remove the ForceExit from the if when the Hermez node is ready
    if (transactionType === TransactionType.Deposit || transactionType === TransactionType.ForceExit) {
      return CoordinatorAPI.getTokens()
        .then((res) => {
          getMetaMaskTokens(metaMaskWalletTask.data, res.tokens)
            .then(metaMaskTokens => dispatch(transactionActions.loadAccountsSuccess(transactionType, metaMaskTokens)))
            .catch(err => transactionActions.loadAccountsFailure(err.message))
        })
    } else {
      return CoordinatorAPI.getAccounts(metaMaskWalletTask.data.hermezEthereumAddress, fromItem)
        .then(res => dispatch(transactionActions.loadAccountsSuccess(transactionType, res)))
        .catch(err => transactionActions.loadAccountsFailure(err.message))
    }
  }
}

/**
 * Fetches the recommended fees from the Coordinator
 */
function fetchFees () {
  return async function (dispatch) {
    dispatch(transactionActions.loadFees())

    return CoordinatorAPI.getState()
      .then(res => dispatch(transactionActions.loadFeesSuccess(res.recommendedFee)))
      .catch(err => dispatch(transactionActions.loadFeesFailure(err)))
  }
}

export {
  fetchAccount,
  fetchExit,
  fetchAccounts,
  fetchFees
}