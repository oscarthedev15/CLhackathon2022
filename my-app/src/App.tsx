import { Route, Routes } from 'react-router'

import './App.css'
import ResponsiveAppBar from './components/Nav'
import Home from './components/Home'
import CreateBet from './components/CreateBet'
import BetMarketplace from './components/BetMarketplace'
import Chat from './components/Chat.js'
import { ThemeProvider } from '@mui/material/styles'
import theme from './theme'

function App() {
  return (
    <div>
      <ThemeProvider theme={theme}>
        <ResponsiveAppBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/CreateBet" element={<CreateBet />} />
          <Route path="/BetMarketplace" element={<BetMarketplace />} />
          <Route path="/Chat" element={<Chat />} />
        </Routes>
      </ThemeProvider>
    </div>
  )
}

export default App
