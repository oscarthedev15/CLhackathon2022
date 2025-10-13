import web3 from "./web3";

// BetFactory contract integration
let contractInstance: any = null;

export const initializeContract = async () => {
  try {
    // Load the BetFactory contract ABI
    const response = await fetch("/contracts/BetFactory.json");
    const data = await response.json();

    const address = data.address;
    const abi = data.abi;

    contractInstance = new web3.eth.Contract(abi, address);
    return contractInstance;
  } catch (error) {
    console.error("Error loading BetFactory contract:", error);
    return null;
  }
};

export const getContract = () => {
  return contractInstance;
};

// Helper functions for interacting with BetFactory
export const createBet = async (
  title: string,
  apiURL: string,
  acceptorAmount: string,
  targetValue: number,
  acceptByDate: number,
  expirationDate: number,
  creatorAmount: string,
  from: string
) => {
  if (!contractInstance) await initializeContract();

  // Contract signature: createBet(title, apiURL, acceptorAmount, targetValue, acceptByDate, expirationDate)
  return contractInstance.methods
    .createBet(
      title,
      apiURL,
      acceptorAmount,
      targetValue,
      acceptByDate,
      expirationDate
    )
    .send({ from, value: creatorAmount });
};

export const acceptBet = async (
  betId: number,
  apiURL: string,
  acceptorAmount: string,
  from: string
) => {
  if (!contractInstance) await initializeContract();

  return contractInstance.methods
    .acceptBet(betId, apiURL)
    .send({ from, value: acceptorAmount });
};

export const getBet = async (betId: number) => {
  if (!contractInstance) await initializeContract();

  return contractInstance.methods.getBet(betId).call();
};

export const getBetDetails = async (betId: number) => {
  if (!contractInstance) await initializeContract();

  return contractInstance.methods.getBetDetails(betId).call();
};

export const getActiveBets = async () => {
  if (!contractInstance) await initializeContract();

  return contractInstance.methods.getActiveBets().call();
};

export const getAcceptedBets = async () => {
  if (!contractInstance) await initializeContract();

  return contractInstance.methods.getAcceptedBets().call();
};

export const getUserBets = async (address: string) => {
  if (!contractInstance) await initializeContract();

  return contractInstance.methods.getUserBets(address).call();
};

export default contractInstance;
