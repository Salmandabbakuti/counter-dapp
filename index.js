const log = (message) => {
  $('#log').removeClass('error').text(message);
  console.log(message);
};
const error = (message) => {
  console.log(message);
  $('#log').addClass('error').text(message);
};
const listener = (message) => $('#event').append(`<span>${message}</span></br>`);

// update contract abi and address
const abi = [
  "function count() view returns (uint256)",
  "function decrement()",
  "function increment()",
  "function getCount() view returns (uint256)",
  "event Count(string method, uint256 count, address caller)"
];
const address = "0xDBEc9567B99d4441E03784731ba86E017B979206";

$(document).ready(() => {
  // Connect to the blockchain
  if (window.ethereum) {
    if (ethereum.networkVersion !== '3') {
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
    ethereum.request({ method: 'eth_requestAccounts' })
      .then(() => $('#count').click())
      .catch((err) => error(err.message));

    // handle network changes
    ethereum.on('chainChanged', () => window.location.reload());
    ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        log(`Using account ${accounts[0]}`);
      } else {
        error('No accounts found');
      }
    });
    // listen for messages from metamask
    ethereum.on('message', (message) => console.log(message));
    // Subscribe to provider connection
    ethereum.on("connect", (info) => {
      console.log('Connected to network:', info);
    });
    // Subscribe to provider disconnection
    ethereum.on("disconnect", (error) => {
      console.log('disconnected from network: ', error);
    });

    // setup provider and contract
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const defaultProvider = ethers.getDefaultProvider();
    const estimatedMergeBlock = 15537351;
    defaultProvider.getBlock().then((currentBlock) => {
      if (currentBlock.number > estimatedMergeBlock) {
        // greet user after succesful merge
        $('#merge-countdown').text('');
        $('#merge-countdown').append(`<span>Merge Successful!. Welcome to The Merge Party! &#127881; &#129395; &#127881; &#129395;</span></br>`);
      } else {
        console.log('currentBlock: ', currentBlock);
        const remainingBlocks = estimatedMergeBlock - currentBlock.number;
        const estimatedTimeInSeconds = remainingBlocks * 14.3; // average 14.3 seconds per block
        const date = new Date(null);
        date.setSeconds(estimatedTimeInSeconds);
        const estimatedTime = date.toISOString().slice(11, 19);
        const [hours, minutes, seconds] = estimatedTime.split(':');
        $('#merge-countdown').text('');
        $('#merge-countdown').append(`${currentBlock.number}/${estimatedMergeBlock}: ${remainingBlocks} blocks to go. <br/>The Merge upgrade at around block 15,537,351 is scheduled to occur in <br/> ${hours} hours ${minutes} minutes ${seconds} seconds`);
      }
    });

    const signer = provider.getSigner();
    console.log(signer);
    const contract = new ethers.Contract(address, abi, signer);

    // smartcontract read methods
    $('#count').click(() => {
      contract.getCount().then((count) => $('#count').text(count))
        .catch((err) => error(err));
    });

    // // smartcontract write methods
    $('#increment').click(() => {
      contract.increment()
        .then((tx) => {
          log("Transaction Submitted: " + tx.hash);
          return tx.wait().then(() => {
            contract.getCount().then((count) => $('#count').text(count));
            log('Incremented');
          }).catch((err) => error(err.message));;
        })
        .catch((err) => error(err.message));
    });

    $('#decrement').click(() => {
      contract.decrement().then((tx) => {
        log("Transaction Submitted: " + tx.hash);
        return tx.wait().then(() => {
          contract.getCount().then((count) => $('#count').text(count));
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