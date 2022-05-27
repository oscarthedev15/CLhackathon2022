
import { Box, Stack, Tab, Tabs, Typography, Alert, AlertTitle } from '@mui/material'
import React, { useEffect, useState } from 'react'
import betgame from '../betgame'
import BetItem from './BetItem'
import { styled } from '@mui/system'
import { useLocation } from 'react-router-dom';

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

const MyThemeTabs = styled(Tabs)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.primary.dark,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.dark,
  },
}))

function BetMarketplace() {
  const [openBets, setOpenBets] = useState<Bet[]>([])
  const [acceptedBets, setAcceptedBets] = useState<Bet[]>([])
  const [value, setValue] = React.useState(0)
  const [success, setSuccess] = useState(false);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  let {state}: any = useLocation();
  useEffect(() => {
    // Create a scoped async function in the hook
    async function anyNameFunction() {
      await getBets()
      setSuccess(state && state.success);
    }
    // Execute the created function directly
    anyNameFunction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div
      style={{
        marginTop: '5%',
        marginBottom: '5%',
        marginLeft: '10%',
        marginRight: '10%',
      }}
    >
      { success? 
      (<Alert severity="success" onClose={() => {setSuccess(false)}}>
      <AlertTitle>Success</AlertTitle>
        Bet successfully created!
        </Alert>) 
        : null}
      <Typography
        sx={{
          fontFamily: 'Spline Sans Mono',
          fontSize: 30,
          fontWeight: 700,
          fontStyle: 'italic',
        }}
        gutterBottom
        color="secondary.main"
      >
        Bet Marketplace
      </Typography>
      <Box sx={{ width: '100%' }}>
        <Box>
          <MyThemeTabs
            value={value}
            onChange={handleChange}
            aria-label="basic MyThemeTabs example"
            textColor="inherit"
            // sx={{ fontFamily: 'Spline Sans Mono' }}
          >
            <Tab
              sx={{ paddingRight: 3, fontFamily: 'Spline Sans Mono' }}
              label="Open Bets"
              {...a11yProps(0)}
            />
            <Tab
              sx={{ fontFamily: 'Spline Sans Mono' }}
              label="Accepted Bets"
              {...a11yProps(1)}
            />
          </MyThemeTabs>
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
    </div>
  )
}

export default BetMarketplace
