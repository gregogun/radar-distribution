import Arweave from "arweave";
import { WarpFactory } from "warp-contracts";
import BigNumber from "bignumber.js";

export const arweave = Arweave.init({});

export const getArBalance = async (address: string) => {
  const winstonBalance = await arweave.wallets.getBalance(address);
  const arBalance = await arweave.ar.winstonToAr(winstonBalance);

  return new BigNumber(arBalance);
};

export const warp = WarpFactory.forMainnet();
