import { Track, UploadSchema } from "@/modules/upload/schema";
import { uploadData, uploadFile } from "./irys";
import { TransactionTags } from "@/types";
import { appConfig } from "@/appConfig";
import { warp } from "./arweave";

export const upload = async (
  data: UploadSchema,
  address: string | undefined
) => {
  try {
    if (!address) {
      throw new Error("No wallet connected.");
    }

    const isCollection = data.tracklist.length > 1;

    let artworkTx: string;

    /* upload release artwork */
    /* update to prefer tx once we add option in form */
    artworkTx = await uploadArtwork(data.releaseArtwork);

    /* upload tracks individually */
    const trackTxs = await uploadTracks(data, address, artworkTx);

    //register track txs
    await registerTxs(trackTxs);

    let collectionTx: string | undefined = "";

    if (isCollection) {
      /* if more than one track, upload collection */
      collectionTx = await uploadCollection(data, trackTxs, address);
    }
  } catch (error) {
    throw error;
  }
};

const uploadTracks = async (
  data: UploadSchema,
  address: string,
  artworkId: string
): Promise<string[]> => {
  // empty array to fill with successfully uploaded tracks
  let uploadedTracks: string[] = [];

  // loop through tracks
  for (let i = 0; i < data.tracklist.length; i++) {
    const track = data.tracklist[i];

    let trackArtworkId: string = "";

    // check if track should use release artwork
    const useArtworkTx =
      data.releaseArtwork.file === track.metadata.artwork.file;

    let tags: TransactionTags = [];

    if (useArtworkTx) {
      trackArtworkId = artworkId;
    } else {
      const imageTags: TransactionTags = [];
      trackArtworkId = (
        await uploadFile(track.metadata.artwork.file, imageTags)
      ).id;
    }

    //ans-110 tags
    tags = tags.concat({ name: "Content-Type", value: track.file.type });
    tags = tags.concat({ name: "Title", value: track.metadata.title });
    tags = tags.concat({
      name: "Description",
      value: track.metadata.description,
    });
    tags = tags.concat({ name: "Thumbnail", value: trackArtworkId });
    tags = tags.concat({ name: "Topic:genre", value: track.metadata.genre });

    if (data.topics) {
      const topics = data.topics.split(",");
      console.log({ topics });
      topics.forEach(
        (topic) =>
          (tags = tags.concat({
            name: `Topic:${topic.replace(" ", "")}`,
            value: topic.replace(" ", ""),
          }))
      );
    }

    //atomic asset tags
    const initState = JSON.stringify({
      ticker: "ATOMIC-SONG",
      name: track.metadata.title,
      balances: {
        [address]: 100,
      },
      claimable: [],
    });

    tags = tags.concat({ name: "Init-State", value: initState });
    tags = tags.concat({ name: "App-Name", value: "SmartWeaveContract" });
    tags = tags.concat({ name: "App-Version", value: "0.3.0" });
    tags = tags.concat({ name: "Indexed-By", value: "ucm" });
    tags = tags.concat({
      name: "Contract-Src",
      value: "Of9pi--Gj7hCTawhgxOwbuWnFI1h24TTgO5pw8ENJNQ",
    });
    tags = tags.concat({
      name: "Contract-Manifest",
      value:
        '{"evaluationOptions":{"sourceType":"redstone-sequencer","allowBigInt":true,"internalWrites":true,"unsafeClient":"skip","useConstructor":true}}',
    });

    const checkDerivationLicense = () => {
      if (data.license?.derivation === "with-revenue-share") {
        tags = tags.concat({
          name: "Derivation",
          value: `allowed-with-revenueShare-${data.license?.revShare}%`,
        });
      } else {
        tags = tags.concat({
          name: "Derivation",
          value: `allowed-${data.license?.derivation}`,
        });
      }
    };

    //license tags
    if (data.license) {
      tags = tags.concat({ name: "License", value: appConfig.UDL });

      if (data.license.type === "allowed") {
        if (data.license.commercial === "with-fee") {
          tags = tags.concat({ name: "Commercial", value: "allowed" });
          tags = tags.concat({
            name: "License-Fee",
            value: `${data.license.feeRecurrence}-${data.license.commercialFee}`,
          });
          tags = tags.concat({
            name: "Currency",
            value: data.license.currency,
          });
          tags = tags.concat({
            name: "Payment-Mode",
            value: data.license.paymentMode,
          });
        } else {
          tags = tags.concat({
            name: "Commercial",
            value: `allowed-${data.license.commercial}`,
          });
        }

        checkDerivationLicense();
      }

      if (data.license.type === "attribution") {
        tags = tags.concat({
          name: "Commercial",
          value: "allowed-with-credit",
        });
        tags = tags.concat({
          name: "Derivation",
          value: "allowed-with-credit",
        });
      }

      if (data.license.type === "noncommercial") {
        checkDerivationLicense();
      }
    }

    console.log(tags);
    const trackTx = await uploadFile(track.file, tags);
    uploadedTracks.concat(trackTx.id);
    console.log(trackTx);
    // try {
    // } catch (error) {
    //   throw error;
    // }

    // return uploadedTracks;
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

  const artworkTx = await uploadFile(artwork.file, tags);

  return artworkTx.id;
};

const registerTxs = async (txs: string[]) => {
  txs.forEach(async (tx) => {
    await warp.register(tx, "node2");
    await new Promise((r) => setTimeout(r, 1000));
    console.log(`registering - ${tx}`);
  });
};
