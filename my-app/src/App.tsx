import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import logo from './logo.svg'
import './App.css'
import { useMoralis } from 'react-moralis'
import ResponsiveAppBar from './components/Nav'
import Home from './components/Home'
import CreateBet from './components/CreateBet'
import BetMarketplace from './components/BetMarketplace'
import YourStats from './components/YourStats'
import betgame from './betgame'
import web3 from './web3'

function App() {
  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
    user,
    account,
    logout,
  } = useMoralis()

  const [balance, setBalance] = React.useState('')
  const [allBets, setAllBets] = React.useState(new Map())

  useEffect(() => {
    if (isAuthenticated) {
      // setCurrAccount(account);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

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

  const logOut = async () => {
    await logout()
    console.log('logged out')
  }

  const checkContract = async () => {
    const address = await betgame.options.address
    setBalance(address)

    // const allBets = await betgame.methods.allBets().call();
    // setAllBets(allBets);
  }

  return (
    <div>
      <ResponsiveAppBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Create%20a%20Bet" element={<CreateBet />} />
        <Route path="/Bet%20Marketplace" element={<BetMarketplace />} />
        <Route path="/Your%20Stats" element={<YourStats />} />
      </Routes>
      <h1>Moralis Hello World!</h1>
      <button onClick={login} disabled={isAuthenticated}>
        Moralis Metamask Login
      </button>
      <button onClick={logOut} disabled={isAuthenticating || !isAuthenticated}>
        Logout
      </button>
      <button onClick={checkContract}>Click to test contract connection</button>
      {isAuthenticated ? (
        <h1>{user!.get('ethAddress')}</h1>
      ) : (
        <h1>User is not authenticated!</h1>
      )}
      <h1>{balance}</h1>
      <h1>{allBets}</h1>
    </div>
  )
}

export default App
