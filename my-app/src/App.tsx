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
  


  return (
    <div>
      <ResponsiveAppBar />
        <Routes>
          <Route path="/CLHackathon2022"  element={<Home />} />
          <Route path="/CLHackathon2022/CreateBet" element={<CreateBet />} />
          <Route path="/CLHackathon2022/BetMarketplace" element={<BetMarketplace />} />
          <Route path="/CLHackathon2022/Chat" element={<Chat />} />
        </Routes>
      
    </div>
  )
}

export default App
