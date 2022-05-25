import web3 from './web3';

const data = require('../../deployments/kovan/BetGame.json');

const address = data.address;

const abi = data.abi;

export default new web3.eth.Contract(abi, address);
