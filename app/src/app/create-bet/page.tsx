"use client";

import { Alert, AlertTitle, Snackbar } from "@mui/material";
import { useState, useEffect } from "react";
import { useWeb3 } from "@/lib/Web3Context";
import { initializeContract } from "@/lib/betgame";
import web3 from "@/lib/web3";
import { MyForm } from "@/components/Form";
import { Box, Card, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function CreateBet() {
  const [submitError, setSubmitError] = useState(false);
  const { account } = useWeb3();
  const [betgame, setBetgame] = useState<any>(null);
  const router = useRouter();
  const [serviceFee, setServiceFee] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "info" | "success" | "error"
  >("info");

  useEffect(() => {
    async function init() {
      const contract = await initializeContract();
      setBetgame(contract);

      if (contract) {
        let servFeePercentage = await contract.methods
          .serviceFeePercentage()
          .call();
        setServiceFee(servFeePercentage);
      }
    }
    init();
  }, []);

  const buildApiURL = (apiKeywords: string[], sources: string[]) => {
    let beginningStr = "https://newsapi.org/v2/everything?";

    // should store API key somewhere else
    let endingStr =
      "&searchin=title&language=en&pagesize=1&apiKey=340014d50e764937b75f19426bdd5265";

    let keywordStr = "";
    apiKeywords.forEach((keyword, index) => {
      if (index !== apiKeywords.length - 1) {
        keywordStr = keywordStr + "+" + keyword + ",";
      } else {
        keywordStr = keywordStr + "+" + keyword;
      }
    });
    keywordStr = encodeURIComponent(keywordStr);
    let tmp = "q=";
    keywordStr = tmp.concat(keywordStr);
    console.log(keywordStr);

    let sourceStr = "&sources=";
    sources.forEach((source, index) => {
      if (index !== sources.length - 1) {
        sourceStr = sourceStr + source + ",";
      } else {
        sourceStr = sourceStr + source;
      }
    });

    let finalApiURL = beginningStr.concat(keywordStr, sourceStr, endingStr);
    return finalApiURL;
  };

  const convertToUnix = (date: Date) => {
    date.setHours(23, 59, 59, 99);
    let unixTimestamp = Math.floor(date.getTime() / 1000);
    return unixTimestamp;
  };

  const showNotification = (
    message: string,
    severity: "info" | "success" | "error"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const createBet = async (
    apiURL: string,
    acceptValue: string,
    countArts: number,
    endDate: number,
    acceptDate: number,
    betAmount: string,
    title: string
  ) => {
    if (!account || !betgame) return;

    console.log("Calling createBet function");

    // User enters the bet amount they want (e.g., 0.001 ETH)
    // We need to add the service fee ON TOP, like the hardhat script does
    const desiredBetAmountBigInt = BigInt(betAmount);

    // Calculate what total to send so that AFTER fee deduction, the bet amount is what user wants
    // If fee is 5% (500 basis points), then: desiredBet = totalSent * (10000 - 500) / 10000
    // So: totalSent = desiredBet * 10000 / (10000 - serviceFee)
    const chargeAmount =
      (desiredBetAmountBigInt * BigInt(10000)) /
      BigInt(10000 - Number(serviceFee));
    const serviceFeeAmount = chargeAmount - desiredBetAmountBigInt;

    // Minimum bet amount is 0.001 ETH (in wei)
    const minimumBetWei = BigInt(web3.utils.toWei("0.001", "ether"));
    const acceptValueWei = BigInt(web3.utils.toWei(acceptValue, "ether"));

    // Validate amounts
    if (desiredBetAmountBigInt < minimumBetWei) {
      showNotification(
        `Bet amount must be at least 0.001 ETH (you entered ${web3.utils.fromWei(
          betAmount,
          "ether"
        )} ETH)`,
        "error"
      );
      return;
    }

    if (acceptValueWei < minimumBetWei) {
      showNotification(
        `Accept amount must be at least 0.001 ETH (you entered ${acceptValue} ETH)`,
        "error"
      );
      return;
    }

    // Validate dates
    const now = Math.floor(Date.now() / 1000);
    if (acceptDate <= now) {
      showNotification("Accept deadline must be in the future", "error");
      return;
    }

    if (acceptDate >= endDate) {
      showNotification(
        "Accept deadline must be before outcome deadline",
        "error"
      );
      return;
    }

    console.log(
      "Desired bet amount (ETH):",
      web3.utils.fromWei(betAmount, "ether")
    );
    console.log("Accept amount (ETH):", acceptValue);
    console.log(
      "Service fee (ETH):",
      web3.utils.fromWei(serviceFeeAmount.toString(), "ether")
    );
    console.log(
      "Total sending (bet + fee) (ETH):",
      web3.utils.fromWei(chargeAmount.toString(), "ether")
    );

    try {
      // Contract signature: createBet(title, apiURL, acceptorAmount, targetValue, acceptByDate, expirationDate)
      const promiEvent = betgame.methods
        .createBet(
          title,
          apiURL,
          web3.utils.toWei(acceptValue, "ether"),
          countArts,
          acceptDate,
          endDate
        )
        .send({
          from: account,
          value: chargeAmount.toString(),
          gas: 800000, // Set a reasonable gas limit to prevent overestimation
        });

      // Set up event listeners
      let hasRedirected = false;

      promiEvent
        .on("transactionHash", (hash: string) => {
          console.log("Transaction signed:", hash);
          showNotification(
            "Transaction signed! Creating bet, please wait...",
            "info"
          );
        })
        .on("receipt", (receipt: any) => {
          console.log("Transaction receipt:", receipt);
          console.log("Receipt status:", receipt.status, typeof receipt.status);

          // Check if transaction was successful
          // Status can be: true, 1, "0x1", or BigInt(1)
          const statusNum =
            typeof receipt.status === "bigint"
              ? Number(receipt.status)
              : receipt.status;
          const isSuccess =
            statusNum === true ||
            statusNum === 1 ||
            statusNum === "0x1" ||
            String(statusNum) === "1";

          if (isSuccess) {
            // Transaction succeeded
            console.log("✅ Transaction successful!");
            if (!hasRedirected) {
              hasRedirected = true;
              setSubmitError(false);
              window.location.href = "/bet-marketplace?createSuccess=true";
            }
          } else {
            // Transaction failed (reverted)
            console.error("❌ Transaction reverted. Status:", receipt.status);
            setSubmitError(true);
            showNotification(
              "Transaction failed. The contract rejected your bet. Please check the details and try again.",
              "error"
            );
          }
        })
        .on("error", (error: any) => {
          console.error("Transaction error:", error);
          if (!hasRedirected) {
            setSubmitError(true);
            showNotification("Transaction failed. Please try again.", "error");
          }
        });
    } catch (error) {
      console.error(error);
      setSubmitError(true);
      showNotification("Transaction failed. Please try again.", "error");
    }
  };

  return (
    <div
      style={{
        marginTop: "5%",
        marginBottom: "5%",
        marginLeft: "10%",
        marginRight: "10%",
      }}
    >
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={snackbarSeverity === "error" ? null : null}
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

      {submitError ? (
        <Alert
          severity="error"
          onClose={() => {
            setSubmitError(false);
          }}
        >
          <AlertTitle>Error</AlertTitle>
          Bet creation failed, please try again.
        </Alert>
      ) : null}
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
        Create Bet
      </Typography>
      <Box sx={{ width: "100%" }}>
        <Card sx={{ minWidth: 275, mb: 5, p: 2 }} raised>
          <MyForm
            betgame={betgame}
            onSubmit={({
              title,
              acceptDeadline,
              outcomeDeadline,
              acceptAmount,
              betAmount,
              numArticles,
              apiKeywords,
              sources,
            }) => {
              const apiURL = buildApiURL(apiKeywords, sources);
              console.log(apiURL);
              const unixAcceptDate = convertToUnix(acceptDeadline);
              console.log(unixAcceptDate);
              const unixExpirationDate = convertToUnix(outcomeDeadline);
              console.log(unixExpirationDate);
              const acceptAmountStr = acceptAmount.toString();
              console.log("Accept:", acceptAmountStr);
              const betAmountStr = betAmount.toString();
              let betAmountWei = web3.utils.toWei(betAmountStr, "ether");
              console.log("Bet:", betAmountStr);
              createBet(
                apiURL,
                acceptAmountStr,
                numArticles,
                unixExpirationDate,
                unixAcceptDate,
                betAmountWei,
                title
              );
            }}
          />
        </Card>
      </Box>
    </div>
  );
}
