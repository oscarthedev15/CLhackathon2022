import Web3 from 'web3';

const NODE_URL =
  'https://speedy-nodes-nyc.moralis.io/ac41dad5e8581c2b7463048b/eth/kovan';
const provider = new Web3.providers.HttpProvider(NODE_URL);
const web3 = new Web3(provider);

export default web3;
