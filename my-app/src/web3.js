import Web3 from 'web3';
// import { Moralis } from 'moralis';


const web3 = new Web3(Web3.givenProvider || "https://kovan.infura.io/v3/b050ae0729714fb388aaacb31f19e027");

export default web3;
