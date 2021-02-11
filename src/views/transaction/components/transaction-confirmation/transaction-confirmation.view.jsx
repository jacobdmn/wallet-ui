import React from 'react'
import PropTypes from 'prop-types'
import { TxType } from '@hermeznetwork/hermezjs/src/enums'

import useTransactionConfirmationStyles from './transaction-confirmation.styles'
import transactionConfirmation from '../../../../images/transaction-confirmation.png'

function TransactionConfirmation ({ transactionType, onFinishTransaction }) {
  const classes = useTransactionConfirmationStyles()

  /**
   * Converts the transaction type to a readable explanation of it
   * @returns {string} - Explanation for the transaction type
   */
  function getExplanation () {
    switch (transactionType) {
      case TxType.Deposit:
        return 'Your transaction is awaiting verification.'
      case TxType.Transfer:
        return 'Your transaction is completed.'
      case TxType.Exit:
      case TxType.ForceExit:
        return 'Withdrawal has been initiated and will require additional confirmation in a few minutes.'
      case TxType.Withdraw:
      case TxType.DelayedWithdrawal:
        return 'Your withdrawal is awaiting verification.'
      default:
        return ''
    }
  }

  return (
    <section className={classes.wrapper}>
      <img
        className={classes.image}
        src={transactionConfirmation}
        alt='Hermez transaction confirmed'
      />
      <p className={classes.text}>{getExplanation()}</p>
      <button className={classes.done} onClick={onFinishTransaction}>
        Done
      </button>
    </section>
  )
}

TransactionConfirmation.propTypes = {
  transactionType: PropTypes.string.isRequired,
  onFinishTransaction: PropTypes.func.isRequired
}

export default TransactionConfirmation
