"use client";

import {
  Box,
  Stack,
  Tab,
  Tabs,
  Typography,
  Alert,
  Card,
  CardContent,
  Chip,
  Grid,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { initializeContract } from "@/lib/betgame";
import { useWeb3 } from "@/lib/Web3Context";
import { styled } from "@mui/system";
import web3 from "@/lib/web3";

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

interface BetHistoryItem {
  id: number;
  title: string;
  creatorAmount: string;
  acceptorAmount: string;
  targetValue: string;
  acceptByDate: string;
  expirationDate: string;
  status: string;
  creator: string;
  acceptor: string;
  winner: string;
  userRole: "creator" | "acceptor";
  outcome?: "won" | "lost" | "pending" | "cancelled";
}

export default function UserHistory() {
  const { account, isAuthenticated } = useWeb3();
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createdBets, setCreatedBets] = useState<BetHistoryItem[]>([]);
  const [acceptedBets, setAcceptedBets] = useState<BetHistoryItem[]>([]);
  const [wonBets, setWonBets] = useState<BetHistoryItem[]>([]);
  const [lostBets, setLostBets] = useState<BetHistoryItem[]>([]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (account && isAuthenticated) {
      fetchUserHistory();
    } else {
      setLoading(false);
    }
  }, [account, isAuthenticated]);

  const fetchUserHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const contract = await initializeContract();
      if (!contract || !account) {
        setError("Failed to initialize contract or no account connected.");
        return;
      }

      // Get all user's bet IDs
      const userBetIds = await contract.methods.getUserBets(account).call();
      console.log("User bet IDs:", userBetIds);

      // Use a Set to track processed bet IDs and avoid duplicates
      const processedBetIds = new Set<number>();

      const created: BetHistoryItem[] = [];
      const accepted: BetHistoryItem[] = [];
      const won: BetHistoryItem[] = [];
      const lost: BetHistoryItem[] = [];

      for (let i = 0; i < userBetIds.length; i++) {
        const betId = parseInt(userBetIds[i]);

        // Skip if we've already processed this bet ID
        if (processedBetIds.has(betId)) {
          console.log(`Skipping duplicate bet ID: ${betId}`);
          continue;
        }
        processedBetIds.add(betId);

        const details = await contract.methods.getBetDetails(betId).call();

        const bet = details.bet || details[0];
        const title = details.title || details[1];

        const betStatus = parseInt(bet.status);
        const isCreator = bet.creator.toLowerCase() === account.toLowerCase();
        const isAcceptor = bet.acceptor.toLowerCase() === account.toLowerCase();
        const isWinner =
          bet.winner && bet.winner.toLowerCase() === account.toLowerCase();

        const historyItem: BetHistoryItem = {
          id: betId,
          title: title,
          creatorAmount: web3.utils.fromWei(bet.creatorAmount, "ether"),
          acceptorAmount: web3.utils.fromWei(bet.acceptorAmount, "ether"),
          targetValue: bet.targetValue,
          acceptByDate: new Date(
            parseInt(bet.acceptByDate) * 1000
          ).toLocaleDateString(),
          expirationDate: new Date(
            parseInt(bet.expirationDate) * 1000
          ).toLocaleDateString(),
          status: getStatusText(betStatus),
          creator: bet.creator,
          acceptor: bet.acceptor,
          winner: bet.winner,
          userRole: isCreator ? "creator" : "acceptor",
        };

        // Categorize bets with mutually exclusive logic
        if (betStatus === 2) {
          // Resolved - add to won or lost
          if (isWinner) {
            historyItem.outcome = "won";
            won.push(historyItem);
          } else {
            historyItem.outcome = "lost";
            lost.push(historyItem);
          }
        } else if (betStatus === 3) {
          // Cancelled - don't show in any category for now
          historyItem.outcome = "cancelled";
        } else if (betStatus === 0 && isCreator) {
          // Active bets created by user (not yet accepted)
          historyItem.outcome = "pending";
          created.push(historyItem);
        } else if (betStatus === 1 && isAcceptor) {
          // Accepted bets where user is acceptor
          historyItem.outcome = "pending";
          accepted.push(historyItem);
        }
      }

      setCreatedBets(created);
      setAcceptedBets(accepted);
      setWonBets(won);
      setLostBets(lost);
    } catch (err) {
      console.error("Error fetching user history:", err);
      setError("Failed to load user history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: number): string => {
    switch (status) {
      case 0:
        return "Active";
      case 1:
        return "Accepted";
      case 2:
        return "Resolved";
      case 3:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getOutcomeColor = (
    outcome?: string
  ): "success" | "error" | "warning" | "info" => {
    switch (outcome) {
      case "won":
        return "success";
      case "lost":
        return "error";
      case "cancelled":
        return "warning";
      default:
        return "info";
    }
  };

  const BetCard = ({ bet }: { bet: BetHistoryItem }) => (
    <Card sx={{ mb: 2, border: "1px solid #e0e0e0" }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography
              variant="h6"
              sx={{ fontFamily: "Spline Sans Mono", mb: 1 }}
            >
              {bet.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Bet ID: #{bet.id}
            </Typography>
            <Typography variant="body2" component="div" sx={{ mb: 0.5 }}>
              <strong>Your Role:</strong>{" "}
              <Chip
                label={bet.userRole === "creator" ? "Creator" : "Acceptor"}
                size="small"
                color={bet.userRole === "creator" ? "primary" : "secondary"}
                sx={{ ml: 1 }}
              />
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Creator Amount:</strong> {bet.creatorAmount} ETH
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Acceptor Amount:</strong> {bet.acceptorAmount} ETH
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Target Value:</strong> {bet.targetValue}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Accept By:</strong> {bet.acceptByDate}
            </Typography>
            <Typography variant="body2">
              <strong>Expiration:</strong> {bet.expirationDate}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <Chip
              label={bet.status}
              color={bet.status === "Active" ? "info" : "default"}
              sx={{ mb: 1 }}
            />
            {bet.outcome && (
              <Chip
                label={bet.outcome.toUpperCase()}
                color={getOutcomeColor(bet.outcome)}
                sx={{ fontWeight: "bold" }}
              />
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
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
          User History
        </Typography>
        <Alert severity="warning" sx={{ marginTop: 2 }}>
          Please connect your wallet to view your betting history.
        </Alert>
      </Box>
    );
  }

  return (
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
        User History
      </Typography>

      <Box sx={{ width: "100%", marginTop: 3 }}>
        <Box>
          <MyThemeTabs
            value={value}
            onChange={handleChange}
            aria-label="user history tabs"
            textColor="inherit"
          >
            <Tab
              sx={{ paddingRight: 3, fontFamily: "Spline Sans Mono" }}
              label={`Created Bets (${createdBets.length})`}
              {...a11yProps(0)}
            />
            <Tab
              sx={{ paddingRight: 3, fontFamily: "Spline Sans Mono" }}
              label={`Accepted Bets (${acceptedBets.length})`}
              {...a11yProps(1)}
            />
            <Tab
              sx={{ paddingRight: 3, fontFamily: "Spline Sans Mono" }}
              label={`Won Bets (${wonBets.length})`}
              {...a11yProps(2)}
            />
            <Tab
              sx={{ fontFamily: "Spline Sans Mono" }}
              label={`Lost Bets (${lostBets.length})`}
              {...a11yProps(3)}
            />
          </MyThemeTabs>
        </Box>

        <TabPanel value={value} index={0}>
          {loading ? (
            <Typography sx={{ textAlign: "center", padding: 4 }}>
              Loading your created bets...
            </Typography>
          ) : error ? (
            <Alert severity="error" sx={{ marginTop: 2 }}>
              {error}
            </Alert>
          ) : createdBets.length === 0 ? (
            <Typography sx={{ textAlign: "center", padding: 4 }}>
              You haven&apos;t created any open bets yet. Create one to get
              started!
            </Typography>
          ) : (
            <Stack>
              {createdBets.map((bet) => (
                <BetCard key={bet.id} bet={bet} />
              ))}
            </Stack>
          )}
        </TabPanel>

        <TabPanel value={value} index={1}>
          {loading ? (
            <Typography sx={{ textAlign: "center", padding: 4 }}>
              Loading your accepted bets...
            </Typography>
          ) : error ? (
            <Alert severity="error" sx={{ marginTop: 2 }}>
              {error}
            </Alert>
          ) : acceptedBets.length === 0 ? (
            <Typography sx={{ textAlign: "center", padding: 4 }}>
              You haven&apos;t accepted any bets yet.
            </Typography>
          ) : (
            <Stack>
              {acceptedBets.map((bet) => (
                <BetCard key={bet.id} bet={bet} />
              ))}
            </Stack>
          )}
        </TabPanel>

        <TabPanel value={value} index={2}>
          {loading ? (
            <Typography sx={{ textAlign: "center", padding: 4 }}>
              Loading your won bets...
            </Typography>
          ) : error ? (
            <Alert severity="error" sx={{ marginTop: 2 }}>
              {error}
            </Alert>
          ) : wonBets.length === 0 ? (
            <Typography sx={{ textAlign: "center", padding: 4 }}>
              No winning bets yet. Keep betting!
            </Typography>
          ) : (
            <Stack>
              {wonBets.map((bet) => (
                <BetCard key={bet.id} bet={bet} />
              ))}
            </Stack>
          )}
        </TabPanel>

        <TabPanel value={value} index={3}>
          {loading ? (
            <Typography sx={{ textAlign: "center", padding: 4 }}>
              Loading your lost bets...
            </Typography>
          ) : error ? (
            <Alert severity="error" sx={{ marginTop: 2 }}>
              {error}
            </Alert>
          ) : lostBets.length === 0 ? (
            <Typography sx={{ textAlign: "center", padding: 4 }}>
              No lost bets. You&apos;re doing great!
            </Typography>
          ) : (
            <Stack>
              {lostBets.map((bet) => (
                <BetCard key={bet.id} bet={bet} />
              ))}
            </Stack>
          )}
        </TabPanel>
      </Box>
    </div>
  );
}
