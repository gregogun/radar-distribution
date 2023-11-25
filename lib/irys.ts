import { IrysNode, TransactionTags } from "@/types";
import { WebIrys } from "@irys/sdk";

export const getIrys = async (url?: string) => {
  const irys = new WebIrys({
    token: "arweave",
    wallet: { provider: window.arweaveWallet },
    url: url || "https://node2.irys.xyz",
  });

  await irys.ready();

  return irys;
};

export const uploadData = async (data: string, tags: TransactionTags) => {
  const irys = await getIrys();

  const response = await irys.upload(data, { tags });
  return response;
};

export const uploadFile = async (data: File, tags: TransactionTags) => {
  const irys = await getIrys();

  const response = await irys.uploadFile(data, { tags });
  return response;
};

export const uploadChunks = async (
  data: ArrayBuffer,
  tags: TransactionTags
) => {
  const irys = await getIrys();

  const transaction = irys.createTransaction(Buffer.from(data), { tags });
  await transaction.sign();
  let uploader = irys.uploader.chunkedUploader;

  const upload = uploader.uploadTransaction(transaction);

  uploader.on("chunkUpload", (chunkInfo) => {
    console.log(
      `Uploaded Chunk number ${chunkInfo.id}, offset of ${chunkInfo.offset}, size ${chunkInfo.size} Bytes, with a total of ${chunkInfo.totalUploaded} bytes uploaded.`
    );
  });

  uploader.on("chunkError", (e) => {
    console.error(`Error uploading chunk number ${e.id} - ${e.res.statusText}`);
  });

  uploader.on("done", (finishRes) => {
    console.log(`Upload completed with ID ${finishRes.id}`);
  });

  const response = await upload;
  return response;
};

export const getIrysBalance = async (node: IrysNode) => {
  const url = `https://${node}.irys.xyz`;
  const irys = await getIrys(url);

  const atomicBalance = await irys.getLoadedBalance();

  const convertedBalance = irys.utils.fromAtomic(atomicBalance);

  return convertedBalance;
};

export const fundIrysNode = async ({
  node,
  amount,
}: {
  node: IrysNode;
  amount: number;
}) => {
  const url = `https://${node}.irys.xyz`;
  const irys = await getIrys(url);

  const fundTx = await irys.fund(irys.utils.toAtomic(amount));
  return {
    quantity: irys.utils.fromAtomic(fundTx.quantity),
    token: irys.token,
  };
};
