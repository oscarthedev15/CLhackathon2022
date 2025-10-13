"use client";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useWeb3 } from "../lib/Web3Context";
import web3 from "../lib/web3";
import { styled } from "@mui/system";
import { useNotificationContext } from "../lib/NotificationContext";

export interface Bet {
  id: number;
  title: string;
  apiURL: string;
  amount: string;
  acceptValue: string;
  countArts: number;
  createdDate: string;
  startDate: string;
  acceptDeadline: string;
  outcomeDeadline: string;
  creator: string;
  acceptor: string;
  accepted: boolean;
}

const MyThemedCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.text.primary,
}));

interface BetItemProps {
  bet: Bet;
  betgame: any;
}

function BetItem({ bet, betgame }: BetItemProps) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [serviceFee, setServiceFee] = useState("");
  const { isAuthenticated, account } = useWeb3();
  const { showNotification, refreshBets } = useNotificationContext();

  useEffect(() => {
    parseURLString(bet.apiURL);

    async function setContractProp() {
      if (!betgame) return;

      console.log("Setting contract properties");
      let servFeePercentage = await betgame.methods
        .serviceFeePercentage()
        .call();
      // Calculate actual service fee based on bet amount and percentage
      const feeAmount =
        (BigInt(bet.acceptValue) * BigInt(servFeePercentage)) / BigInt(10000);
      setServiceFee(feeAmount.toString());
    }

    setContractProp();
  }, [bet.apiURL, betgame]);

  const parseURLString = (apiURL: string) => {
    try {
      // Parse the URL
      const url = new URL(apiURL);
      const params = new URLSearchParams(url.search);

      // Extract keywords from 'q' parameter
      const keywordParam = params.get("q") || "";
      console.log("Keyword param:", keywordParam);

      if (keywordParam) {
        // Split by comma and remove leading '+' from each keyword
        let keywordsArray = keywordParam.split(",");
        let finalKeywords = keywordsArray.map((k) =>
          k.trim().replace(/^\+/, "")
        );
        console.log("Final keywords:", finalKeywords);
        setKeywords(finalKeywords);
      }

      // Extract sources from 'sources' parameter
      const sourcesParam = params.get("sources") || "";
      console.log("Sources param:", sourcesParam);

      if (sourcesParam && sourcesParam.length > 0) {
        let finalSources = sourcesParam.split(",").map((s) => s.trim());
        console.log("Final sources:", finalSources);
        setSources(finalSources);
      } else {
        setSources([]);
      }
    } catch (error) {
      console.error("Error parsing API URL:", error);
      setKeywords([]);
      setSources([]);
    }
  };

  const convertToDate = (unix: string) => {
    const t = parseInt(unix);
    const milliseconds = t * 1000;
    const dateObject = new Date(milliseconds);
    const dateTimestamp = dateObject.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return dateTimestamp;
  };

  const calculateDaysLeft = (accept: string) => {
    let today = new Date();

    const t = parseInt(accept);
    const milliseconds = t * 1000;
    const dateObject = new Date(milliseconds);
    let diff = dateObject.getTime() - today.getTime();
    var days = Math.ceil(diff / (1000 * 3600 * 24));
    return days;
  };

  const acceptBet = async (id: number, apiURL: string) => {
    if (isAuthenticated && account && betgame) {
      let fromDate = new Date(Date.now());
      let fromDateStr = fromDate.toISOString();
      console.log(fromDateStr);
      let beginningStr = "&from=";
      let finalFromStr = beginningStr.concat(fromDateStr);
      const newApiURL = apiURL.concat(finalFromStr);
      console.log(newApiURL);

      console.log("Calling acceptBet function");

      let cA = parseInt(bet.acceptValue) + parseInt(serviceFee);
      console.log(cA);
      console.log(typeof serviceFee);

      try {
        const promiEvent = betgame.methods.acceptBet(id, newApiURL).send({
          from: account,
          value: cA,
          // Gas will be automatically estimated by web3
        });

        // Set up event listeners
        promiEvent
          .on("transactionHash", (hash: string) => {
            console.log("Transaction signed:", hash);
            showNotification(
              "Transaction signed! Accepting bet, please wait...",
              "info"
            );
          })
          .on("receipt", async (receipt: any) => {
            console.log("Transaction receipt:", receipt);

            // Check if transaction was successful
            if (
              receipt.status === true ||
              receipt.status === 1 ||
              receipt.status === "0x1"
            ) {
              showNotification("Bet successfully accepted!", "success");
              // Refresh bets to update the UI
              await refreshBets();
            } else {
              // Transaction failed (reverted)
              console.error("Transaction reverted:", receipt);
              showNotification(
                "Transaction failed. The contract rejected your action. Please try again.",
                "error"
              );
            }
          })
          .on("error", (error: any) => {
            console.error("Transaction error:", error);
            showNotification(
              "Failed to accept bet. Please try again.",
              "error"
            );
          });
      } catch (error) {
        console.error(error);
        showNotification("Failed to accept bet. Please try again.", "error");
      }
    }
  };

  const checkBet = async (id: number) => {
    if (account && betgame) {
      try {
        const promiEvent = betgame.methods.checkBet(id).send({
          from: account,
          // Gas will be automatically estimated by web3
        });

        // Set up event listeners
        promiEvent
          .on("transactionHash", (hash: string) => {
            console.log("Transaction signed:", hash);
            showNotification(
              "Transaction signed! Checking bet results, please wait...",
              "info"
            );
          })
          .on("receipt", async (receipt: any) => {
            console.log("Transaction receipt:", receipt);

            // Check if transaction was successful
            if (
              receipt.status === true ||
              receipt.status === 1 ||
              receipt.status === "0x1"
            ) {
              showNotification("Bet results checked successfully!", "success");
              // Refresh bets to update the UI
              await refreshBets();
            } else {
              // Transaction failed (reverted)
              console.error("Transaction reverted:", receipt);
              showNotification(
                "Transaction failed. The contract rejected your action. Please try again.",
                "error"
              );
            }
          })
          .on("error", (error: any) => {
            console.error("Transaction error:", error);
            showNotification("Failed to check bet. Please try again.", "error");
          });
      } catch (error) {
        console.error(error);
        showNotification("Failed to check bet. Please try again.", "error");
      }
    }
  };

  return (
    <Card sx={{ minWidth: 275, mb: 5, p: 2 }} raised>
      <Stack
        direction="row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignContent: "space-between",
        }}
      >
        <Box style={{ width: "70%" }} sx={{ pl: 2 }}>
          <Typography sx={{ fontSize: 30 }}>{bet.title}</Typography>
          <Typography
            sx={{
              fontSize: 14,
              fontStyle: "italic",
              color: "text.secondary",
              mt: 0.5,
            }}
          >
            Bet ID: #{bet.id}
          </Typography>
        </Box>
        <CardContent style={{ width: "30%" }}>
          {bet.createdDate && bet.createdDate !== "0" ? (
            <Typography
              align="right"
              sx={{ fontSize: 14, fontStyle: "italic" }}
              color="text.primary"
            >
              Created {convertToDate(bet.createdDate)}
            </Typography>
          ) : null}
          <>
            {bet.accepted && (
              <Typography
                align="right"
                sx={{ fontSize: 14, fontStyle: "italic" }}
                color="text.primary"
              >
                Accepted {convertToDate(bet.startDate)}
              </Typography>
            )}
          </>
        </CardContent>
      </Stack>

      <Stack
        direction="row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignContent: "space-between",
        }}
      >
        <CardContent style={{ width: "70%", height: "100%" }}>
          <Typography
            sx={{ mb: 1.5, fontFamily: "Spline Sans Mono", fontSize: 20 }}
            color="secondary.main"
          >
            Bet Conditions
          </Typography>
          <Container sx={{ mb: 2 }}>
            <Typography
              sx={{ fontSize: 14, fontStyle: "italic" }}
              color="text.primary"
              gutterBottom
              component="div"
            >
              <Box fontWeight="600" display="inline">
                Keywords:
              </Box>{" "}
              {keywords.join(", ")}
            </Typography>

            {sources.length === 0 ? (
              <Typography
                sx={{ fontSize: 14, fontStyle: "italic", fontWeight: 600 }}
                color="text.primary"
                gutterBottom
              >
                All sources
              </Typography>
            ) : (
              <Typography
                sx={{ fontSize: 14, fontStyle: "italic" }}
                color="text.primary"
                gutterBottom
                component="div"
              >
                <Box fontWeight="600" display="inline">
                  Sources:
                </Box>{" "}
                {sources.join(", ")}
              </Typography>
            )}

            <Typography
              sx={{ fontSize: 14, fontStyle: "italic" }}
              color="text.primary"
              gutterBottom
              component="div"
            >
              At least{" "}
              <Box fontWeight="600" display="inline">
                {bet.countArts} articles
              </Box>
            </Typography>
          </Container>
          <Typography
            sx={{ mb: 1.5, fontFamily: "Spline Sans Mono", fontSize: 20 }}
            color="secondary.main"
            gutterBottom
          >
            Wager Details
          </Typography>
          <Container>
            <Typography
              sx={{ fontSize: 14, fontStyle: "italic" }}
              color="text.primary"
              gutterBottom
              component="div"
            >
              Creator wagered{" "}
              <Box fontWeight="600" display="inline">
                {web3.utils.fromWei(bet.amount, "ether")} ETH
              </Box>
            </Typography>

            {bet.accepted ? (
              <Typography
                sx={{ fontSize: 14, fontStyle: "italic" }}
                color="text.primary"
                gutterBottom
                component="div"
              >
                Acceptor wagered{" "}
                <Box fontWeight="600" display="inline">
                  {web3.utils.fromWei(bet.acceptValue, "ether")} ETH
                </Box>
              </Typography>
            ) : (
              <Typography
                sx={{ fontSize: 14, fontStyle: "italic" }}
                color="text.primary"
                gutterBottom
                component="div"
              >
                Acceptor must wager{" "}
                <Box fontWeight="600" display="inline">
                  {web3.utils.fromWei(bet.acceptValue, "ether")} ETH
                </Box>
              </Typography>
            )}
          </Container>
        </CardContent>

        <CardContent style={{ width: "30%" }}>
          <MyThemedCard style={{ height: "100%" }} raised>
            <Stack
              direction="column"
              justifyContent="space-evenly"
              alignItems="center"
              spacing={2}
              style={{ height: "100%" }}
              sx={{ mt: 0, pb: 4 }}
            >
              {bet.accepted ? (
                <Typography
                  component="div"
                  align="center"
                  color="text.secondary"
                >
                  <Stack>
                    <Typography sx={{ fontSize: 50, fontWeight: 600, pb: 0 }}>
                      {calculateDaysLeft(bet.outcomeDeadline)}
                    </Typography>
                    <Typography sx={{ mx: "2%" }}>
                      days until outcome is determined
                    </Typography>
                  </Stack>
                </Typography>
              ) : (
                <Typography
                  component="div"
                  align="center"
                  color="text.secondary"
                >
                  <Stack>
                    <Typography sx={{ fontSize: 50, fontWeight: 600, pb: 0 }}>
                      {calculateDaysLeft(bet.acceptDeadline)}
                    </Typography>
                    <Typography>days left to accept</Typography>
                  </Stack>
                </Typography>
              )}

              <CardActions>
                {bet.accepted ? (
                  <Button
                    onClick={() => checkBet(bet.id)}
                    size="medium"
                    variant="contained"
                    sx={{ m: 0, p: 2 }}
                  >
                    <Typography
                      textAlign="center"
                      sx={{
                        color: "text.primary",
                        fontFamily: "Spline Sans Mono",
                        fontWeight: 900,
                      }}
                    >
                      CHECK BET
                    </Typography>
                  </Button>
                ) : (
                  <Stack>
                    <Button
                      onClick={() => acceptBet(bet.id, bet.apiURL)}
                      size="medium"
                      variant="contained"
                      sx={{ my: 1, mx: 7, p: 2 }}
                    >
                      <Typography
                        textAlign="center"
                        sx={{
                          color: "text.primary",
                          fontFamily: "Spline Sans Mono",
                          fontWeight: 900,
                        }}
                      >
                        ACCEPT BET
                      </Typography>
                    </Button>
                    <Typography
                      sx={{ fontSize: 14, fontStyle: "italic" }}
                      color="text.secondary"
                      gutterBottom
                      component="div"
                      align="center"
                    >
                      You will also be charged a service fee of{" "}
                      <Box fontWeight="600" display="inline">
                        {web3.utils.fromWei(serviceFee.toString(), "ether")} ETH{" "}
                      </Box>
                    </Typography>
                  </Stack>
                )}
              </CardActions>
            </Stack>
          </MyThemedCard>
        </CardContent>
      </Stack>
      <>
        {!bet.accepted && (
          <Typography
            sx={{ mb: 1.5, pt: 2, pr: 6, pl: 6, fontWeight: 500, fontSize: 20 }}
            color="primary.dark"
            align="center"
          >
            Outcome will be determined by 11:59pm on{" "}
            {convertToDate(bet.outcomeDeadline)}
          </Typography>
        )}
      </>
    </Card>
  );
}

export default BetItem;
