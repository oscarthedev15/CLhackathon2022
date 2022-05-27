import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Stack,
  Typography,
  Box,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useMoralis } from 'react-moralis'
import betgame from '../betgame'
import web3 from '../web3'
import { Bet } from './BetMarketplace'
import { styled } from '@mui/system'
import { useNavigate } from 'react-router-dom';

const MyThemedCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.text.primary,
}))

function BetItem({ bet }: { bet: Bet }) {
  const [keywords, setKeywords] = useState<string[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [serviceFee, setServiceFee] = useState('')
  const { authenticate, isAuthenticated, user } = useMoralis()

  const navigate = useNavigate();

  useEffect(() => {
    parseURLString(bet.apiURL)

    async function anyNameFunction() {
      await setContractProp()
    }
    // Execute the created function directly
    anyNameFunction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setContractProp = async () => {
    console.log('Setting contract properties')

    let servFee = await betgame.methods.serviceFee().call()
    setServiceFee(servFee)


  }

  const parseURLString = (apiURL: string) => {
    // https://newsapi.org/v2/everything?q=%2BPete%20Davidson%2C%2BSNL%2C%2Bgoodbye&sources=entertainment-weekly&searchin=title&language=en&pagesize=1&apiKey=340014d50e764937b75f19426bdd5265
    let withoutBeginning = apiURL.slice(36)
    console.log(withoutBeginning)
    let sections = withoutBeginning.split('&')
    console.log(sections)
    let keywordStr = decodeURIComponent(sections[0])
    console.log(keywordStr)
    let keywordsArray = keywordStr.split(',')
    console.log(keywordsArray)
    let finalKeywords = [] as string[]
    keywordsArray.forEach((k) => {
      let kWithoutPlus = k.slice(1)
      finalKeywords.push(kWithoutPlus)
    })
    console.log(finalKeywords)
    setKeywords(finalKeywords)

    let sourceStr = sections[1]
    console.log(sourceStr)
    sourceStr = sourceStr.slice(8)
    console.log(sourceStr)
    if (sourceStr.length > 0) {
      let finalSources = sourceStr.split(',')
      console.log(finalSources)
      setSources(finalSources)
    }
  }

  const convertToDate = (unix: string) => {
    const t = parseInt(unix)
    const milliseconds = t * 1000
    const dateObject = new Date(milliseconds)
    const dateTimestamp = dateObject.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    // console.log(dateTimestamp)
    return dateTimestamp
  }

  const calculateDaysLeft = (accept: string) => {
    let today = new Date()

    const t = parseInt(accept)
    const milliseconds = t * 1000
    const dateObject = new Date(milliseconds)
    let diff = dateObject.getTime() - today.getTime()
    var days = Math.ceil(diff / (1000 * 3600 * 24))
    return days
  }

  const login = async () => {
    if (!isAuthenticated) {
      await authenticate({ signingMessage: 'Log in using Moralis' })
        .then(function (user) {
          console.log('logged in user:', user)
          console.log(user!.get('ethAddress'))
        })
        .catch(function (error) {
          console.log(error)
        })
    }
  }

  const acceptBet = async (id: number, apiURL: string) => {

    if (isAuthenticated) {
      let fromDate = new Date(Date.now())
      let fromDateStr = fromDate.toISOString()
      console.log(fromDateStr)
      let beginningStr = '&from='
      let finalFromStr = beginningStr.concat(fromDateStr)
      const newApiURL = apiURL.concat(finalFromStr)
      console.log(newApiURL)

      console.log('Calling acceptBet function')
      const userAddress = await user!.get('ethAddress')

      let cA = parseInt(bet.acceptValue) + parseInt(serviceFee)
      console.log(cA)
      console.log(typeof serviceFee)
      await betgame.methods.acceptBet(id, newApiURL).send({
        from: userAddress,
        value: cA,
      }).then (function (result: any) {
        navigate('/BetMarketplace', {state: {acceptSuccess: true, acceptFailure: false}});
        window.location.reload();
      }).catch (function (error: any){
        navigate('/BetMarketplace', {state: {acceptSuccess: false, acceptFailure: true}});
        window.location.reload();
      });
    } else {
      login()
    }
  }

  const checkBet = async (id: number) => {
    const userAddress = await user!.get('ethAddress');
    await betgame.methods.checkBet(id).send({
      from: userAddress
    }).then (function (result: any) {
      navigate('/BetMarketplace', {state: {checkSuccess: true, checkFailure: false}});
      window.location.reload();
    }).catch (function (error: any){
      navigate('/BetMarketplace', {state: {checkSuccess: false, checkFailure: true}});
      window.location.reload();
    });
  }

  return (
    <Card sx={{ minWidth: 275, mb: 5, p: 2 }} raised>
      <Stack
        direction="row"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignContent: 'space-between',
        }}
      >
        <Typography style={{ width: '70%' }} sx={{ fontSize: 30, pl: 2 }}>
          {bet.title}
        </Typography>
        <CardContent style={{ width: '30%' }}>
          <Typography
            align="right"
            sx={{ fontSize: 14, fontStyle: 'italic' }}
            color="text.primary"
          >
            Created {convertToDate(bet.createdDate)}
          </Typography>
          <>
            {bet.accepted && (
              <Typography
                align="right"
                sx={{ fontSize: 14, fontStyle: 'italic' }}
                color="text.primary"
              >
                Accepted {convertToDate(bet.startDate)}
              </Typography>
            )}
          </>
        </CardContent>
      </Stack>

      <Stack
        direction="row"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignContent: 'space-between',
        }}
      >
        <CardContent style={{ width: '70%', height: '100%' }}>
          <Typography
            sx={{ mb: 1.5, fontFamily: 'Spline Sans Mono', fontSize: 20 }}
            color="secondary.main"
          >
            Bet Conditions
          </Typography>
          <Container sx={{ mb: 2 }}>
            <Typography
              sx={{ fontSize: 14, fontStyle: 'italic' }}
              color="text.primary"
              gutterBottom
              component="div"
            >
              <Box fontWeight="600" display="inline">
                Keywords:
              </Box>{' '}
              {keywords.join(', ')}
            </Typography>

            {sources.length === 0 ? (
              <Typography
                sx={{ fontSize: 14, fontStyle: 'italic', fontWeight: 600 }}
                color="text.primary"
                gutterBottom
              >
                All sources
              </Typography>
            ) : (
              <Typography
                sx={{ fontSize: 14, fontStyle: 'italic' }}
                color="text.primary"
                gutterBottom
                component="div"
              >
                <Box fontWeight="600" display="inline">
                  Sources:
                </Box>{' '}
                {sources.join(', ')}
              </Typography>
            )}

            <Typography
              sx={{ fontSize: 14, fontStyle: 'italic' }}
              color="text.primary"
              gutterBottom
              component="div"
            >
              At least{' '}
              <Box fontWeight="600" display="inline">
                {bet.countArts} articles
              </Box>
            </Typography>
          </Container>
          <Typography
            sx={{ mb: 1.5, fontFamily: 'Spline Sans Mono', fontSize: 20 }}
            color="secondary.main"
            gutterBottom
          >
            Wager Details
          </Typography>
          <Container>
            <Typography
              sx={{ fontSize: 14, fontStyle: 'italic' }}
              color="text.primary"
              gutterBottom
              component="div"
            >
              Creator wagered{' '}
              <Box fontWeight="600" display="inline">
                {web3.utils.fromWei(bet.amount)} ETH
              </Box>
            </Typography>

            {bet.accepted ? (
              <Typography
                sx={{ fontSize: 14, fontStyle: 'italic' }}
                color="text.primary"
                gutterBottom
                component="div"
              >
                Acceptor wagered{' '}
                <Box fontWeight="600" display="inline">
                  {web3.utils.fromWei(bet.acceptValue)} ETH
                </Box>
              </Typography>
            ) : (
              <Typography
                sx={{ fontSize: 14, fontStyle: 'italic' }}
                color="text.primary"
                gutterBottom
                component="div"
              >
                Acceptor must wager{' '}
                <Box fontWeight="600" display="inline">
                  {web3.utils.fromWei(bet.acceptValue)} ETH
                </Box>
              </Typography>
            )}
          </Container>
        </CardContent>

        <CardContent style={{ width: '30%' }}>
          <MyThemedCard style={{ height: '100%' }} raised>
            <Stack
              direction="column"
              justifyContent="space-evenly"
              alignItems="center"
              spacing={2}
              style={{ height: '100%' }}
              sx={{ mt: 0, pb: 4 }}
            >
              {bet.accepted ? (
                <Typography align="center" color="text.secondary">
                  <Stack>
                    <Typography sx={{ fontSize: 50, fontWeight: 600, pb: 0 }}>
                      {calculateDaysLeft(bet.outcomeDeadline)}
                    </Typography>
                    <Typography sx={{ mx: '2%' }}>
                      days until outcome is determined
                    </Typography>
                  </Stack>
                </Typography>
              ) : (
                <Typography align="center" color="text.secondary">
                  <Stack>
                    <Typography sx={{ fontSize: 50, fontWeight: 600, pb: 0 }}>
                      {calculateDaysLeft(bet.acceptDeadline)}
                    </Typography>
                    <Typography>days left to accept</Typography>
                  </Stack>
                </Typography>
              )}

              <CardActions>
                {bet.accepted ? (
                  <Button
                    onClick={() => checkBet(bet.id)}
                    size="medium"
                    variant="contained"
                    sx={{ m: 0, p: 2 }}
                  >
                    <Typography
                      textAlign="center"
                      sx={{
                        color: 'text.primary',
                        fontFamily: 'Spline Sans Mono',
                        fontWeight: 900,
                      }}
                    >
                      CHECK BET
                    </Typography>
                  </Button>
                ) : (
                  <Stack>
                    <Button
                      onClick={() => acceptBet(bet.id, bet.apiURL)}
                      size="medium"
                      variant="contained"
                      sx={{ my: 1, mx: 7, p: 2 }}
                    >
                      <Typography
                        textAlign="center"
                        sx={{
                          color: 'text.primary',
                          fontFamily: 'Spline Sans Mono',
                          fontWeight: 900,
                        }}
                      >
                        ACCEPT BET
                      </Typography>
                    </Button>
                    <Typography
                      sx={{ fontSize: 14, fontStyle: 'italic' }}
                      color="text.secondary"
                      gutterBottom
                      component="div"
                      align="center"
                    >
                      You will also be charged a service fee of{' '}
                      <Box fontWeight="600" display="inline">
                        {web3.utils.fromWei(serviceFee.toString())} ETH{' '}
                      </Box>
                    </Typography>
                  </Stack>
                )}
              </CardActions>
            </Stack>
          </MyThemedCard>
        </CardContent>
      </Stack>
      <>
        {!bet.accepted && (
          <Typography
            sx={{ mb: 1.5, pt: 2, pr: 6, pl: 6, fontWeight: 500, fontSize: 20 }}
            color="primary.dark"
            align="center"
          >
            Outcome will be determined by 11:59pm on{' '}
            {convertToDate(bet.outcomeDeadline)}
          </Typography>
        )}
      </>
    </Card>
  )
}

export default BetItem
