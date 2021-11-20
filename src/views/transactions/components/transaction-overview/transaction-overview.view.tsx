import React from "react";
import { useTheme } from "react-jss";
import { BigNumber } from "ethers";
import { TxType } from "@hermeznetwork/hermezjs/src/enums";
import { getEthereumAddress } from "@hermeznetwork/hermezjs/src/addresses";

import useTransactionOverviewStyles from "src/views/transactions/components/transaction-overview/transaction-overview.styles";
import Container from "src/views/shared/container/container.view";
import FiatAmount from "src/views/shared/fiat-amount/fiat-amount.view";
import TokenBalance from "src/views/shared/token-balance/token-balance.view";
import Spinner from "src/views/shared/spinner/spinner.view";
import PrimaryButton from "src/views/shared/primary-button/primary-button.view";
import Alert from "src/views/shared/alert/alert.view";
import WithdrawInfoSidenav from "src/views/transactions/components/withdraw-info-sidenav/withdraw-info-sidenav.view";
import TransactionInfoTable from "src/views/shared/transaction-info-table/transaction-info-table.view";
import { AsyncTask } from "src/utils/types";
import { getTokenAmountInPreferredCurrency, getFixedTokenAmount } from "src/utils/currencies";
import { getRealFee } from "src/utils/fees";
import {
  getPartiallyHiddenEthereumAddress,
  getPartiallyHiddenHermezAddress,
} from "src/utils/addresses";
import { Theme } from "src/styles/theme";
// domain
import {
  HermezWallet,
  HermezAccount,
  FiatExchangeRates,
  Exit,
  EthereumAccount,
} from "src/domain/hermez";
import { EstimatedWithdrawFee } from "src/domain";

type Transaction =
  | {
      type: TxType.Deposit;
      amount: BigNumber;
      account: EthereumAccount;
      onDeposit: (amount: BigNumber, account: EthereumAccount) => void;
    }
  | {
      type: TxType.Transfer;
      amount: BigNumber;
      account: HermezAccount;
      to: Partial<HermezAccount>;
      fee: number;
      onTransfer: (
        amount: BigNumber,
        account: HermezAccount,
        to: Partial<HermezAccount>,
        fee: number
      ) => void;
    }
  | {
      type: TxType.Exit;
      amount: BigNumber;
      account: HermezAccount;
      fee: number;
      estimatedWithdrawFeeTask: AsyncTask<EstimatedWithdrawFee, Error>;
      onExit: (amount: BigNumber, account: HermezAccount, fee: number) => void;
    }
  | {
      type: TxType.Withdraw;
      amount: BigNumber;
      account: HermezAccount;
      exit: Exit;
      completeDelayedWithdrawal: boolean;
      instantWithdrawal: boolean;
      estimatedWithdrawFeeTask: AsyncTask<EstimatedWithdrawFee, Error>;
      onWithdraw: (
        amount: BigNumber,
        account: HermezAccount,
        exit: Exit,
        completeDelayedWithdrawal: boolean,
        instantWithdrawal: boolean
      ) => void;
    }
  | {
      type: TxType.ForceExit;
      amount: BigNumber;
      account: HermezAccount;
      onForceExit: (amount: BigNumber, account: HermezAccount) => void;
    };

interface TransactionOverviewProps {
  wallet: HermezWallet.HermezWallet;
  isTransactionBeingApproved: boolean;
  preferredCurrency: string;
  fiatExchangeRates: FiatExchangeRates;
  transaction: Transaction;
}

function TransactionOverview({
  wallet,
  isTransactionBeingApproved,
  preferredCurrency,
  fiatExchangeRates,
  transaction,
}: TransactionOverviewProps): JSX.Element {
  const theme = useTheme<Theme>();
  const classes = useTransactionOverviewStyles();
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);
  const [isWithdrawInfoSidenavOpen, setIsWithdrawInfoSidenavOpen] = React.useState(false);
  const { account, amount, type } = transaction;

  React.useEffect(() => {
    if (!isTransactionBeingApproved) {
      setIsButtonDisabled(false);
    }
  }, [isTransactionBeingApproved]);

  /**
   * Converts the transaction amount to fiat in the preferred currency
   *
   * @returns {Number} - Token amount in the user's preferred currency
   */
  function getAmountInFiat(value: string) {
    const token = account.token;
    const fixedAccountBalance = getFixedTokenAmount(value, token.decimals);

    return getTokenAmountInPreferredCurrency(
      fixedAccountBalance,
      token.USD,
      preferredCurrency,
      fiatExchangeRates
    );
  }

  function handleOpenWithdrawInfoSidenav() {
    setIsWithdrawInfoSidenavOpen(true);
  }

  function handleCloseWithdrawInfoSidenav() {
    setIsWithdrawInfoSidenavOpen(false);
  }

  /**
   * Bubbles up an event to send the transaction accordingly
   * @returns {void}
   */
  function handleFormSubmit(): void {
    // We only need to disable the button on L2 txs, as L1 txs are going to display an
    // spinner which will prevent the user from submitting the form twice
    switch (transaction.type) {
      case TxType.Deposit: {
        return transaction.onDeposit(amount, transaction.account);
      }
      case TxType.ForceExit: {
        return transaction.onForceExit(amount, transaction.account);
      }
      case TxType.Withdraw: {
        return transaction.onWithdraw(
          amount,
          transaction.account,
          transaction.exit,
          transaction.completeDelayedWithdrawal,
          transaction.instantWithdrawal
        );
      }
      case TxType.Exit: {
        setIsButtonDisabled(true);
        return transaction.onExit(amount, transaction.account, transaction.fee);
      }
      default: {
        setIsButtonDisabled(true);
        return transaction.onTransfer(amount, transaction.account, transaction.to, transaction.fee);
      }
    }
  }

  const header: JSX.Element = (
    <Container backgroundColor={theme.palette.primary.main} addHeaderPadding disableTopGutter>
      <section className={classes.section}>
        <div className={classes.highlightedAmount}>
          <TokenBalance
            amount={getFixedTokenAmount(amount.toString(), account.token.decimals)}
            symbol={account.token.symbol}
          />
        </div>
        <FiatAmount amount={getAmountInFiat(amount.toString())} currency={preferredCurrency} />
      </section>
    </Container>
  );

  const footer = (buttonLabel: string): JSX.Element =>
    isTransactionBeingApproved ? (
      <div className={classes.signingSpinnerWrapper}>
        <Spinner />
        <p className={classes.signingText}>Sign in your connected wallet to confirm transaction</p>
      </div>
    ) : (
      <PrimaryButton label={buttonLabel} onClick={handleFormSubmit} disabled={isButtonDisabled} />
    );

  const myHermezAddress = {
    subtitle: "My Hermez address",
    value: getPartiallyHiddenHermezAddress(wallet.hermezEthereumAddress),
  };

  const myEthereumAddress = {
    subtitle: "My Ethereum address",
    value: getPartiallyHiddenEthereumAddress(getEthereumAddress(wallet.hermezEthereumAddress)),
  };

  switch (type) {
    case TxType.Deposit: {
      return (
        <div className={classes.root}>
          {header}
          <Container>
            <section className={classes.section}>
              <TransactionInfoTable from={myEthereumAddress} to={myHermezAddress} />
              {footer("Deposit")}
            </section>
          </Container>
        </div>
      );
    }
    case TxType.ForceExit: {
      return (
        <div className={classes.root}>
          {header}
          <Container>
            <section className={classes.section}>
              <TransactionInfoTable from={myHermezAddress} to={myEthereumAddress} />
              {footer("Force Withdraw")}
            </section>
          </Container>
        </div>
      );
    }
    case TxType.Withdraw: {
      return (
        <div className={classes.root}>
          {header}
          <Container>
            <section className={classes.section}>
              <TransactionInfoTable from={myHermezAddress} to={myEthereumAddress} />
              {footer("Withdraw")}
            </section>
          </Container>
        </div>
      );
    }
    case TxType.Exit: {
      return (
        <div className={classes.root}>
          {header}
          <Container>
            <section className={classes.section}>
              <Alert
                showHelpButton
                message="Withdrawal of funds has 2 steps. Once initiated it can’t be canceled."
                onHelpClick={handleOpenWithdrawInfoSidenav}
              />
              <TransactionInfoTable
                from={myHermezAddress}
                to={myEthereumAddress}
                fee={getRealFee(amount.toString(), account.token, transaction.fee)}
                token={account.token}
                preferredCurrency={preferredCurrency}
                fiatExchangeRates={fiatExchangeRates}
                estimatedWithdrawFee={
                  transaction.estimatedWithdrawFeeTask.status === "successful" ||
                  transaction.estimatedWithdrawFeeTask.status === "reloading"
                    ? transaction.estimatedWithdrawFeeTask.data
                    : undefined
                }
              />
              <PrimaryButton
                label="Initiate withdraw"
                onClick={handleFormSubmit}
                disabled={isButtonDisabled}
              />
            </section>
          </Container>
          {isWithdrawInfoSidenavOpen && (
            <WithdrawInfoSidenav onClose={handleCloseWithdrawInfoSidenav} />
          )}
        </div>
      );
    }
    case TxType.Transfer: {
      const to = transaction.to.hezEthereumAddress || transaction.to.bjj;

      return (
        <div className={classes.root}>
          {header}
          <Container>
            <section className={classes.section}>
              <TransactionInfoTable
                from={myHermezAddress}
                to={
                  to
                    ? {
                        subtitle: getPartiallyHiddenHermezAddress(to),
                      }
                    : undefined
                }
                fee={getRealFee(amount.toString(), account.token, transaction.fee)}
                token={account.token}
                preferredCurrency={preferredCurrency}
                fiatExchangeRates={fiatExchangeRates}
              />
              <PrimaryButton label="Send" onClick={handleFormSubmit} disabled={isButtonDisabled} />
            </section>
          </Container>
        </div>
      );
    }
    default: {
      return <></>;
    }
  }
}

export default TransactionOverview;
