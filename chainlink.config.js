const config = {
  // Hardhat local network
  // Mock Data (it won't work)
  31337: {
    name: 'hardhat',
    keyHash:
      '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4',
    fee: '0.1',
    fundAmount: '10000000000000000000',
  },
  // Kovan
  42: {
    name: 'kovan',
    linkToken: '0xa36085F69e2889c224210F603D836748e7dC0088',
    fee: '0.1 * 10**18',
    jobId: 'd5270d1c311941d0b08bead21fea7747',
    oracle: '0xc57b33452b4f7bb189bb5afae9cc4aba1f7a4fd8',
  },
};

module.exports = {
  config,
};
