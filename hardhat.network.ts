import { HardhatUserConfig } from 'hardhat/config';

const alchemyUrl = process.env.ALCHEMY_URL;
const mnemonic = process.env.HDWALLET_MNEMONIC;

const networks: HardhatUserConfig['networks'] = {
  coverage: {
    url: 'http://127.0.0.1:8555',
    blockGasLimit: 200000000,
    allowUnlimitedContractSize: true,
  },
  localhost: {
    chainId: 1,
    url: 'http://127.0.0.1:8545',
    allowUnlimitedContractSize: true,
  },
};

if (alchemyUrl && Boolean(process.env.FORK_ENABLED) && mnemonic) {
  networks.hardhat = {
    chainId: 1,
    forking: {
      url: alchemyUrl,
    },
    accounts: {
      mnemonic,
    },
  };
} else {
  networks.hardhat = {
    allowUnlimitedContractSize: true,
  };
}

// if (alchemyUrl && mnemonic) {
//   networks.mainnet = {
//     chainId: 1,
//     url: alchemyUrl,
//     accounts: {
//       mnemonic,
//     },
//   };
// }

export default networks;
