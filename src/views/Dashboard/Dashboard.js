import React, {useCallback, useMemo} from 'react';
import Page from '../../components/Page';
import {createGlobalStyle} from 'styled-components';
import {useRouteMatch} from 'react-router-dom';
import CountUp from 'react-countup';
import ExchangeCard from '../Bond/components/ExchangeCard';
import useBombFinance from '../../hooks/useBombFinance';
import useCashPriceInLastTWAP from '../../hooks/useCashPriceInLastTWAP';
import {useTransactionAdder} from '../../state/transactions/hooks';
import ExchangeStat from '../Bond/components/ExchangeStat';
import useTokenBalance from '../../hooks/useTokenBalance';
import useBondsPurchasable from '../../hooks/useBondsPurchasable';
import useBondStats from '../../hooks/useBondStats';
import useTotalValueLocked from '../../hooks/useTotalValueLocked';
import { BOND_REDEEM_PRICE, BOND_REDEEM_PRICE_BN } from '../../bomb-finance/constants';

import { useWallet } from 'use-wallet';
import moment from 'moment';
import styled from 'styled-components';
import Spacer from '../../components/Spacer';
import Harvest from '../Boardroom/components/Harvest';
import Stake from '../Boardroom/components/Stake';
import { makeStyles } from '@material-ui/core/styles';

import { Box, Card, CardContent, Button, Typography, Grid } from '@material-ui/core';

import { Alert } from '@material-ui/lab';

import UnlockWallet from '../../components/UnlockWallet';


import useRedeemOnBoardroom from '../../hooks/useRedeemOnBoardroom';
import useStakedBalanceOnBoardroom from '../../hooks/useStakedBalanceOnBoardroom';
import { getDisplayBalance } from '../../utils/formatBalance';
import useCurrentEpoch from '../../hooks/useCurrentEpoch';
import useFetchBoardroomAPR from '../../hooks/useFetchBoardroomAPR';

import useCashPriceInEstimatedTWAP from '../../hooks/useCashPriceInEstimatedTWAP';
import useTreasuryAllocationTimes from '../../hooks/useTreasuryAllocationTimes';
import useTotalStakedOnBoardroom from '../../hooks/useTotalStakedOnBoardroom';
import useClaimRewardCheck from '../../hooks/boardroom/useClaimRewardCheck';
import useWithdrawCheck from '../../hooks/boardroom/useWithdrawCheck';
import ProgressCountdown from '../Boardroom/components/ProgressCountdown';
import { Helmet } from 'react-helmet';

import HomeImage from '../../assets/img/background.jpg';

//import useBombStats from '../../hooks/useBombStats';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) repeat !important;
    background-size: cover !important;
    background-color: #171923;
  }
`;
const TITLE = 'bomb.money | Dashboard';

const useStyles = makeStyles((theme) => ({
  gridItem: {
    height: '100%',
    [theme.breakpoints.up('md')]: {
      height: '90px',
    },
  },
}));

const Dashboard: React.FC = () => {
  const classes = useStyles();
  const { account } = useWallet();
  const { onRedeem } = useRedeemOnBoardroom();
  const stakedBalance = useStakedBalanceOnBoardroom();
  const currentEpoch = useCurrentEpoch();
  const cashStat = useCashPriceInEstimatedTWAP();
  const totalStaked = useTotalStakedOnBoardroom();
  const boardroomAPR = useFetchBoardroomAPR();
  const canClaimReward = useClaimRewardCheck();
  const canWithdraw = useWithdrawCheck();
  const scalingFactor = useMemo(() => (cashStat ? Number(cashStat.priceInDollars).toFixed(4) : null), [cashStat]);
  const { to } = useTreasuryAllocationTimes();

  const {path} = useRouteMatch();
    const bombFinance = useBombFinance();
    const TVL = useTotalValueLocked();
    const addTransaction = useTransactionAdder();
    const bondStat = useBondStats();
    //const bombStat = useBombStats();
    const cashPrice = useCashPriceInLastTWAP();

    const bondsPurchasable = useBondsPurchasable();

    const bondBalance = useTokenBalance(bombFinance?.BBOND);
    //const scalingFactor = useMemo(() => (cashPrice ? Number(cashPrice) : null), [cashPrice]);

    const handleBuyBonds = useCallback(
    async (amount: string) => {
    const tx = await bombFinance.buyBonds(amount);
    addTransaction(tx, {
        summary: `Buy ${Number(amount).toFixed(2)} BBOND with ${amount} BOMB`,
    });
    },
    [bombFinance, addTransaction],
    );

    const handleRedeemBonds = useCallback(
    async (amount: string) => {
    const tx = await bombFinance.redeemBonds(amount);
    addTransaction(tx, {summary: `Redeem ${amount} BBOND`});
    },
    [bombFinance, addTransaction],
    );
    const isBondRedeemable = useMemo(() => cashPrice.gt(BOND_REDEEM_PRICE_BN), [cashPrice]);
    const isBondPurchasable = useMemo(() => Number(bondStat?.tokenInFtm) < 1.01, [bondStat]);
    
    // console.log("bondstat", Number(bondStat?.tokenInFtm))
    const bondScale = (Number(cashPrice) / 100000000000000).toFixed(4); 


  return (
    <Page>
      <BackgroundImage />
      <Helmet>
        <title>{TITLE}</title>
      </Helmet>
          <Typography color="textPrimary" align="center" variant="h3" gutterBottom>
            Dashboard
          </Typography>
          <Box mt={6}>
            <Grid container justify="center" spacing={3}>
              <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
                <Card className={classes.gridItem}>
                  <CardContent style={{ textAlign: 'center' }}>
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>Next Epoch</Typography>
                    <ProgressCountdown base={moment().toDate()} hideBar={true} deadline={to} description="Next Epoch" />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>Current Epoch</Typography>
                    <Typography>{Number(currentEpoch)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>
                      BOMB PEG <small>(TWAP)</small>
                    </Typography>
                    <Typography>{scalingFactor} BTC</Typography>
                    <Typography>
                      <small>per 10,000 BOMB</small>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={2} lg={2} className={classes.gridItem}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>APR</Typography>
                    <Typography>{boardroomAPR.toFixed(2)}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={2} lg={2}>
                <Card className={classes.gridItem}>
                  <CardContent align="center">
                    <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>BSHARES Staked</Typography>
                    <Typography>{getDisplayBalance(totalStaked)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            
            {/* TVL */}
            <Grid item xs={12} md={2} lg={2} >
            <Card className={classes.gridItem}>
                <CardContent align="center">
                <Typography style={{ textTransform: 'uppercase', color: '#f9d749' }}>Total Value Locked</Typography>
                <CountUp style={{ fontSize: '25px' }} end={TVL} separator="," prefix="$" />
                </CardContent>
            </Card>
            </Grid>
        </Grid>



        {!!account ? (
            <Box mt={4}>
              <StyledBoardroom>
                <StyledCardsWrapper>
                  <StyledCardWrapper>
                    <Harvest />
                  </StyledCardWrapper>
                  <Spacer />
                  <StyledCardWrapper>
                    <Stake />
                  </StyledCardWrapper>
                </StyledCardsWrapper>
              </StyledBoardroom>
            </Box>
        ) : (
            <UnlockWallet />
        )}

            {/* <Grid container justify="center" spacing={3}>
            <Grid item xs={4}>
              <Card>
                <CardContent align="center">
                  <Typography>Rewards</Typography>

                </CardContent>
                <CardActions style={{justifyContent: 'center'}}>
                  <Button color="primary" variant="outlined">Claim Reward</Button>
                </CardActions>
                <CardContent align="center">
                  <Typography>Claim Countdown</Typography>
                  <Typography>00:00:00</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent align="center">
                  <Typography>Stakings</Typography>
                  <Typography>{getDisplayBalance(stakedBalance)}</Typography>
                </CardContent>
                <CardActions style={{justifyContent: 'center'}}>
                  <Button>+</Button>
                  <Button>-</Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid> */}
          </Box>

        {!!account && (
          <Box mt={5}>
            <Grid container justify="center" spacing={3} mt={10}>
              <Button
                disabled={stakedBalance.eq(0) || (!canWithdraw && !canClaimReward)}
                onClick={onRedeem}
                className={
                  stakedBalance.eq(0) || (!canWithdraw && !canClaimReward)
                    ? 'shinyButtonDisabledSecondary'
                    : 'shinyButtonSecondary'
                }
              >
                Claim &amp; Withdraw
              </Button>
            </Grid>
          </Box>
        )}
        <StyledBond>
              <StyledCardWrapper>
                <ExchangeCard
                  action="Purchase"
                  fromToken={bombFinance.BOMB}
                  fromTokenName="BOMB"
                  toToken={bombFinance.BBOND}
                  toTokenName="BBOND"
                  priceDesc={
                    !isBondPurchasable
                      ? 'BOMB is over peg'
                      : getDisplayBalance(bondsPurchasable, 18, 4) + ' BBOND available for purchase'
                  }
                  onExchange={handleBuyBonds}
                  disabled={!bondStat || isBondRedeemable}
                />
              </StyledCardWrapper>
              <StyledStatsWrapper>
                <ExchangeStat
                  tokenName="10,000 BOMB"
                  description="Last-Hour TWAP Price"
                  //price={Number(bombStat?.tokenInFtm).toFixed(4) || '-'}
                 price={bondScale || '-'}

                />
                <Spacer size="md" />
                <ExchangeStat
                  tokenName="10,000 BBOND"
                  description="Current Price: (BOMB)^2"
                  price={Number(bondStat?.tokenInFtm).toFixed(4) || '-'}
                />
              </StyledStatsWrapper>
              <StyledCardWrapper>
                <ExchangeCard
                  action="Redeem"
                  fromToken={bombFinance.BBOND}
                  fromTokenName="BBOND"
                  toToken={bombFinance.BOMB}
                  toTokenName="BOMB"
                  priceDesc={`${getDisplayBalance(bondBalance)} BBOND Available in wallet`}
                  onExchange={handleRedeemBonds}
                  disabled={!bondStat || bondBalance.eq(0) || !isBondRedeemable}
                  disabledDescription={!isBondRedeemable ? `Enabled when 10,000 BOMB > ${BOND_REDEEM_PRICE}BTC` : null}
                />
              </StyledCardWrapper>
            </StyledBond>
    </Page>
    
  );
};

const StyledBoardroom = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledCardsWrapper = styled.div`
  display: flex;
  width: 600px;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 80%;
  }
`;

const StyledStatsWrapper = styled.div`
  display: flex;
  flex: 0.8;
  margin: 0 20px;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 80%;
    margin: 16px 0;
  }
`;

const StyledBond = styled.div`
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;


export default Dashboard;
