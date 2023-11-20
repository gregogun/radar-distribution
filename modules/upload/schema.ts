import { genres } from "@/data/genres";
import { z } from "Zod";

const udlMetadataSchema = z
  .object({
    derivation: z.enum([
      "with-credit",
      "with-indication",
      "with-passthrough",
      "with-revenue-share",
      "none",
    ]),
    commercial: z.enum(["allowed", "allow-with-credit", "none"]),
    revenueSharePercentage: z.number().nonnegative(),
    fee: z.number().nonnegative(),
    feeRecurrence: z.enum(["one-time", "monthly"]),
    currency: z.enum(["AR", "U"]),
    paymentMode: z.enum(["global", "random"]),
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
  licenseType: z.enum(["none", "udl"]).default("none"),
  udlMetadata: udlMetadataSchema,
});
