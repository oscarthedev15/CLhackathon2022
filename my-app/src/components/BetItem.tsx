import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useMoralis } from 'react-moralis'
import betgame from '../betgame'
import web3 from '../web3'
import { Bet } from './BetMarketplace'

function BetItem({ bet }: { bet: Bet }) {
  const [keywords, setKeywords] = useState<string[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [serviceFee, setServiceFee] = useState('')
  const [chargeAmount, setChargeAmount] = useState('')

  const { authenticate, isAuthenticated, user } = useMoralis()

  useEffect(() => {
    parseURLString(bet.apiURL)

    async function anyNameFunction() {
      await setContractProp()
    }
    // Execute the created function directly
    anyNameFunction()
  })

  const setContractProp = async () => {
    console.log('Setting contract properties')

    let servFee = await betgame.methods.serviceFee().call()
    setServiceFee(servFee)

    let cA = parseInt(bet.acceptValue) + parseInt(servFee)
    console.log(cA)
    let caStr = cA.toString()
    let finalCA = web3.utils.fromWei(caStr)
    setChargeAmount(finalCA)
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
      })
    } else {
      login()
    }
  }

  const checkBet = async (id: number) => {
    await betgame.methods.checkBet(id).call()
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
        <CardHeader style={{ width: '70%' }} title={bet.title} />
        <CardContent style={{ width: '30%' }}>
          <Typography
            align="right"
            sx={{ fontSize: 14 }}
            color="text.secondary"
          >
            Created {convertToDate(bet.createdDate)}
          </Typography>
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
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            Bet Conditions
          </Typography>
          <Container sx={{ mb: 2 }}>
            <Typography
              sx={{ fontSize: 14 }}
              color="text.secondary"
              gutterBottom
            >
              Keywords: {keywords.join(', ')}
            </Typography>
            {sources.length === 0 ? (
              <Typography
                sx={{ fontSize: 14 }}
                color="text.secondary"
                gutterBottom
              >
                All sources
              </Typography>
            ) : (
              <Typography
                sx={{ fontSize: 14 }}
                color="text.secondary"
                gutterBottom
              >
                Sources: {sources.join(', ')}
              </Typography>
            )}

            <Typography sx={{ fontSize: 14 }} color="text.secondary">
              At least {bet.countArts} articles
            </Typography>
          </Container>
          <Typography sx={{ mb: 1.5 }} color="text.secondary" gutterBottom>
            Wager Details
          </Typography>
          <Container>
            <Typography
              sx={{ fontSize: 14 }}
              color="text.secondary"
              gutterBottom
            >
              Creator wagered {web3.utils.fromWei(bet.amount)} ETH
            </Typography>

            {bet.accepted ? (
              <Typography
                sx={{ fontSize: 14 }}
                color="text.secondary"
                gutterBottom
              >
                Acceptor wagered {web3.utils.fromWei(bet.acceptValue)} ETH
              </Typography>
            ) : (
              <Typography
                sx={{ fontSize: 14 }}
                color="text.secondary"
                gutterBottom
              >
                Acceptor must wager {web3.utils.fromWei(bet.acceptValue)} ETH
              </Typography>
            )}

            <Typography
              sx={{ fontSize: 14 }}
              color="text.secondary"
              gutterBottom
            >
              You will also be charged a service fee of{' '}
              {web3.utils.fromWei(serviceFee.toString())} ETH when accepting the
              bet
            </Typography>
          </Container>
        </CardContent>

        <CardContent style={{ width: '30%' }}>
          <Card style={{ height: '100%' }} raised>
            <Stack
              direction="column"
              justifyContent="space-around"
              alignItems="center"
              spacing={2}
              style={{ height: '100%' }}
            >
              {bet.accepted ? (
                <Typography
                  align="center"
                  sx={{ pr: 6, pl: 6 }}
                  color="text.secondary"
                >
                  Bet was accepted on {convertToDate(bet.startDate)}
                </Typography>
              ) : (
                <Typography align="center" sx={{}} color="text.secondary">
                  {calculateDaysLeft(bet.acceptDeadline)} days left to accept
                </Typography>
              )}
              <CardActions>
                {bet.accepted ? (
                  <Button
                    onClick={() => checkBet(bet.id)}
                    size="small"
                    sx={{ m: 0, p: 0 }}
                  >
                    Check Bet
                  </Button>
                ) : (
                  <Button
                    onClick={() => acceptBet(bet.id, bet.apiURL)}
                    size="small"
                    sx={{ m: 0, p: 0 }}
                  >
                    Accept Bet
                  </Button>
                )}
              </CardActions>
              <Typography align="center" sx={{}} color="text.secondary">
                Transaction total: {chargeAmount} ETH
              </Typography>
            </Stack>
          </Card>
        </CardContent>
      </Stack>
      <Typography
        sx={{ mb: 1.5, pt: 2, pr: 6, pl: 6 }}
        color="text.secondary"
        align="center"
      >
        Outcome will be determined by 11:59pm on{' '}
        {convertToDate(bet.outcomeDeadline)}
      </Typography>
    </Card>
  )
}

export default BetItem
