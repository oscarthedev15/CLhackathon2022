import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import React, { useEffect, useState } from 'react'
import betgame from '../betgame'
import BetItem from './BetItem'

export interface Bet {
  id: number
  title: string
  apiURL: string
  amount: string
  acceptValue: string
  countArts: number
  createdDate: string
  acceptDeadline: string
  outcomeDeadline: string
  creator: string
  acceptor: string
}

function BetMarketplace() {
  const [openBets, setOpenBets] = useState<Bet[]>([])
  const [acceptedBets, setAcceptedBets] = useState<Bet[]>([])

  useEffect(() => {
    // Create a scoped async function in the hook
    async function anyNameFunction() {
      await getBets()
    }
    // Execute the created function directly
    anyNameFunction()
  }, [])

  const getBets = async () => {
    console.log('Getting all bets')
    let openIDs = await betgame.methods.getAcceptedBets().call()

    let tB: Bet[] = []
    for (let index = 0; index < openIDs.length; index++) {
      console.log('Bet ID', openIDs[index])
      let t = await betgame.methods.allBets(openIDs[index]).call()
      console.log(t)
      // console.log(parseInt(t[11][1]))
      let tmpBet: Bet = {
        id: parseInt(t[0]),
        title: t[1],
        apiURL: t[4],
        amount: t[5],
        acceptValue: t[6],
        countArts: parseInt(t[10]),
        createdDate: t[11][0],
        acceptDeadline: t[11][1],
        outcomeDeadline: t[11][3],
        creator: t[2],
        acceptor: t[3],
      }
      tB.push(tmpBet)
    }
    setAcceptedBets(tB)
    console.log(acceptedBets)

    // console.log('Getting all accepted bets')
    // let acceptedIDs = await betgame.methods.getAcceptedBets().call()
    // setAcceptedBets(tmpAccepted)
  }

  return (
    <div>
      <h1>Bet Marketplace</h1>
      <Stack>
        {acceptedBets.map((bet, index) => (
          <BetItem key={index} bet={bet}></BetItem>
        ))}
      </Stack>
      <pre>{JSON.stringify(openBets, null, 2)}</pre>
      <pre>{JSON.stringify(acceptedBets, null, 2)}</pre>
    </div>
  )
}

export default BetMarketplace
