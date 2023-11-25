import { genres } from "@/data/genres";
import { udl } from "@/data/license";
import { z } from "Zod";

const licenseSchema = z
  .object({
    type: z.enum(udl.type).default("public-use"),
    derivation: z.enum(udl.derivationOpts),
    commercial: z.enum(udl.commercialOpts),
    revShare: z.coerce
      .number()
      .nonnegative()
      .min(1)
      .max(100, "Percentage cannot exceed 100."),
    commercialFee: z.coerce.number().min(1).nonnegative(),
    feeRecurrence: z.enum(udl.feeRecurrenceOpts),
    currency: z.enum(udl.currencyOpts),
    paymentMode: z.enum(udl.paymentModeOpts),
  })
  .optional();

export type UploadSchema = z.infer<typeof uploadSchema>;

const artworkSchema = z.object(
  {
    file: z.custom<File>().refine((data) => !!data, {
      message: "Cover Art is required",
    }),
    url: z.string().optional(),
  },
  { required_error: "Image is required" }
);

const trackMetadataSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(80, "Title must contain less than 80 characters")
    .default(""),
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Description must contain less than 300 characters")
    .default(""),
  genre: z.enum(genres).default("none"),
  topics: z.string().optional(),
  artwork: artworkSchema,
});

export type Track = z.infer<typeof trackSchema>;

const trackSchema = z.object({
  // data: z.custom<ArrayBuffer>(),
  file: z.custom<File>(),
  metadata: trackMetadataSchema,
  url: z.string(),
});

export const uploadSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(80, "Title must contain less than 80 characters")
    .default(""),
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Description must contain less than 300 characters")
    .default(""),
  genre: z.enum(genres).default("none"),
  topics: z.string().optional(),
  releaseDate: z.string().optional(),
  releaseArtwork: artworkSchema,
  tracklist: z.array(trackSchema).min(1, "At least 1 track is required"),
  license: licenseSchema,
  tokenQuantity: z.number().min(1).max(100),
});
