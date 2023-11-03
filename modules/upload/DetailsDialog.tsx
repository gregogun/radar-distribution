import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/ui/Dialog";
import { FormHelperError, FormHelperText, FormRow } from "@/ui/Form";
import { Label } from "@/ui/Label";
import { TextField } from "@/ui/TextField";
import { Typography } from "@/ui/Typography";
import { UseFormReturn } from "react-hook-form";
import { Track, UploadSchema } from "./schema";
import { IconButton } from "@/ui/IconButton";
import { RxChevronDown, RxCross2, RxPlus, RxTrash } from "react-icons/rx";
import { Textarea } from "@/ui/Textarea";
import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { ImageDropContainer } from "./components/ImageDropContainer";
import { Flex } from "@/ui/Flex";
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "@/ui/Select";
import { genres } from "@/data/genres";

interface DetailsDialogProps {
  index: number;
  open: boolean;
  onClose: () => void;
  form: UseFormReturn<UploadSchema>;
  track: Omit<Track, "id">;
}

export const DetailsDialog = ({
  index,
  form,
  track,
  open,
  onClose,
}: DetailsDialogProps) => {
  const [releaseArtwork, setReleaseArtwork] = useState<string | undefined>(
    track.metadata.artwork.file.url
  );

  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
    const imageFile = acceptedFiles[0];

    console.log(imageFile);

    const reader = new FileReader();

    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");

    reader.onload = () => {
      let blob;
      let url;
      blob = new Blob([imageFile], { type: imageFile.type });
      url = window.URL.createObjectURL(blob);

      let imageFileInfo = {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
        url,
      };

      //   console.log(reader.result);

      setReleaseArtwork(url);
      form.setValue(`tracklist.${index}.file`, imageFileInfo);
      form.setValue(
        `tracklist.${index}.metadata.artwork.data`,
        reader.result as ArrayBuffer
      );
    };

    reader.readAsArrayBuffer(imageFile);
  }, []);

  const image = useDropzone({
    accept: { "image/*": [".jpeg", ".png", ".webp", ".avif"] },
    maxFiles: 1,
    onDrop: onImageDrop,
  });

  //   const releaseArtwork = form.watch(
  //     `tracklist.${index}.metadata.artwork.file.url`,
  //     form.getValues(`releaseArtwork.file.url`)
  //   );

  const handleRemoveCoverArt = (e: any) => {
    e.stopPropagation();

    form.resetField(`tracklist.${index}.metadata.artwork.file.url`);
    setReleaseArtwork(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        css={{
          maxWidth: 800,

          "@bp4": {
            maxHeight: 600,
          },

          "@bp5": {
            maxHeight: 700,
          },
        }}
      >
        <DialogTitle asChild>
          <Typography>Add details for {track.metadata.title}</Typography>
        </DialogTitle>
        <Flex gap="10">
          <Flex css={{ flex: 1 }} direction="column">
            <FormRow>
              <Label htmlFor={`tracklist.${index}.metadata.title`}>Title</Label>
              <TextField
                type="text"
                placeholder="Title"
                {...form.register(`tracklist.${index}.metadata.title` as const)}
              />
            </FormRow>
            <FormRow>
              <Label htmlFor={`tracklist.${index}.metadata.description`}>
                Description
              </Label>
              <Textarea
                placeholder="Track description"
                size="3"
                {...form.register(
                  `tracklist.${index}.metadata.description` as const
                )}
              />
            </FormRow>
          </Flex>

          <FormRow
            css={{
              height: "max-content",
            }}
          >
            <Label htmlFor="releaseArtwork">Cover Art</Label>
            <ImageDropContainer
              css={{
                background: releaseArtwork
                  ? `url(${releaseArtwork})`
                  : "transparent",

                mb: "$15",
              }}
              hidden={!!releaseArtwork}
              hovered={image.isDragActive}
              size="2"
              {...image.getRootProps()}
            >
              <input
                {...form.register(
                  `tracklist.${index}.metadata.artwork.file.url`
                )}
                {...image.getInputProps()}
              />
              <RxPlus />
              <Typography
                size="1"
                css={{
                  position: "absolute",
                  bottom: "$5",
                  textAlign: "center",
                }}
              >
                Drag and drop your cover art <br /> or click to browse
              </Typography>
              {releaseArtwork && (
                <IconButton
                  onClick={handleRemoveCoverArt}
                  size="1"
                  css={{
                    br: "$round",
                    backgroundColor: "$whiteA11",
                    color: "$blackA12",
                    position: "absolute",
                    top: "-$2",
                    right: "-$2",

                    "&:hover": {
                      backgroundColor: "$whiteA12",
                    },

                    "& svg": {
                      display: "block",
                      width: "$5",
                      height: "$5",
                    },
                  }}
                >
                  <RxTrash />
                </IconButton>
              )}
            </ImageDropContainer>
            {form.formState.errors.releaseArtwork?.data ? (
              <FormHelperError>
                {form.formState.errors.releaseArtwork.data.message}
              </FormHelperError>
            ) : (
              <FormHelperText
              // css={{ position: "relative" }}
              >
                Cover art must be .jpg, .png, .webp or .avif <br />
                - Recommended size 2000x2000 <br />- Ensure you have rights to
                the image you choose
              </FormHelperText>
            )}
          </FormRow>
        </Flex>

        <DialogClose asChild>
          <IconButton css={{ br: "$round" }} size="1">
            <RxCross2 />
          </IconButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
