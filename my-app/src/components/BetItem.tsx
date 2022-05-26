import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import React, { useEffect, useState } from 'react'
import { useMoralis } from 'react-moralis'
import betgame from '../betgame'
import web3 from '../web3'
import { Bet } from './BetMarketplace'

function BetItem({ bet }: { bet: Bet }) {
  const [keywords, setKeywords] = useState<string[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [serviceFee, setServiceFee] = React.useState('')

  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
    user,
    account,
    logout,
  } = useMoralis()

  useEffect(() => {
    parseURLString(bet.apiURL)

    async function anyNameFunction() {
      await setContractProp()
    }
    // Execute the created function directly
    anyNameFunction()
  }, [])

  const setContractProp = async () => {
    console.log('Setting serviceFee property')

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
    let finalSources = sourceStr.split(',')
    console.log(finalSources)
    setSources(finalSources)
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

      let chargeAmount = parseInt(bet.acceptValue) + parseInt(serviceFee)
      console.log(chargeAmount)
      console.log(typeof serviceFee)
      await betgame.methods.acceptBet(id, newApiURL).send({
        from: userAddress,
        value: chargeAmount,
      })
    }
    else {
      login();
    }
  }

  const checkBet = async (id: number) => {
    const userAddress = await user!.get('ethAddress')

    await betgame.methods.checkBet(id).call()
  }

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {bet.title}
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Keywords: {keywords.join(', ')}
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Sources: {sources.join(', ')}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Bet specifies {bet.countArts} articles as condition of bet
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          This bet can be accepted until {convertToDate(bet.acceptDeadline)} by
          11:59pm
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          This bet's outcome will be determined by{' '}
          {convertToDate(bet.outcomeDeadline)} at 11:59pm
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Creator wagered {web3.utils.fromWei(bet.amount)} ETH
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Amount needed to accept is {web3.utils.fromWei(bet.acceptValue)} ETH
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          You will also be charged a service fee of{' '}
          {web3.utils.fromWei(serviceFee.toString())} when accepting the bet
        </Typography>
      </CardContent>
      <CardActions>
        <Button onClick={() => acceptBet(bet.id, bet.apiURL)} size="small">
          Accept Bet
        </Button>
        <Button onClick={() => checkBet(bet.id)} size="small">
          Check Bet
        </Button>
      </CardActions>
    </Card>
  )
}

export default BetItem
