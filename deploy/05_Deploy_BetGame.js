const { getNamedAccounts, deployments, network } = require("hardhat")
const {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config")
const { autoFundCheck, verify } = require("../helper-functions")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  let linkTokenAddress
  let oracle
  let additionalMessage = ""
  //set log level to ignore non errors
  ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)

  if (chainId == 31337) {
    let linkToken = await get("LinkToken")
    linkTokenAddress = linkToken.address
    additionalMessage = " --linkaddress " + linkTokenAddress
  } else {
    linkTokenAddress = networkConfig[chainId]["linkToken"]
    oracle = networkConfig[chainId]["oracle"]
  }
   let minumumBet = 1;
   let interval = 1;

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS
  const args = [minumumBet, interval, linkTokenAddress]
  const betGame = await deploy("BetGame", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  })

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...")
    await verify(betGame.address, args)
  }

  // Checking for funding...
  if (networkConfig.fundAmount && networkConfig.fundAmount > 0) {
    log("Funding with LINK...")
    if (
      await autoFundCheck(betGame.address, network.name, linkTokenAddress, additionalMessage)
    ) {
      await hre.run("fund-link", {
        contract: betGame.address,
        linkaddress: linkTokenAddress,
      })
    } else {
      log("Contract already has LINK!")
    }
  }

  log("Run API Consumer contract with following command:")
  const networkName = network.name == "hardhat" ? "localhost" : network.name
  log(`yarn hardhat request-data --contract ${betGame.address} --network ${networkName}`)
  log("----------------------------------------------------")
}
module.exports.tags = ["all", "api", "main"]
