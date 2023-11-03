import { styled } from "@/stitches.config";
import { Flex } from "@/ui/Flex";
import { Typography } from "@/ui/Typography";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Track, UploadSchema, uploadSchema } from "./schema";
import { UseFormReturn } from "react-hook-form";
import { Container } from "@/ui/Container";
import { Button } from "@/ui/Button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/ui/Dialog";
import { FormRow } from "@/ui/Form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/ui/Label";
import { TextField } from "@/ui/TextField";
import { useDynamicForm } from "@/hooks/useDynamicForm";

interface DetailsDialogProps {
  index: number;
  open: boolean;
  onClose: () => void;
}

const DetailsDialog = ({ index, open, onClose }: DetailsDialogProps) => {
  const {
    form: { register },
  } = useDynamicForm();
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        css={{
          maxWidth: 700,
        }}
      >
        <DialogTitle asChild>
          <Typography>Add details for track {index + 1}</Typography>
        </DialogTitle>
        <FormRow>
          <Label htmlFor={`tracklist.${index}.metadata.title`}>Title</Label>
          <TextField
          // {...register(`tracklist.${index}.metadata.title` as const)}
          />
        </FormRow>
      </DialogContent>
    </Dialog>
  );
};

const DropContainer = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  py: "$4",
  px: "$4",
  cursor: "pointer",
  border: "2px dashed $colors$slate6",
  position: "relative",
  width: "100%",
  minHeight: 120,

  variants: {
    hovered: {
      true: {
        border: "2px dashed $colors$focus",
      },
    },
  },
});

interface TracklistProps {
  form: UseFormReturn<UploadSchema>;
}

export const Tracklist = () =>
  // { form, fields }: TracklistProps
  {
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    const { fields, form, append, remove } = useDynamicForm();

    const onDrop = async (acceptedFiles: File[]) => {
      console.log(acceptedFiles);

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];

        const reader = new FileReader();

        reader.onabort = () => console.log("file reading was aborted");

        try {
          const track = await new Promise<Track>((resolve, reject) => {
            // create a new FileReader
            // read the file as an ArrayBuffer
            reader.readAsArrayBuffer(file);

            reader.onload = () => {
              let blob;
              let url;
              blob = new Blob([file], { type: file.type });
              url = window.URL.createObjectURL(blob);

              const track: Track = {
                file: {
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  url,
                },
                data: reader.result as ArrayBuffer,
                metadata: {
                  title: "",
                  description: "",
                  artwork: {
                    data: "" as any,
                    file: {
                      name: "",
                      size: 0,
                      type: "",
                      url: "",
                    },
                  },
                },
              };
              resolve(track);
            };

            reader.onerror = () => {
              reject(new Error("Error reading your file"));
            };
          });

          // append(track);
        } catch (error) {
          console.error("Unsupported file type.");
        }
      }
    };

    // const onDrop = useCallback(async (acceptedFiles: File[]) => {
    //   const tracks = form.watch("fields []);

    //   console.log(acceptedFiles);

    //   for (let i = 0; i < acceptedFiles.length; i++) {
    //     const file = acceptedFiles[i];

    //     const reader = new FileReader();

    //     reader.onabort = () => console.log("file reading was aborted");

    //     try {
    //       const track = await new Promise<Track>((resolve, reject) => {
    //         // create a new FileReader
    //         // read the file as an ArrayBuffer
    //         reader.readAsArrayBuffer(file);

    //         reader.onload = () => {
    //           let blob;
    //           let url;
    //           blob = new Blob([file], { type: file.type });
    //           url = window.URL.createObjectURL(blob);

    //           const track: Track = {
    //             file: {
    //               name: file.name,
    //               size: file.size,
    //               type: file.type,
    //               url,
    //             },
    //             data: reader.result as ArrayBuffer,
    //             metadata: {
    //               title: "",
    //               description: "",
    //               artwork: {
    //                 data: "" as any,
    //                 file: {
    //                   name: "",
    //                   size: 0,
    //                   type: "",
    //                   url: "",
    //                 },
    //               },
    //             },
    //           };
    //           resolve(track);
    //         };

    //         reader.onerror = () => {
    //           reject(new Error("Error reading your file"));
    //         };
    //       });

    //       append(track);
    //     } catch (error) {
    //       console.error("Unsupported file type.");
    //     }
    //   }
    // }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: { "audio/*": [".wav", ".flac", ".mp3", ".aac"] },
      onDrop,
    });

    const handleShowDetailsDialog = () => setShowDetailsDialog(true);
    const handleCancelDetailsDialog = () => setShowDetailsDialog(false);

    return (
      <Container
        css={{
          maxWidth: 700,
        }}
      >
        <Flex
          css={{ mx: "auto", mt: "$10", width: "100%" }}
          direction="column"
          align="center"
          gap="10"
        >
          <DropContainer {...getRootProps()}>
            <input {...getInputProps()} />
            <Flex gap="5" align="center">
              <Flex direction="column" align="center">
                <Typography css={{ color: "$slate12" }}>
                  Drag your songs here
                </Typography>
                <Typography size="1">.mp3, .wav, .flac, .aiff</Typography>
              </Flex>
              <Typography>or</Typography>
              <Typography css={{ color: "$violet11" }}>
                Browse your computer
              </Typography>
            </Flex>
          </DropContainer>
          {/* {form.formState.errors.tracklist && (
            <FormHelperErrorText>
              {form.formState.errors.tracklist.message}
            </FormHelperErrorText>
          )} */}
          {/* {tracklist && tracklist.length && ( */}
          <Flex css={{ width: "100%" }} direction="column" gap="3">
            {fields.map(({ file, id }, index) => (
              <Flex
                key={id}
                css={{
                  backgroundColor: "$slate2",
                  width: "100%",
                  py: "$5",
                  br: "$1",
                  px: "$3",
                }}
                justify="between"
              >
                <Typography>{file.name}</Typography>
                <Flex>
                  <Button
                    css={{
                      color: "$red10",

                      "&:hover": {
                        color: "$red11",
                      },
                    }}
                    onClick={() => remove(index)}
                    variant="transparent"
                    size="1"
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={handleShowDetailsDialog}
                    variant="transparent"
                    size="1"
                  >
                    Edit track details
                  </Button>
                </Flex>

                <Button type="submit" variant="solid">
                  Submit
                </Button>

                <DetailsDialog
                  index={index}
                  open={showDetailsDialog}
                  onClose={handleCancelDetailsDialog}
                />
              </Flex>
            ))}
          </Flex>
          {/* <Button
            type="button"
            onClick={() =>
              append({
                name: "gm",
                value: "web3",
              })
            }
          >
            append
          </Button> */}
          {/* )} */}
        </Flex>
      </Container>
    );
  };
