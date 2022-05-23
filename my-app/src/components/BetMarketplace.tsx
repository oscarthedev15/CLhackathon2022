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
  amount: number
  acceptValue: number
  countArts: number
}

// const Item = styled(Paper)(({ theme }) => ({
//   backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
//   ...theme.typography.body2,
//   padding: theme.spacing(1),
//   textAlign: 'center',
//   color: theme.palette.text.secondary,
// }))

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
    let openIDs = await betgame.methods.getActiveBets().call()

    let tB: Bet[] = []
    for (let index = 0; index < openIDs.length; index++) {
      console.log('Bet ID', index)
      let t = await betgame.methods.allBets(index).call()
      console.log(t)
      let tmpBet: Bet = {
        id: t[0],
        title: t[1],
        apiURL: t[4],
        amount: t[5],
        acceptValue: t[6],
        countArts: t[10],
      }
      tB.push(tmpBet)
    }
    setOpenBets(tB)
    console.log(openBets)

    // console.log('Getting all accepted bets')
    // let acceptedIDs = await betgame.methods.getAcceptedBets().call()
    // setAcceptedBets(tmpAccepted)
  }

  return (
    <div>
      <h1>Bet Marketplace</h1>
      <Stack>
        {openBets.map((bet, index) => (
          <BetItem key={index} bet={bet}></BetItem>
        ))}
      </Stack>
      <pre>{JSON.stringify(openBets, null, 2)}</pre>
      <pre>{JSON.stringify(acceptedBets, null, 2)}</pre>
    </div>
  )
}

export default BetMarketplace
