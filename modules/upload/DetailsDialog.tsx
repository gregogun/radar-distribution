import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/ui/Dialog";
import { FormHelperError, FormHelperText, FormRow } from "@/ui/Form";
import { Label } from "@/ui/Label";
import { TextField } from "@/ui/TextField";
import { Typography } from "@/ui/Typography";
import { Controller, UseFormReturn, useFormContext } from "react-hook-form";
import { Track, UploadSchema } from "./schema";
import { IconButton } from "@/ui/IconButton";
import { RxChevronDown, RxCross2, RxPlus, RxTrash } from "react-icons/rx";
import { Textarea } from "@/ui/Textarea";
import { useDropzone } from "react-dropzone";
import { useCallback, useEffect, useState } from "react";
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
import { Image } from "@/ui/Image";

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
  // const [releaseArtwork, setReleaseArtwork] = useState<string | undefined>(
  //   track.metadata.artwork ? track.metadata.artwork.url : undefined
  // );
  // const { formState } = useFormContext()

  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
    const imageFile = acceptedFiles[0];

    console.log(imageFile);

    const reader = new FileReader();

    reader.onabort = () => console.error("file reading was aborted");
    reader.onerror = () => console.error("file reading has failed");

    reader.onload = () => {
      let blob;
      let url;
      blob = new Blob([imageFile], { type: imageFile.type });
      url = window.URL.createObjectURL(blob);

      // setReleaseArtwork(url);
      form.setValue(`tracklist.${index}.metadata.artwork.file`, imageFile);
      form.setValue(`tracklist.${index}.metadata.artwork.url`, url);
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

    form.resetField(`tracklist.${index}.metadata.artwork`);
  };

  const releaseArtwork = form.getValues("releaseArtwork");
  const trackArtwork = form.getValues("tracklist")[index].metadata.artwork;

  useEffect(() => {
    if (form.getValues("tracklist").length === 1) {
      const title = form.getValues("tracklist")[index].metadata.title;
      const description =
        form.getValues("tracklist")[index].metadata.description;
      const releaseTitle = form.getValues("title");
      const releaseDescription = form.getValues("description");

      if (title !== releaseTitle) {
        form.setValue(`tracklist.${index}.metadata.title`, releaseTitle);
      }

      if (description !== releaseDescription) {
        form.setValue(
          `tracklist.${index}.metadata.description`,
          releaseDescription
        );
      }

      if (trackArtwork !== releaseArtwork) {
        form.setValue(`tracklist.${index}.metadata.artwork`, releaseArtwork);
      }
    }
  }, [form.getValues("tracklist")]);

  const reactiveTitle = form.watch("tracklist")[index].metadata.title;
  const reactiveDescription =
    form.watch("tracklist")[index].metadata.description;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        css={{
          maxWidth: 800,
          overflowY: "scroll",

          // "@bp4": {
          //   maxHeight: 600,
          // },

          // "@bp5": {
          //   maxHeight: 700,
          // },
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
                disabled={form.getValues("tracklist").length <= 1}
                type="text"
                placeholder="Title"
                {...form.register(`tracklist.${index}.metadata.title` as const)}
              />
              {form.formState.errors.tracklist &&
                form.formState.errors.tracklist[index]?.metadata?.title &&
                reactiveTitle.length < 1 && (
                  <FormHelperError>
                    {
                      form.formState.errors.tracklist[index]?.metadata?.title
                        ?.message
                    }
                  </FormHelperError>
                )}
            </FormRow>
            <FormRow>
              <Label htmlFor={`tracklist.${index}.metadata.description`}>
                Description
              </Label>
              <Textarea
                disabled={form.getValues("tracklist").length <= 1}
                placeholder="Track description"
                size="3"
                {...form.register(
                  `tracklist.${index}.metadata.description` as const
                )}
              />
              {form.formState.errors.tracklist &&
                form.formState.errors.tracklist[index]?.metadata?.description &&
                reactiveDescription.length < 1 && (
                  <FormHelperError>
                    {
                      form.formState.errors.tracklist[index]?.metadata
                        ?.description?.message
                    }
                  </FormHelperError>
                )}
            </FormRow>
            <FormRow>
              <Label htmlFor={`tracklist.${index}.metadata.genre`}>Genre</Label>
              <Controller
                render={({ field: { onChange } }) => (
                  <Select
                    disabled={form.getValues("tracklist").length <= 1}
                    onValueChange={(e) => onChange(e)}
                    value={form.getValues("tracklist")[index].metadata.genre}
                  >
                    <SelectTrigger>
                      <SelectValue />
                      <SelectIcon>
                        <RxChevronDown />
                      </SelectIcon>
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectContent sideOffset={8}>
                        <SelectViewport>
                          {genres.map((genre) => (
                            <SelectItem key={genre} value={genre}>
                              {genre}
                            </SelectItem>
                          ))}
                        </SelectViewport>
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                )}
                name={`tracklist.${index}.metadata.genre`}
                control={form.control}
              />
            </FormRow>
          </Flex>

          <FormRow
            css={{
              height: "max-content",
            }}
          >
            <Label htmlFor={`tracklist.${index}.metadata.artwork.url`}>
              Cover Art
            </Label>
            <ImageDropContainer
              css={{
                // background: releaseArtwork
                //   ? `url(${releaseArtwork})`
                //   : "transparent",

                // mb: "$15",
                pointerEvents:
                  form.getValues("tracklist").length <= 1 ? "none" : "auto",
                opacity: form.getValues("tracklist").length <= 1 ? 0.5 : 1,
              }}
              hidden={!!trackArtwork}
              hovered={image.isDragActive}
              size="2"
              {...image.getRootProps()}
            >
              <input
                disabled={form.getValues("tracklist").length <= 1}
                {...form.register(`tracklist.${index}.metadata.artwork.url`)}
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
              {trackArtwork && (
                <>
                  <Image
                    css={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      inset: 0,
                    }}
                    src={trackArtwork.url}
                  />
                  {form.getValues("tracklist").length > 1 && (
                    <IconButton
                      onClick={handleRemoveCoverArt}
                      size="1"
                      css={{
                        br: "$round",
                        backgroundColor: "$slate12",
                        color: "$blackA12",
                        position: "absolute",
                        top: "-$2",
                        right: "-$2",

                        "&:hover": {
                          backgroundColor: "$slateSolidHover",
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
                </>
              )}
            </ImageDropContainer>
            <Flex direction="column" gap="3">
              <FormHelperText css={{ position: "relative" }}>
                Cover art must be .jpg, .png, .webp or .avif <br />
                - Recommended size 2000x2000 <br />- Ensure you have rights to
                the image you choose
              </FormHelperText>
              {form.formState.errors.tracklist &&
                form.formState.errors.tracklist[index]?.metadata?.artwork &&
                !trackArtwork && (
                  <FormHelperError
                    css={{
                      position: "relative",
                    }}
                  >
                    {
                      form.formState.errors.tracklist[index]?.metadata?.artwork
                        ?.message
                    }
                  </FormHelperError>
                )}
            </Flex>
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
