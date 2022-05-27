import { Route, Routes } from 'react-router';

import './App.css';
import ResponsiveAppBar from './components/Nav';
import Home from './components/Home';
import CreateBet from './components/CreateBet';
import BetMarketplace from './components/BetMarketplace';
import Chat from './components/Chat.js';

function App() {
  return (
    <div>
      <ResponsiveAppBar />
        <Routes>
          <Route path="/"  element={<Home />} />
          <Route path="/CreateBet" element={<CreateBet />} />
          <Route path="/BetMarketplace" element={<BetMarketplace />} />
          <Route path="/Chat" element={<Chat />} />
        </Routes>
    </div>
  )
}

export default App
