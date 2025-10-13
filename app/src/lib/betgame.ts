import web3 from "./web3";

// Import the contract ABI and address
// You'll need to update this path based on your deployment
let contractInstance: any = null;

export const initializeContract = async () => {
  try {
    // Load the deployed BetFactory contract
    const response = await fetch("/contracts/BetFactory.json");
    const data = await response.json();

    const address = data.address;
    const abi = data.abi;

    contractInstance = new web3.eth.Contract(abi, address);
    return contractInstance;
  } catch (error) {
    console.error("Error loading contract:", error);
    return null;
  }
};

export const getContract = () => {
  return contractInstance;
};

export default contractInstance;
