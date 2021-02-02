import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import useAccountListStyles from './account-list.styles'
import Account from '../account/account.view'
import { getFixedTokenAmount, getTokenAmountInPreferredCurrency } from '../../../utils/currencies'
import { BigNumber } from 'ethers'

function AccountList ({
  accounts,
  preferredCurrency,
  fiatExchangeRates,
  pendingDeposits,
  onAccountClick
}) {
  const classes = useAccountListStyles()

  /**
   * Bubbles up the onAccountClick event when an account is clicked
   * @returns {void}
   */
  function handleAccountListItemClick (account) {
    onAccountClick(account)
  }

  return (
    <div className={classes.root}>
      {accounts.map((account, index) => {
        const pendingDeposit = pendingDeposits && pendingDeposits
          .find((deposit) => deposit.token.id === account.token.id)
        const accountBalance = pendingDeposit !== undefined
          ? BigNumber.from(account.balance).add(BigNumber.from(pendingDeposit.amount)).toString()
          : account.balance
        const fixedAccountBalance = getFixedTokenAmount(
          accountBalance,
          account.token.decimals
        )

        return (
          <div
            key={account.accountIndex || account.token.id}
            className={clsx({ [classes.accountSpacer]: index > 0 })}
          >
            <Account
              balance={fixedAccountBalance}
              tokenName={account.token.name}
              tokenSymbol={account.token.symbol}
              preferredCurrency={preferredCurrency}
              fiatBalance={getTokenAmountInPreferredCurrency(
                fixedAccountBalance,
                account.token.USD,
                preferredCurrency,
                fiatExchangeRates
              )}
              hasPendingDeposit={pendingDeposit !== undefined}
              onClick={() => handleAccountListItemClick(account)}
            />
          </div>
        )
      })}
    </div>
  )
}

AccountList.propTypes = {
  accounts: PropTypes.array,
  preferredCurrency: PropTypes.string.isRequired,
  fiatExchangeRates: PropTypes.object,
  onAccountClick: PropTypes.func
}

export default AccountList
