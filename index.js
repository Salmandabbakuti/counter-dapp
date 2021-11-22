const log = (message) => {
  $('#log').removeClass('error').text(message);
  console.log(message);
}
const error = (message) => $('#log').addClass('error').text(message);

// update contract abi and address
const abi = [];
const address = "";

// wait for transaction to be mined
const waitForReceipt = (hash, cb) => {
  web3.eth.getTransactionReceipt(hash, (err, receipt) => {
    if (err) return error(err);
    if (!receipt) {
      // Try again in 1 second
      window.setTimeout(() => {
        waitForReceipt(hash, cb);
      }, 1000);
    } else {
      // Transaction went through
      if (!receipt.status) return error('Transaction Failed: Reverted By EVM')
      if (cb) cb(receipt);
    }
  })
}

$(document).ready(() => {
  // Connect to the blockchain
  if (window.ethereum) {
    web3 = new Web3(ethereum);
    // ask metamask's permissions to access accounts and set default account
    ethereum.request({ method: 'eth_requestAccounts' }).then((res, err) => {
      if (err) return error(err);
      web3.eth.defaultAccount = res[0];
    });
    // handle network changes
    ethereum.on('chainChanged', () => window.location.reload());
    ethereum.on('accountsChanged', (accounts) => {
      web3.eth.defaultAccount = accounts[0];
    });
    if (ethereum.networkVersion != 3) {
      // if network is not ropsten, try switching to ropsten
      ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x3' }],
      }).catch((err) => {
        // add polygon mumbai network to metamask if not already added
        // if (err.code === 4902) {
        //   ethereum.request({
        //     method: 'wallet_addEthereumChain',
        //     params: [{ chainName: 'Polygon Mumbai', chainId: '0x13881', rpcUrls: ['https://rpc-mumbai.maticvigil.com/'] }]
        //   }).catch((err) => error(err.message));
        // } else {
        //   error(err.message);
        // }
        error(err.message);
      });
    }
    log("Connected to the Ropsten test network.");
    contract = new web3.eth.Contract(abi, address);
    // smartcontract read methods
    // contract.methods.read().call()
    //   .then((res) => {
    //     // do something with the result
    //   }).catch((err) => error(err));

    // // smartcontract write methods
    // contract.methods.write().send({ from: web3.eth.defaultAccount, value: web3.utils.toWei('0.1', 'ether') })
    //   .then((res) => {
    //     // do something with the result
    //   })
    //   .catch((err) => error(err));
  } else {
    error("Please install MetaMask to use this dApp.");
  };
});