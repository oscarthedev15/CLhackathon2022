const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  // Only deploy mocks on local networks
  if (developmentChains.includes(network.name)) {
    log("----------------------------------------------------");
    log("Local network detected! Deploying modern mocks...");

    // Deploy LinkToken mock
    const linkToken = await deploy("LinkToken", {
      from: deployer,
      log: true,
      contract: "LinkToken",
    });

    // Deploy MockOracle
    await deploy("MockOracle", {
      from: deployer,
      log: true,
      args: [linkToken.address],
    });

    log("✅ Modern mocks deployed successfully!");
    log("----------------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
