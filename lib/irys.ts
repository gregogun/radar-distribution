import { TransactionTags } from "@/types";
import { WebIrys } from "@irys/sdk";

export const getIrys = async () => {
  const irys = new WebIrys({
    token: "arweave",
    wallet: { provider: window.arweaveWallet },
    url: "https://node2.irys.xyz",
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
