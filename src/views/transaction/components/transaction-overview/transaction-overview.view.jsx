import React from 'react'
import PropTypes from 'prop-types'
import ethers from 'ethers'
import { useTheme } from 'react-jss'
import hermezjs from 'hermezjs'

import useTransactionOverviewStyles from './transaction-overview.styles'
import { getPartiallyHiddenHermezAddress } from '../../../../utils/addresses'
import { CurrencySymbol, getTokenAmountInPreferredCurrency, getFixedTokenAmount } from '../../../../utils/currencies'
import TransactionInfo from '../../../shared/transaction-info/transaction-info.view'
import Container from '../../../shared/container/container.view'
import { TransactionType } from '../../transaction.view'
import FiatAmount from '../../../shared/fiat-amount/fiat-amount.view'
import TokenBalance from '../../../shared/token-balance/token-balance.view'
import Spinner from '../../../shared/spinner/spinner.view'

function TransactionOverview ({
  metaMaskWallet,
  transactionType,
  to,
  amount,
  fee,
  exit,
  account,
  preferredCurrency,
  fiatExchangeRates,
  onGoToFinishTransactionStep,
  onAddPendingWithdraw
}) {
  const theme = useTheme()
  const classes = useTransactionOverviewStyles()
  const [isUserSigningTransaction, setIsUserSigningTransaction] = React.useState(false)

  /**
   * Uses helper function to convert amount to Fiat in the preferred currency
   *
   * @returns {Number}
   */
  function getAmountInFiat (value) {
    const token = account.token
    const fixedAccountBalance = getFixedTokenAmount(
      value,
      token.decimals
    )

    return getTokenAmountInPreferredCurrency(
      fixedAccountBalance,
      token.USD,
      preferredCurrency,
      fiatExchangeRates
    )
  }

  function getAmountInBigInt () {
    return ethers.BigNumber.from(amount)
  }

  function getTokenAmount (value) {
    return getFixedTokenAmount(value, account.token.decimals)
  }

  /**
   * Depending on the transaction type, show the appropriate button text
   *
   * @returns {string}
   */
  function getButtonLabel () {
    switch (transactionType) {
      case TransactionType.Deposit:
        return 'Deposit'
      case TransactionType.Transfer:
        return 'Send'
      case TransactionType.Exit:
        return 'Withdraw'
      case TransactionType.Withdraw:
        return 'Withdraw'
      case TransactionType.ForceExit:
        return 'Force Withdrawal'
      default:
        return ''
    }
  }

  /**
   * Prepares the transaction and sends it
   */
  async function handleClickTxButton () {
    // TODO: Remove once we have hermez-node. This is how we test the withdraw flow.
    // onAddPendingWithdraw(metaMaskWallet.hermezEthereumAddress, account.accountIndex + exit.merkleProof.Root)
    switch (transactionType) {
      case TransactionType.Deposit: {
        setIsUserSigningTransaction(true)

        return hermezjs.Tx.deposit(
          getAmountInBigInt(),
          metaMaskWallet.hermezEthereumAddress,
          account.token,
          metaMaskWallet.publicKeyCompressedHex
        )
          .then(() => onGoToFinishTransactionStep(transactionType))
          .catch((error) => {
            setIsUserSigningTransaction(false)
            console.log(error)
          })
      }
      case TransactionType.ForceExit: {
        setIsUserSigningTransaction(true)

        return hermezjs.Tx.forceExit(
          getAmountInBigInt(),
          account.accountIndex || 'hez:TKN:256',
          account.token
        )
          .then(() => onGoToFinishTransactionStep(transactionType))
          .catch((error) => {
            setIsUserSigningTransaction(false)
            console.log(error)
          })
      }
      case TransactionType.Withdraw: {
        setIsUserSigningTransaction(true)

        // TODO: Change once hermez-node is ready and we have a testnet. First line is the proper one, second one needs to be modified manually in each test
        // withdraw(getAmountInBigInt(), account.accountIndex || 'hez:TKN:256', account.token, metaMaskWallet.publicKeyCompressedHex, exit.merkleProof.Root, exit.merkleProof.Siblings)
        return hermezjs.Tx.withdraw(
          ethers.BigNumber.from(300000000000000000000n),
          'hez:TKN:256',
          {
            id: 1,
            ethereumAddress: '0xf4e77E5Da47AC3125140c470c71cBca77B5c638c'
          },
          metaMaskWallet.publicKeyCompressedHex,
          ethers.BigNumber.from('4'),
          []
        )
          .then(() => {
            onAddPendingWithdraw(account.accountIndex + exit.merkleProof.Root)
            onGoToFinishTransactionStep(transactionType)
          })
          .catch((error) => {
            setIsUserSigningTransaction(false)
            console.log(error)
          })
      }
      default: {
        const { transaction, encodedTransaction } = await hermezjs.TxUtils.generateL2Transaction(
          {
            from: account.accountIndex,
            to: transactionType === TransactionType.Transfer ? to.accountIndex : null,
            amount: hermezjs.Float16.float2Fix(hermezjs.Float16.floorFix2Float(getAmountInBigInt())),
            fee,
            nonce: account.nonce
          },
          metaMaskWallet.publicKeyCompressedHex,
          account.token
        )

        metaMaskWallet.signTransaction(transaction, encodedTransaction)

        return hermezjs.Tx.send(transaction, metaMaskWallet.publicKeyCompressedHex)
          .then(() => onGoToFinishTransactionStep(transactionType))
          .catch((error) => console.log(error))
      }
    }
  }

  return (
    <div className={classes.root}>
      <Container backgroundColor={theme.palette.primary.main} disableTopGutter>
        <section className={classes.section}>
          <div className={classes.fiatAmount}>
            <FiatAmount
              amount={getAmountInFiat(amount)}
              currency={preferredCurrency}
            />
          </div>
          <TokenBalance
            amount={getTokenAmount(amount)}
            symbol={account.token.symbol}
          />
        </section>
      </Container>
      <Container>
        <section className={classes.section}>
          <TransactionInfo
            from={getPartiallyHiddenHermezAddress(metaMaskWallet.hermezEthereumAddress)}
            to={Object.keys(to).length !== 0 ? getPartiallyHiddenHermezAddress(to.hezEthereumAddress) : undefined}
            fee={fee ? {
              fiat: `${CurrencySymbol[preferredCurrency].symbol} ${getAmountInFiat(fee).toFixed(6)}`,
              tokens: `${getTokenAmount(fee)} ${account.token.symbol}`
            } : undefined}
          />
          {
            isUserSigningTransaction
              ? (
                <div className={classes.signingSpinnerWrapper}>
                  <Spinner />
                  <p className={classes.signingText}>
                    Sign in with MetaMask to confirm transaction
                  </p>
                </div>
              )
              : (
                <button className={classes.txButton} onClick={handleClickTxButton}>
                  {getButtonLabel()}
                </button>
              )
          }
        </section>
      </Container>
    </div>
  )
}

TransactionOverview.propTypes = {
  metaMaskWallet: PropTypes.shape({
    signTransaction: PropTypes.func.isRequired
  }),
  transactionType: PropTypes.string.isRequired,
  to: PropTypes.object.isRequired,
  amount: PropTypes.string.isRequired,
  fee: PropTypes.string,
  exit: PropTypes.object,
  account: PropTypes.object.isRequired,
  preferredCurrency: PropTypes.string.isRequired,
  fiatExchangeRates: PropTypes.object.isRequired,
  onGoToFinishTransactionStep: PropTypes.func.isRequired,
  onAddPendingWithdraw: PropTypes.func.isRequired
}

export default TransactionOverview