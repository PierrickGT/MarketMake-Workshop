import { subtask, task } from "hardhat/config";

import { action, info, success } from "../helpers";

export default task("fork:arbitrage", "Run arbitrage fork").setAction(
  async (taskArguments, hre) => {
    action("Run arbitrage...");

    const { ethers, run } = hre;

    const { getContractAt, getSigners } = ethers;
    const [deployer] = await getSigners();

    info(`Deployer is: ${deployer.address}`);

    const flashLoanReceiverAddress = await run("deploy-flash-loan");

    const fakeArbitrageStrategy = await getContractAt(
      "FakeArbitrageStrategy",
      "0x8F1034CBE5827b381067fCEfA727C069c26270c4",
      deployer
    );

    await fakeArbitrageStrategy.whitelistTrader(flashLoanReceiverAddress);

    success("Contract whitelisted!");

    const flashLoanReceiver = await getContractAt(
      "DemoFlashloanReceiver",
      flashLoanReceiverAddress,
      deployer
    );

    await flashLoanReceiver.flashLoan();

    success("Flash loan successful!");
  }
);

subtask("deploy-flash-loan", "Deploy Flash Loan contract").setAction(async ({}, hre) => {
  action("Deploy Flash Loan...");

  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;

  const { deployer } = await getNamedAccounts();

  const flashLoanResult = await deploy("DemoFlashloanReceiver", {
    from: deployer,
    args: [],
  });

  success("Flash Loan deployed!");

  return flashLoanResult.address;
});
