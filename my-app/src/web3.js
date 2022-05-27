import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';



let web3 = new Web3(Web3.givenProvider || "https://kovan.infura.io/v3/b050ae0729714fb388aaacb31f19e027");

(async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
        web3 = new Web3(Web3.givenProvider)
        const chainId = await provider.request({ method: 'eth_chainId' });
        if (chainId !== 0x2a){
            try {
                // check if the chain to connect to is installed
                await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x2A' }], // chainId must be in hexadecimal numbers
                });
              } catch (error) {
                // This error code indicates that the chain has not been added to MetaMask
                // if it is not, then install it into the user MetaMask
                if (error.code === 4902) {
                  try {
                    await window.ethereum.request({
                      method: 'wallet_addEthereumChain',
                      params: [
                        {
                          chainId: '0x2A',
                          rpcUrl: 'https://kovan.infura.io',
                        },
                      ],
                    });
                  } catch (addError) {
                    console.error(addError);
                  }
                }
                console.error(error);
              }
        }

        provider.on('chainChanged', handleChainChanged);

    } else {
        web3 = new Web3("https://kovan.infura.io/v3/b050ae0729714fb388aaacb31f19e027");
    }
})();

async function handleChainChanged(_chainId)  {
    // We recommend reloading the page, unless you must do otherwise
        if (_chainId !== 0x2a){
            try {
                // check if the chain to connect to is installed
                await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x2A' }], // chainId must be in hexadecimal numbers
                });
              } catch (error) {
                // This error code indicates that the chain has not been added to MetaMask
                // if it is not, then install it into the user MetaMask
                if (error.code === 4902) {
                  try {
                    await window.ethereum.request({
                      method: 'wallet_addEthereumChain',
                      params: [
                        {
                          chainId: '0x2A',
                          rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
                        },
                      ],
                    });
                  } catch (addError) {
                    console.error(addError);
                  }
                }
                console.error(error);
              }
        }
        else {
            web3 = new Web3(Web3.givenProvider);
        }
        window.location.reload();
    }

export default web3;



