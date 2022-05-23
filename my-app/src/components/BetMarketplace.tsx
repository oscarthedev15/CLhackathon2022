import React from 'react'
import { useEffect } from 'react'
import { useMoralis } from 'react-moralis'
import betgame from '../betgame'
import web3 from '../web3'

function BetMarketplace() {
  const [openBets, setOpenBets] = React.useState([])
  const [acceptedBets, setAcceptedBets] = React.useState([])

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
    let tmpOpen = await betgame.methods.getActiveBets().call()
    setOpenBets(tmpOpen)

    console.log('Getting all accepted bets')
    let tmpAccepted = await betgame.methods.getAcceptedBets().call()
    setAcceptedBets(tmpAccepted)
  }

  return (
    <div>
      <h1>Bet Marketplace</h1>
      <pre>{JSON.stringify(openBets, null, 2)}</pre>
      <pre>{JSON.stringify(acceptedBets, null, 2)}</pre>
    </div>
  )
}

export default BetMarketplace
