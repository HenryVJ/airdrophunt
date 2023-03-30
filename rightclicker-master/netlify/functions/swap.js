const { schedule } = require("@netlify/functions");
const { ethers } = require("ethers");
require("dotenv").config();

const IERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json');

const handler = async function () {
  console.log("Running function...");
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const ACCOUNT_1 = new ethers.Wallet(process.env.PRIVATE_KEY_1, provider);
  const ACCOUNT_2 = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);
  const ACCOUNT_3 = new ethers.Wallet(process.env.PRIVATE_KEY_3, provider);
  const ERC20 = new ethers.Contract(process.env.TOKEN_ADDRESS, IERC20.abi);
  await ERC20.connect(ACCOUNT_1).transfer(ACCOUNT_2.address, process.env.TRANSFER_AMOUNT);
  await ERC20.connect(ACCOUNT_1).transfer(ACCOUNT_3.address, process.env.TRANSFER_AMOUNT);
  console.log("Transfers Complete!");
  console.log(`See transactions at: https://goerli.etherscan.io/address/${ACCOUNT_1.address}`);
};

// Schedule the function to run on Monday, Thursday, and Sunday
exports.handler = async function (event, context) {
  // Set the time of day to run the function (in UTC)
  const runTime = "07:00:00";
  
  // Set the days of the week to run the function
  const runDays = [1, 4, 7]; // Monday, Thursday, Sunday
  
  // Get the current UTC time
  const now = new Date();
  const utcNow = new Date(now.toUTCString());
  
  // Calculate the time until the next scheduled run
  const timeUntilNextRun = runDays
    .map(day => {
      const nextRun = new Date(utcNow);
      nextRun.setDate(nextRun.getDate() + ((day + 7 - nextRun.getUTCDay()) % 7));
      nextRun.setUTCHours(runTime.substr(0,2), runTime.substr(3,2), runTime.substr(6,2), 0);
      return nextRun - utcNow;
    })
    .reduce((minTime, time) => time < minTime ? time : minTime, Infinity);
  
  // Wait for the next scheduled run time
  await new Promise(resolve => setTimeout(resolve, timeUntilNextRun));
  
  // Run the scheduled function
  await handler();
};
