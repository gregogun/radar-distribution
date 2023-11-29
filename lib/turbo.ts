import {
  TurboFactory,
  developmentTurboConfiguration,
} from "@ardrive/turbo-sdk";
import { arweave } from "./arweave";

// export const getTurboBalance = async () => {
//   const jwk = await arweave.wallets.generate();
//   const turbo = TurboFactory.authenticated({
//     privateKey: jwk,
//     ...developmentTurboConfiguration,
//   });

//   const balance = await turbo.getBalance();
//   console.log(balance);

//   return balance;
// };

export const getTurboBalance = async () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const wallet = window.arweaveWallet;
    const publicKey = await window.arweaveWallet.getActivePublicKey();
    const nonce = crypto.randomUUID();
    const signature = await signNonceAndData(nonce, wallet);

    const res = await fetch("https://payment.ardrive.io/v1/balance", {
      headers: {
        "x-signature": signature,
        "x-nonce": nonce,
        "x-public-key": publicKey,
      },
    });

    const data = await res.json();
    console.log({ data });
    return data;
  } catch (error) {
    throw error;
  }
};

const signNonceAndData = async (
  nonce: string,
  wallet: typeof window.arweaveWallet
) => {
  const signature = await wallet.signature(new TextEncoder().encode(nonce), {
    name: "RSA-PSS",
    saltLength: 0,
  });

  const b64encodedSignature = await bufferToBase64(signature);

  return b64encodedSignature;
};

async function bufferToBase64(
  buffer: ArrayBuffer | Uint8Array
): Promise<string> {
  // use a FileReader to generate a base64 data URI:
  const base64url = await new Promise((r) => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result);
    reader.readAsDataURL(new Blob([buffer]));
  });
  // remove the `data:...;base64,` part from the start
  //@ts-ignore
  return base64url.slice(base64url.indexOf(",") + 1);
}
