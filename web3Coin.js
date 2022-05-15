// $ ganache-cli -f https://rinkeby.infura.io/v3/41182ba0c6704972abb77cc869ce534b -d -i 66 1 --unlock 0x14143f048589e3ed28ba550a2e54557549b39c92

const account2 = "0xe50481D551c6B1Db416DCE0afCb891022AFd3d88";
const contactAddress = "0x14143f048589e3ed28BA550a2e54557549B39C92";
require("dotenv").config();

const connectToNetwork = (provider) => {
  const Web3 = require("web3");
  return new Web3(provider);
};

const getRDVCoinContractInstance = async (web3) => {
  const RDVCoinContract = require("./build/contracts/RDVCoin.json");
  const id = "4"; //await web3.eth.net.getId();
  const deployedNetwork = RDVCoinContract.networks[id];

  return new web3.eth.Contract(RDVCoinContract.abi, deployedNetwork.address);
};

const getBalanceFor =
  (RDVCoinContract) =>
  async ({ from, account }) => {
    try {
      return await RDVCoinContract.methods
        .getBalanceFor(account)
        .call({ from });
    } catch (err) {
      return err.message;
    }
  };

const getTotalBalance = async (RDVCoinContract) => {
  try {
    return await RDVCoinContract.methods.getTotalBalance().call();
  } catch (err) {
    return err.message;
  }
};

// Account1: 0x78E0081C4F7051bD29Ce6891F65e9525eE36d8c3
const getMinter = (web3) =>
  web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY_1);

const mintRDVCoins =
  ({ contractInstance, web3, minter, contactAddress }) =>
  async ({ receiver, amount }) => {
    const tx = {
      from: minter.address,
      to: contactAddress,
      gas: 2000000,
      data: contractInstance.methods.mint(receiver, amount).encodeABI(),
    };
    web3.eth.accounts
      .signTransaction(tx, minter.privateKey)
      .then((signedTx) => {
        // raw transaction string may be available in .raw or
        // .rawTransaction depending on which signTransaction
        // function was called
        const sentTx = web3.eth.sendSignedTransaction(
          signedTx.raw || signedTx.rawTransaction
        );
        sentTx.on("receipt", (receipt) => {
          console.log("receipt: ", receipt);
        });
        sentTx.on("error", (err) => {
          console.log("error:", error);
        });
      })
      .catch((err) => console.log(err.message));
  };

const sendRDVCoins =
  ({ contractInstance, web3, contactAddress }) =>
  async ({ receiver, sender, amount }) => {
    const tx = {
      from: sender.address,
      to: contactAddress,
      gas: 2000000,
      data: contractInstance.methods.send(receiver, amount).encodeABI(),
    };
    web3.eth.accounts
      .signTransaction(tx, sender.privateKey)
      .then((signedTx) => {
        // raw transaction string may be available in .raw or
        // .rawTransaction depending on which signTransaction
        // function was called
        const sentTx = web3.eth.sendSignedTransaction(
          signedTx.raw || signedTx.rawTransaction
        );
        sentTx.on("receipt", (receipt) => {
          console.log("receipt: ", receipt);
        });
        sentTx.on("error", (err) => {
          console.log("error:", err);
        });
      })
      .catch((err) => console.log(err.message));
  };

const init = async () => {
  const web3 = await connectToNetwork("ws://localhost:8545");

  const contractInstance = await getRDVCoinContractInstance(web3);

  console.log("Total Balance: ", await getTotalBalance(contractInstance));

  const minter = getMinter(web3);
  const mint = mintRDVCoins({ contractInstance, web3, minter, contactAddress });

  await mint({ receiver: account2, amount: 150 });

  console.log("Total Balance: ", await getTotalBalance(contractInstance));

  const send = sendRDVCoins({ contractInstance, web3, contactAddress });

  sender = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY_2);

  await send({ receiver: minter.address, sender, amount: 23 });

  console.log(await getTotalBalance());

  const balanceFor = getBalanceFor(contractInstance);

  console.log(
    "balance for private_key_2",
    await balanceFor({ account: sender.address, from: minter.address })
  );

  console.log(
    "balance for minter",
    await balanceFor({ account: minter.address, from: minter.address })
  );
};

init();
