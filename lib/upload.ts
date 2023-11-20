import { Track, UploadSchema } from "@/modules/upload/schema";
import { uploadChunks, uploadData, uploadFile } from "./irys";
import { TransactionTags } from "@/types";
import { arrayBuffersEqual } from "@/utils";
import { WebIrys } from "@irys/sdk";

export const upload = async (
  data: UploadSchema,
  address: string | undefined
) => {
  try {
    if (!address) {
      throw new Error("No wallet connected.");
    }

    const isCollection = data.tracklist.length > 1;

    /* upload artwork if collection */
    const artworkTx = await uploadArtwork(data.releaseArtwork);

    /* upload tracks individually */
    const trackTxs = await uploadTracks(
      data.tracklist,
      address,
      data.releaseArtwork.data,
      artworkTx
    );

    let collectionTx: string | undefined = "";

    if (isCollection) {
      /* if more than one track, upload collection */
      collectionTx = await uploadCollection(data, trackTxs, address);
    }

    // if (collectionTx) {
    //     return collectionTx
    // } else {
    //     return trackTxs;
    // }
  } catch (error) {
    throw error;
  }
};

const uploadTracks = async (
  tracks: Track[],
  address: string,
  artworkData: UploadSchema["releaseArtwork"]["data"],
  artworkId: string
): Promise<string[]> => {
  // empty array to fill with successfully uploaded tracks
  let uploadedTracks: string[] = [];

  // loop through tracks
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];

    let trackArtworkId: string = "";

    // check if track should use release artwork
    const useArtworkTx = arrayBuffersEqual(artworkData, track.data);

    const tags: TransactionTags = [];

    if (useArtworkTx) {
      trackArtworkId = artworkId;
    } else {
      const imageTags: TransactionTags = [];
      trackArtworkId = (
        await uploadFile(track.metadata.artwork.file.data, imageTags)
      ).id;
    }

    tags.concat({ name: "Content-Type", value: track.file.type });
    tags.concat({ name: "Title", value: track.metadata.title });
    tags.concat({ name: "Description", value: track.metadata.description });
    tags.concat({ name: "Thumbnail", value: trackArtworkId });

    try {
      const trackTx = await uploadFile(track.file.data, tags);
      uploadedTracks.push(trackTx.id);
      console.log(trackTx);
    } catch (error) {
      throw error;
    }

    return uploadedTracks;
  }

  // return array of uploaded tracks
  return uploadedTracks;
};

const uploadCollection = async (
  data: UploadSchema,
  trackTxs: string[],
  address: string
): Promise<string | undefined> => {
  let collectionId: string = "";

  const tags: TransactionTags = [
    {
      name: "Data-Protocol",
      value: "Collection",
    },
    {
      name: "Collection-Type",
      value: "audio",
    },
    {
      name: "Title",
      value: data.title,
    },
    {
      name: "Description",
      value: data.description,
    },
  ];

  const collectionData = JSON.stringify({
    type: "Collection",
    items: trackTxs,
  });

  try {
    const collectionTx = await uploadData(collectionData, tags);
    console.log(collectionTx);

    collectionId = collectionTx.id;
  } catch (error) {
    throw error;
  }

  return collectionId;
};

const uploadArtwork = async (artwork: UploadSchema["releaseArtwork"]) => {
  const tags: TransactionTags = [];

  //   const irys = new WebIrys({
  //     token: 'arweave',
  //     wallet: { provider: window.arweaveWallet },
  //     url: 'https://node2.irys.xyz',
  //   });

  //   await irys.ready();

  console.log(artwork.data);

  const artworkTx = await uploadFile(artwork.file.data, tags);
  //   const artworkTx = await irys.upload(Buffer.from(artwork.data), { tags });

  return artworkTx.id;
};
