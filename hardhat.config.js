require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// address: 0xc7b5074898a24E7Bc9C710F5984D211bdbb904b0

// second: 0x548D5dF707af4712875D64C88ef686819b010fF5

// third: 0x455B88d46aa71bf82addE5b08e335361495844EE

// four: 0x0d01c641fcb7828B79C41b103400ac2949306884

// five: 0x5627D30dE2F16Ca06eA47eF4B5Bc0Cff560a4895

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      // This value will be replaced on runtime
      url: process.env.STAGING_QUICKNODE_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
  }
};
