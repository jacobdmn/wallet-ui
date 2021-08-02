import { CoordinatorAPI } from '@hermeznetwork/hermezjs'

import * as tokenSwapActions from './token-swap.actions'
import * as tokenSwapApi from '../../apis/token-swap'
import { getAccountBalance } from '../../utils/accounts'
import {
  getFixedTokenAmount,
  getTokenAmountInPreferredCurrency
} from '../../utils/currencies'

/**
 * Fetches the accounts for a Hermez address
 * @param {Number} fromItem - id of the first account to be returned from the API
 * @returns {void}
 */
function fetchAccounts (fromItem) {
  return (dispatch, getState) => {
    const {
      global: {
        wallet: { publicKeyBase64: hermezAddress },
        fiatExchangeRatesTask: { data: fiatExchangeRates }
      },
      myAccount: { preferredCurrency }
    } = getState()

    return CoordinatorAPI.getAccounts(
      hermezAddress,
      undefined,
      fromItem,
      undefined
    )
      .then(res => {
        const accounts = res.accounts.map(account => {
          const accountBalance = getAccountBalance(account)

          const fixedTokenAmount = getFixedTokenAmount(
            accountBalance,
            account.token.decimals
          )

          const fiatBalance = getTokenAmountInPreferredCurrency(
            fixedTokenAmount,
            account.token.USD,
            preferredCurrency,
            fiatExchangeRates
          )

          return {
            ...account,
            balance: accountBalance,
            fiatBalance
          }
        })
        return { ...res, accounts }
      })
      .then(res => dispatch(tokenSwapActions.loadAccountsSuccess(res)))
      .catch(err => {
        return dispatch(tokenSwapActions.loadAccountsFailure(err))
      })
  }
}

/**
 * Fetches the accounts for a Hermez address
 * @param {Number} fromItem - id of the first account to be returned from the API
 * @returns {void}
 */
function getQuotes (request) {
  return (dispatch, getState) => {
    dispatch(tokenSwapActions.getQuotes())
    tokenSwapApi.getQuotes(request)
      .then(res => {
        res.quotes.forEach(quote => {
          quote.rate = quote.amountToToken / quote.amountFromToken
        })
        res.quotes = res.quotes.sort((a, b) => {
          return b.rate - a.rate
        })
        dispatch(tokenSwapActions.getQuotesSuccess(res))
      })
      .catch(e => {
        dispatch(tokenSwapActions.getQuoteFailure(e))
      })
  }
}

export { fetchAccounts, getQuotes }
