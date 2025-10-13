"use client";

import {
  Box,
  Stack,
  Tab,
  Tabs,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import React, {
  useEffect,
  useState,
  Suspense,
  createContext,
  useContext,
} from "react";
import { initializeContract } from "@/lib/betgame";
import BetItem, { Bet } from "@/components/BetItem";
import { styled } from "@mui/system";
import { useSearchParams } from "next/navigation";

interface NotificationContextType {
  showNotification: (
    message: string,
    severity: "info" | "success" | "error"
  ) => void;
  refreshBets: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
  refreshBets: () => {},
});

export const useNotificationContext = () => useContext(NotificationContext);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ paddingTop: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const MyThemeTabs = styled(Tabs)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.primary.dark,
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

function BetMarketplaceContent() {
  const [openBets, setOpenBets] = useState<Bet[]>([]);
  const [acceptedBets, setAcceptedBets] = useState<Bet[]>([]);
  const [value, setValue] = React.useState(0);
  const [betgame, setBetgame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "info" | "success" | "error"
  >("info");

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const showNotification = (
    message: string,
    severity: "info" | "success" | "error"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const refreshBets = async () => {
    if (betgame) {
      await getBets(betgame);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError(null);
        const contract = await initializeContract();
        setBetgame(contract);

        if (contract) {
          await getBets(contract);
        } else {
          setError(
            "Failed to initialize contract. Please check your wallet connection."
          );
        }

        // Check for notification from URL params (for create bet redirects)
        const createSuccess = searchParams.get("createSuccess") === "true";
        if (createSuccess) {
          showNotification("Bet successfully created!", "success");
          window.history.replaceState({}, "", "/bet-marketplace");
        }
      } catch (err) {
        console.error("Error initializing:", err);
        setError("Failed to load bets. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [searchParams]);

  const getBets = async (contract: any) => {
    console.log("Getting active bets");
    let openIDs = await contract.methods.getActiveBets().call();
    console.log("Active bet IDs:", openIDs);

    let oB: Bet[] = [];
    for (let index = 0; index < openIDs.length; index++) {
      console.log("Fetching bet ID", openIDs[index]);
      let details = await contract.methods.getBetDetails(openIDs[index]).call();
      console.log("Bet details:", details);

      const bet = details.bet || details[0];
      const title = details.title || details[1];
      const creatorApi = details.creatorApi || details[2];

      let tmpBet: Bet = {
        id: parseInt(openIDs[index]),
        title: title,
        apiURL: creatorApi,
        amount: bet.creatorAmount,
        acceptValue: bet.acceptorAmount,
        countArts: parseInt(bet.targetValue),
        createdDate: "0", // Not available in new contract
        startDate: "0",
        acceptDeadline: bet.acceptByDate,
        outcomeDeadline: bet.expirationDate,
        creator: bet.creator,
        acceptor: bet.acceptor,
        accepted: bet.status === "1", // Status 1 = Accepted
      };
      oB.push(tmpBet);
    }
    setOpenBets(oB);
    console.log("Open bets array:", oB);

    console.log("Getting accepted bets");
    let acceptedIDs = await contract.methods.getAcceptedBets().call();
    console.log("Accepted bet IDs:", acceptedIDs);

    let aB: Bet[] = [];
    for (let index = 0; index < acceptedIDs.length; index++) {
      console.log("Fetching bet ID", acceptedIDs[index]);
      let details = await contract.methods
        .getBetDetails(acceptedIDs[index])
        .call();
      console.log("Bet details:", details);

      const bet = details.bet || details[0];
      const title = details.title || details[1];
      const creatorApi = details.creatorApi || details[2];

      // Filter out resolved (status 2) and cancelled (status 3) bets
      const betStatus = parseInt(bet.status);
      if (betStatus === 2 || betStatus === 3) {
        console.log(
          `Skipping bet ${acceptedIDs[index]} - Status: ${betStatus}`
        );
        continue;
      }

      let tmpBet: Bet = {
        id: parseInt(acceptedIDs[index]),
        title: title,
        apiURL: creatorApi,
        amount: bet.creatorAmount,
        acceptValue: bet.acceptorAmount,
        countArts: parseInt(bet.targetValue),
        createdDate: "0", // Not available in new contract
        startDate: "0",
        acceptDeadline: bet.acceptByDate,
        outcomeDeadline: bet.expirationDate,
        creator: bet.creator,
        acceptor: bet.acceptor,
        accepted: true, // All in accepted array are accepted
      };
      aB.push(tmpBet);
    }
    setAcceptedBets(aB);
    console.log("Accepted bets array:", aB);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, refreshBets }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={
          snackbarSeverity === "success"
            ? 10000
            : snackbarSeverity === "error"
            ? null
            : null
        }
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <div
        style={{
          marginTop: "5%",
          marginBottom: "5%",
          marginLeft: "10%",
          marginRight: "10%",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Spline Sans Mono",
            fontSize: 45,
            fontWeight: 700,
            fontStyle: "italic",
          }}
          gutterBottom
          color="secondary.main"
        >
          Bet Marketplace
        </Typography>
        <Box sx={{ width: "100%" }}>
          <Box>
            <MyThemeTabs
              value={value}
              onChange={handleChange}
              aria-label="basic MyThemeTabs example"
              textColor="inherit"
            >
              <Tab
                sx={{ paddingRight: 3, fontFamily: "Spline Sans Mono" }}
                label="Open Bets"
                {...a11yProps(0)}
              />
              <Tab
                sx={{ fontFamily: "Spline Sans Mono" }}
                label="Accepted Bets"
                {...a11yProps(1)}
              />
            </MyThemeTabs>
          </Box>
          <TabPanel value={value} index={0}>
            {loading ? (
              <Typography sx={{ textAlign: "center", padding: 4 }}>
                Loading bets...
              </Typography>
            ) : error ? (
              <Alert severity="error" sx={{ marginTop: 2 }}>
                {error}
              </Alert>
            ) : openBets.length === 0 ? (
              <Typography sx={{ textAlign: "center", padding: 4 }}>
                No open bets available. Create one to get started!
              </Typography>
            ) : (
              <Stack>
                {openBets.map((bet, index) => (
                  <BetItem key={index} bet={bet} betgame={betgame}></BetItem>
                ))}
              </Stack>
            )}
          </TabPanel>
          <TabPanel value={value} index={1}>
            {loading ? (
              <Typography sx={{ textAlign: "center", padding: 4 }}>
                Loading bets...
              </Typography>
            ) : error ? (
              <Alert severity="error" sx={{ marginTop: 2 }}>
                {error}
              </Alert>
            ) : acceptedBets.length === 0 ? (
              <Typography sx={{ textAlign: "center", padding: 4 }}>
                No accepted bets yet. Accept a bet to see it here!
              </Typography>
            ) : (
              <Stack>
                {acceptedBets.map((bet, index) => (
                  <BetItem key={index} bet={bet} betgame={betgame}></BetItem>
                ))}
              </Stack>
            )}
          </TabPanel>
        </Box>
      </div>
    </NotificationContext.Provider>
  );
}

export default function BetMarketplace() {
  return (
    <Suspense fallback={<div style={{ margin: "5%" }}>Loading...</div>}>
      <BetMarketplaceContent />
    </Suspense>
  );
}
