import React from 'react'
import PropTypes from 'prop-types'

import useTransactionStyles from './transaction.styles'
import TransactionType from '../transaction-type/transaction-type.view'
import { CurrencySymbol } from '../../../../utils/currencies'

function Transaction ({
  type,
  amount,
  tokenSymbol,
  fiatAmount,
  timestamp,
  preferredCurrency,
  onClick
}) {
  const classes = useTransactionStyles()

  return (
    <div className={classes.root} onClick={onClick}>
      <div className={classes.type}>
        <TransactionType type={type} amount={amount} />
      </div>
      <div className={classes.info}>
        <div className={`${classes.row} ${classes.topRow}`}>
          <p>{type}</p>
          <p className={classes.preferredCurrency}>
            {CurrencySymbol[preferredCurrency].symbol} {fiatAmount.toFixed(2)}
          </p>
        </div>
        <div className={`${classes.row} ${classes.bottomRow}`}>
          {
            timestamp
              ? <p>{new Date(timestamp).toLocaleDateString()}</p>
              : (
                <div className={classes.pendingLabelContainer}>
                  <p className={classes.pendingLabelText}>Pending</p>
                </div>
              )
          }
          <p>{amount} {tokenSymbol}</p>
        </div>
      </div>
    </div>
  )
}

Transaction.propTypes = {
  type: PropTypes.string.isRequired,
  amount: PropTypes.string.isRequired,
  tokenSymbol: PropTypes.string.isRequired,
  fiatAmount: PropTypes.number.isRequired,
  timestamp: PropTypes.string,
  preferredCurrency: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
}

export default Transaction
