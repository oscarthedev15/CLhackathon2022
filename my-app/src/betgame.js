import web3 from './web3';

const data = require('/Users/shetheis1/Documents/CLhackathon2022/deployments/kovan/BetGame.json');

const address = data.address;

const abi = data.abi;

export default new web3.eth.Contract(abi, address);
