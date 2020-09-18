import * as accountDetailsActionTypes from './account-details.actions'
import * as rollupApi from '../../apis/rollup'

function fetchAccount (accountIndex) {
  return (dispatch) => {
    dispatch(accountDetailsActionTypes.loadAccount())

    return rollupApi.getAccount(accountIndex)
      .then(res => dispatch(accountDetailsActionTypes.loadAccountSuccess(res)))
      .catch(err => dispatch(accountDetailsActionTypes.loadAccountFailure(err)))
  }
}

function fetchUSDTokenExchangeRate (tokenId) {
  return (dispatch) => {
    dispatch(accountDetailsActionTypes.loadUSDTokenExchangeRate())

    return rollupApi.getToken(tokenId)
      .then(res => dispatch(accountDetailsActionTypes.loadUSDTokenExchangeRateSuccess({ [res.symbol]: res.USD })))
      .catch(err => dispatch(accountDetailsActionTypes.loadUSDTokenExchangeRateFailure(err)))
  }
}

function fetchTransactions (ethereumAddress, tokenId) {
  return (dispatch) => {
    dispatch(accountDetailsActionTypes.loadTransactions())

    return rollupApi.getTransactions(ethereumAddress, tokenId)
      .then(res => dispatch(accountDetailsActionTypes.loadTransactionsSuccess(res)))
      .catch(err => dispatch(accountDetailsActionTypes.loadTransactionsFailure(err)))
  }
}

export { fetchAccount, fetchUSDTokenExchangeRate, fetchTransactions }
