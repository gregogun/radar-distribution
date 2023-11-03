import { genres } from "@/data/genres";
import { z } from "Zod";

export type UploadSchema = z.infer<typeof uploadSchema>;

const fileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string(),
});

const artworkSchema = z
  .object({
    data: z.custom<ArrayBuffer>(),
    file: fileSchema,
  })
  .refine((data) => data.data !== undefined, {
    message: "Cover Art is required",
  });

const trackMetadataSchema = z.object({
  title: z
    .string()
    .min(1, "Title must contain at least 1 character")
    .max(80, "Title must contain less than 80 characters")
    .default(""),
  description: z
    .string()
    .min(1, "Description must contain at least 1 character")
    .max(300, "Description must contain less than 300 characters")
    .default(""),
  topics: z.array(z.string()).optional(),
  // genre: z.enum(genres).default("none").optional(),
  artwork: artworkSchema,
});

export type Track = z.infer<typeof trackSchema>;

const trackSchema = z.object({
  data: z.custom<ArrayBuffer>(),
  file: fileSchema,
  metadata: trackMetadataSchema,
});

export const uploadSchema = z.object({
  title: z
    .string()
    .min(1, "Title must contain at least 1 character")
    .max(80, "Title must contain less than 80 characters")
    .default(""),
  description: z
    .string()
    .min(1, "Description must contain at least 1 character")
    .max(300, "Description must contain less than 300 characters")
    .default(""),
  genre: z.enum(genres).default("none"),
  releaseDate: z.string().optional(),
  releaseArtwork: artworkSchema,
  tracklist: z.array(trackSchema).optional(),
  // test: z.array(
  //   z.object({
  //     name: z.string(),
  //     value: z.string(),
  //   })
  // ),
});
