const log = (message) => {
  $('#log').removeClass('error').text(message);
  console.log(message);
}
const error = (message) => $('#log').addClass('error').text(message);
const listener = (message) => $('#event').append(`<span>${message}</span></br>`);

// update contract abi and address
const abi = [{ "anonymous": false, "inputs": [{ "indexed": false, "internalType": "string", "name": "method", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "count", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "caller", "type": "address" }], "name": "Count", "type": "event" }, { "inputs": [], "name": "count", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decrement", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "increment", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
const address = "0xDBEc9567B99d4441E03784731ba86E017B979206";

$(document).ready(() => {
  // Connect to the blockchain
  let provider;
  let signer;
  if (window.ethereum) {
    if (ethereum.networkVersion != 3) {
      // if network is not ropsten, try switching to ropsten
      ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x3' }],
      }).catch((err) => {
        error(err.message);
      });
    }
    log("Connected to the Ropsten test network.");
    // ask metamask's permissions to access accounts and set default account
    ethereum.request({ method: 'eth_requestAccounts' }).catch((err) => error(err.message));

    // handle network changes
    ethereum.on('chainChanged', () => window.location.reload());
    ethereum.on('accountsChanged', (accounts) => {
      console.log('accounts changed', accounts);
      signer = provider.getSigner();
    });
    // Subscribe to provider connection
    ethereum.on("connect", (info) => {
      console.log('Connected to network:', info);
    });

    // Subscribe to provider disconnection
    ethereum.on("disconnect", (error) => {
      console.log('disconnected from network: ', error);
    });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(address, abi, signer);

      // smartcontract read methods
    contract.getCount().then((count) => $('#count').text(count))
      .catch((err) => error(err));

      // // smartcontract write methods
    $('#increment').click(async () => {
      contract.increment()
        .then((tx) => {
          log("Transaction Submitted: " + tx.hash);
          return tx.wait().then(() => {
            contract.getCount().then((count) => $('#count').text(count))
            log('Incremented');
          }).catch((err) => error(err.message));;
        })
        .catch((err) => error(err.message));
    });

    $('#decrement').click(async () => {
      contract.decrement().then((tx) => {
        log("Transaction Submitted: " + tx.hash);
        return tx.wait().then(() => {
          contract.getCount().then((count) => $('#count').text(count))
          log('Decremented');
        }).catch((err) => error(err.message));;
      }).catch((err) => error(err.message));
    });

    // listening for smartcontract events
    contract.on('Count', (method, count, caller) => {
      console.log('smartcontract event:', method, count, caller);
      listener(`${new Date().toISOString()}: Count changed to ${count}`);
    });
  } else {
    error("Please install MetaMask to use this dApp.");
  };
});