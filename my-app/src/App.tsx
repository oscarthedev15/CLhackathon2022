import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import './App.css';
import { useMoralis } from 'react-moralis';
import ResponsiveAppBar from './components/Nav';
import Home from './components/Home';
import CreateBet from './components/CreateBet';
import BetMarketplace from './components/BetMarketplace';
import Chat from './components/Chat';
import betgame from './betgame';
import web3 from './web3';

function App() {
  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
    user,
    account,
    logout,
  } = useMoralis()

  const [balance, setBalance] = useState('');
  const [allBets, setAllBets] = useState(new Map());

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

  }

  return (
    <div>
      <ResponsiveAppBar />
      <Routes>
        <Route path="/CLHackathon2022" element={<Home />} />
        <Route path="/CLHackathon2022/CreateBet" element={<CreateBet />} />
        <Route path="/CLHackathon2022/BetMarketplace" element={<BetMarketplace />} />
        <Route path="/CLHackathon2022/Chat" element={<Chat />} />
      </Routes>
      
    </div>
  )
}

export default App
