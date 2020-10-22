import React from 'react'
import PropTypes from 'prop-types'
import ethers from 'ethers'
import { useTheme } from 'react-jss'

import useTransactionOverviewStyles from './transaction-overview.styles'
import { getPartiallyHiddenHermezAddress } from '../../../../utils/addresses'
import { CurrencySymbol, getTokenAmountInPreferredCurrency, getTokenAmountBigInt } from '../../../../utils/currencies'
import { floorFix2Float, float2Fix } from '../../../../utils/float16'
import { generateL2Transaction } from '../../../../utils/tx-utils'
import { deposit, send, forceExit, withdraw } from '../../../../utils/tx'
import TransactionInfo from '../../../shared/transaction-info/transaction-info.view'
import Container from '../../../shared/container/container.view'

function TransactionOverview ({
  metaMaskWallet,
  type,
  to,
  amount,
  fee,
  exit,
  account,
  preferredCurrency,
  fiatExchangeRates,
  onNavigateToTransactionConfirmation
}) {
  const theme = useTheme()
  const classes = useTransactionOverviewStyles()

  /**
   * Uses helper function to convert amount to Fiat in the preferred currency
   *
   * @returns {Number}
   */
  function getAmountinFiat (value) {
    return getTokenAmountInPreferredCurrency(
      value,
      account.token.USD,
      preferredCurrency,
      fiatExchangeRates
    )
  }

  function getAmountInBigInt () {
    return getTokenAmountBigInt(amount, account.token.decimals)
  }

  /**
   * Depending on the transaction type, show the appropriate button text
   *
   * @returns {string}
   */
  function getTitle () {
    switch (type) {
      case 'deposit':
        return 'Deposit'
      case 'transfer':
        return 'Send'
      case 'exit':
        return 'Withdraw'
      case 'withdraw':
        return 'Withdraw'
      case 'forceExit':
        return 'Force Withdrawal'
      default:
        return ''
    }
  }

  /**
   * Prepares an L2 transfer object, signs it and send it
   */
  async function sendTransfer () {
    const { transaction, encodedTransaction } = await generateL2Transaction({
      from: account.accountIndex,
      to: type === 'transfer' ? to.accountIndex : null,
      amount: float2Fix(floorFix2Float(getAmountInBigInt())),
      fee,
      nonce: account.nonce
    }, metaMaskWallet.publicKeyCompressedHex, account.token)
    metaMaskWallet.signTransaction(transaction, encodedTransaction)

    return send(transaction, metaMaskWallet.publicKeyCompressedHex)
  }

  /**
   * Prepares the transaction and sends it
   */
  async function handleClickTxButton () {
    if (type === 'deposit') {
      deposit(getAmountInBigInt(), metaMaskWallet.hermezEthereumAddress, account.token, metaMaskWallet.publicKeyCompressedHex)
        .then((res) => {
          console.log(res)
          onNavigateToTransactionConfirmation(type)
        })
        .catch((error) => {
          console.log(error)
        })
    } else if (type === 'forceExit') {
      console.log(account)
      forceExit(getAmountInBigInt(), account.accountIndex || 'hez:TKN:256', account.token)
        .then((res) => {
          console.log(res)
          onNavigateToTransactionConfirmation(type)
        })
        .catch((error) => {
          console.log(error)
        })
    } else if (type === 'withdraw') {
      // Todo: Change once hermez-node is ready and we have a testnet. First line is the proper one, second one needs to be modified manually in each test
      // withdraw(getAmountInBigInt(), account.accountIndex || 'hez:TKN:256', account.token, metaMaskWallet.publicKeyCompressedHex, exit.merkleProof.Root, exit.merkleProof.Siblings)
      withdraw(ethers.BigNumber.from(300000000000000000000n), 'hez:TKN:256', { id: 1, ethereumAddress: '0xf784709d2317D872237C4bC22f867d1BAe2913AB' }, metaMaskWallet.publicKeyCompressedHex, ethers.BigNumber.from('4'), [])
        .then((res) => {
          console.log(res)
          onNavigateToTransactionConfirmation(type)
        })
        .catch((error) => {
          console.log(error)
        })
    } else {
      sendTransfer()
        .then((res) => {
          console.log(res)
          onNavigateToTransactionConfirmation(type)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.amountsSection}>
        <Container backgroundColor={theme.palette.primary.main}>
          <section className={classes.section}>
            <h1 className={classes.fiatAmount}>
              {CurrencySymbol[preferredCurrency].symbol} {getAmountinFiat(amount).toFixed(2)}
            </h1>
            <p className={classes.tokenAmount}>
              {amount} {account.token.symbol}
            </p>
          </section>
        </Container>
      </div>
      <div className={classes.transactionInfoSection}>
        <Container>
          <section className={classes.section}>
            <TransactionInfo
              from={getPartiallyHiddenHermezAddress(metaMaskWallet.hermezEthereumAddress)}
              to={Object.keys(to).length !== 0 ? getPartiallyHiddenHermezAddress(to.hezEthereumAddress) : undefined}
              fee={{
                fiat: `${CurrencySymbol[preferredCurrency].symbol} ${getAmountinFiat(fee)}`,
                tokens: `${fee} ${account.token.symbol}`
              }}
            />
            <button className={classes.txButton} onClick={handleClickTxButton}>
              {getTitle()}
            </button>
          </section>
        </Container>
      </div>
    </div>
  )
}

TransactionOverview.propTypes = {
  metaMaskWallet: PropTypes.shape({
    signTransaction: PropTypes.func.isRequired
  }),
  type: PropTypes.string.isRequired,
  to: PropTypes.object.isRequired,
  amount: PropTypes.string.isRequired,
  fee: PropTypes.number,
  exit: PropTypes.object,
  account: PropTypes.object.isRequired,
  preferredCurrency: PropTypes.string.isRequired,
  fiatExchangeRates: PropTypes.object.isRequired,
  onNavigateToTransactionConfirmation: PropTypes.func.isRequired
}

export default TransactionOverview
