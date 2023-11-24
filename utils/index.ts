import { UploadSchema } from "@/modules/upload/schema";
import { UseFormGetValues } from "react-hook-form";

export const arrayBuffersEqual = (
  buffer1: ArrayBuffer,
  buffer2: ArrayBuffer
) => {
  const view1 = new Uint8Array(buffer1);
  const view2 = new Uint8Array(buffer2);

  if (view1.length !== view2.length) {
    return false;
  }

  for (let i = 0; i < view1.length; i++) {
    if (view1[i] !== view2[i]) {
      return false;
    }
  }

  return true;
};

export const formatSchemaValue = (value: string) => {
  const values = value.split("-");
  const formattedValues = values
    .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
    .join(" ");
  return formattedValues;
};

export const userPreferredGateway = () => {
  if (typeof window !== undefined) {
    return localStorage.getItem("gateway");
  }
};

interface AbbreviateAddressOptions {
  startChars?: number;
  endChars?: number;
  noOfEllipsis?: number;
}

interface AbbreviateAddress {
  address: string | undefined;
  options?: AbbreviateAddressOptions;
}

export const abbreviateAddress = ({
  address,
  options = {},
}: AbbreviateAddress) => {
  const { startChars = 5, endChars = 4, noOfEllipsis = 2 } = options;

  const dot = ".";
  const firstFive = address?.substring(0, startChars);
  const lastFour = address?.substring(address.length - endChars);
  return `${firstFive}${dot.repeat(noOfEllipsis)}${lastFour}`;
};

export const formatTime = (time: number): string => {
  const minutes: number = Math.floor(time / 60) % 60;
  const seconds: number = Math.floor(time % 60);
  const hours: number = Math.floor(time / 3600);

  const formattedSeconds: string = `${seconds < 10 ? "0" : ""}${seconds}`;

  if (hours > 0) {
    return `${hours}:${minutes}:${formattedSeconds}`;
  }

  return `${minutes}:${formattedSeconds}`;
};
