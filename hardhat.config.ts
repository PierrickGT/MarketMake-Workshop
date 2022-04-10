import 'hardhat-deploy';
import 'hardhat-deploy-ethers';

import { HardhatUserConfig } from 'hardhat/config';

import * as forkTasks from './scripts/fork';
import networks from './hardhat.network';

const optimizerEnabled = !process.env.OPTIMIZER_DISABLED;

const config: HardhatUserConfig = {
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  networks,
  solidity: {
    compilers: [
      {
        version: '0.7.4',
        settings: {
          optimizer: {
            enabled: optimizerEnabled,
            runs: 2000,
          },
          evmVersion: 'berlin',
        },
      },
    ],
  },
};

forkTasks;

export default config;
