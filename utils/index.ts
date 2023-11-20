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
