import React, { useEffect } from 'react';
import {Route, Routes} from 'react-router';
import logo from './logo.svg';
import './App.css';
import { useMoralis } from "react-moralis";
import ResponsiveAppBar from './components/Nav';
import Home from './components/Home';
import CreateBet from './components/CreateBet';
import BetMarketplace from './components/BetMarketplace';
import YourStats from './components/YourStats';

function App() {

    const { authenticate, isAuthenticated, isAuthenticating, user, account, logout } = useMoralis();

    useEffect(() => {
    if (isAuthenticated) {
      // add your logic here
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

    const login = async () => {
      if (!isAuthenticated) {

        await authenticate({signingMessage: "Log in using Moralis" })
          .then(function (user) {
            console.log("logged in user:", user);
            console.log(user!.get("ethAddress"));
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    }

    const logOut = async () => {
      await logout();
      console.log("logged out");
    }

  return (
    <div>
      <ResponsiveAppBar />
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/Create%20a%20Bet" element={<CreateBet />} /> 
        <Route path="//Bet%20Marketplace" element={<BetMarketplace />} /> 
        <Route path="/Your%20Stats" element={<YourStats />} /> 
      </Routes>
      <h1>Moralis Hello World!</h1>
      <button onClick={login}>Moralis Metamask Login</button>
      <button onClick={logOut} disabled={isAuthenticating}>Logout</button>
    </div>
  );
}

export default App;