import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import React, { useEffect, useState } from 'react'
import betgame from '../betgame'
import BetItem from './BetItem'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export interface Bet {
  id: number
  title: string
  apiURL: string
  amount: string
  acceptValue: string
  countArts: number
  createdDate: string
  startDate: string
  acceptDeadline: string
  outcomeDeadline: string
  creator: string
  acceptor: string
  accepted: boolean
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ paddingTop: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

function BetMarketplace() {
  const [openBets, setOpenBets] = useState<Bet[]>([])
  const [acceptedBets, setAcceptedBets] = useState<Bet[]>([])
  const [value, setValue] = React.useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  useEffect(() => {
    // Create a scoped async function in the hook
    async function anyNameFunction() {
      await getBets()
    }
    // Execute the created function directly
    anyNameFunction()
  }, [])

  const getBets = async () => {
    console.log('Getting active bets')
    let openIDs = await betgame.methods.getActiveBets().call()

    let oB: Bet[] = []
    for (let index = 0; index < openIDs.length; index++) {
      console.log('Bet ID', openIDs[index])
      let t = await betgame.methods.allBets(openIDs[index]).call()
      console.log(t)
      let tmpBet: Bet = {
        id: parseInt(t[0]),
        title: t[1],
        apiURL: t[4],
        amount: t[5],
        acceptValue: t[6],
        countArts: parseInt(t[10]),
        createdDate: t[11][0],
        startDate: t[11][2],
        acceptDeadline: t[11][1],
        outcomeDeadline: t[11][3],
        creator: t[2],
        acceptor: t[3],
        accepted: t[7],
      }
      oB.push(tmpBet)
    }
    setOpenBets(oB)
    console.log(openBets)

    console.log('Getting accepted bets')
    let acceptedIDs = await betgame.methods.getAcceptedBets().call()

    let aB: Bet[] = []
    for (let index = 0; index < acceptedIDs.length; index++) {
      console.log('Bet ID', acceptedIDs[index])
      let t = await betgame.methods.allBets(acceptedIDs[index]).call()
      console.log(t)
      let tmpBet: Bet = {
        id: parseInt(t[0]),
        title: t[1],
        apiURL: t[4],
        amount: t[5],
        acceptValue: t[6],
        countArts: parseInt(t[10]),
        createdDate: t[11][0],
        startDate: t[11][2],
        acceptDeadline: t[11][1],
        outcomeDeadline: t[11][3],
        creator: t[2],
        acceptor: t[3],
        accepted: t[7],
      }
      aB.push(tmpBet)
    }
    setAcceptedBets(aB)
    console.log(acceptedBets)
  }

  return (
    <div style={{ margin: '3%' }}>
      <h1>Bet Marketplace</h1>
      <Box sx={{ width: '100%' }}>
        <Box>
          <Tabs
            sx={{}}
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab sx={{ paddingRight: 3 }} label="Open Bets" {...a11yProps(0)} />
            <Tab label="Accepted Bets" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Stack>
            {openBets.map((bet, index) => (
              <BetItem key={index} bet={bet}></BetItem>
            ))}
          </Stack>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Stack>
            {acceptedBets.map((bet, index) => (
              <BetItem key={index} bet={bet}></BetItem>
            ))}
          </Stack>
        </TabPanel>
      </Box>
      {/* <pre>{JSON.stringify(openBets, null, 2)}</pre>
      <pre>{JSON.stringify(acceptedBets, null, 2)}</pre> */}
    </div>
  )
}

export default BetMarketplace
