import { Button } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Typography } from "@/ui/Typography";
import { Box } from "@/ui/Box";
import { styled } from "@/stitches.config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/Tabs";
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
import { Label } from "@/ui/Label";
import { RxChevronDown, RxPlus, RxTrash } from "react-icons/rx";
import { Track, UploadSchema, uploadSchema } from "./schema";
import { TextField } from "@/ui/TextField";
import { Textarea } from "@/ui/Textarea";
import { genres } from "@/data/genres";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { IconButton } from "@/ui/IconButton";
import { Tracklist } from "./Tracklist";
import { Container } from "@/ui/Container";
import { FormHelperError, FormHelperText, FormRow } from "@/ui/Form";
import { useDynamicForm } from "@/hooks/useDynamicForm";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DetailsDialog } from "./DetailsDialog";
import { ImageDropContainer } from "./components/ImageDropContainer";
import { Image } from "@/ui/Image";
import { useWallet } from "@/hooks/useWallet";

const AudioDropContainer = styled("div", {
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

const Fullscreen = styled("div", {
  width: "100%",
  minHeight: "100dvh",
  position: "relative",
});

type FieldName = keyof UploadSchema;

type Tab = {
  name: string;
  fields: FieldName[];
};

type CurrentTab = "details" | "tracklist" | "review";

type FormTabs = {
  details: Tab;
  tracklist: Tab;
};

export const Upload = () => {
  const [releaseArtwork, setReleaseArtwork] = useState<string>();
  const [showDetailsDialog, setShowDetailsDialog] = useState({
    open: false,
    index: 0,
  });
  const [currentTab, setCurrentTab] = useState<CurrentTab>("details");
  const [formTabs, setFormTabs] = useState<FormTabs>({
    details: {
      name: "details",
      fields: ["title", "description", "genre", "releaseDate"],
    },
    tracklist: {
      name: "tracklist",
      fields: ["tracklist"],
    },
  });
  const { walletAddress, connect } = useWallet();

  const form = useForm<UploadSchema>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      genre: "none",
    },
  });

  // const { form } = useDynamicForm();
  const {
    getValues,
    trigger,
    setValue,
    resetField,
    register,
    handleSubmit,
    watch,
    formState,
  } = form;
  const { errors } = formState;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tracklist",
  });

  const handlePrevious = () => {
    if (currentTab === "tracklist") {
      setCurrentTab("details");
    }
    if (currentTab === "review") {
      setCurrentTab("tracklist");
    }
  };

  const handleNext = async () => {
    const fields = formTabs[currentTab as keyof FormTabs].fields;
    const output = await trigger(fields as FieldName[], { shouldFocus: true });

    console.log(form.getValues());

    await handleSubmit((data) => console.log(data))();

    try {
      const result = uploadSchema.parse(getValues());
      console.log(result);
    } catch (error) {
      console.error(error);
    }

    // if (!result.success) {
    //   console.log(result.error);
    // }

    if (!output) {
      return;
    }

    if (currentTab === "details") {
      setCurrentTab("tracklist");
    } else if (currentTab === "tracklist") {
      setCurrentTab("review");
    } else {
      await handleSubmit((data) => console.log(data))();
    }
  };

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

      console.log(reader.result);

      setReleaseArtwork(url);
      setValue("releaseArtwork.file", imageFileInfo);
      setValue("releaseArtwork.data", reader.result as ArrayBuffer);
    };

    reader.readAsArrayBuffer(imageFile);
  }, []);

  const image = useDropzone({
    accept: { "image/*": [".jpeg", ".png", ".webp", ".avif"] },
    maxFiles: 1,
    onDrop: onImageDrop,
  });

  const onAudioDrop = useCallback(async (acceptedFiles: File[]) => {
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
                title: file.name,
                description: "",
                artwork: {
                  data: form.getValues("releaseArtwork.data"),
                  file: {
                    name: "",
                    size: 0,
                    type: "",
                    url: form.getValues("releaseArtwork.file.url"),
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

        append(track);
      } catch (error) {
        console.error("Unsupported file type.");
      }
    }
  }, []);

  const audio = useDropzone({
    accept: { "audio/*": [".wav", ".flac", ".mp3", ".aac"] },
    onDrop: onAudioDrop,
  });

  const handleRemoveCoverArt = (e: any) => {
    e.stopPropagation();

    resetField("releaseArtwork");
    setReleaseArtwork(undefined);
  };

  const handleShowDetailsDialog = (index: number) =>
    setShowDetailsDialog({ open: true, index });
  const handleCancelDetailsDialog = (index: number) =>
    setShowDetailsDialog({ open: false, index });

  const isAlbum =
    //@ts-ignore
    !!form.getValues("tracklist") && form.getValues("tracklist").length > 1;

  const tracks =
    //@ts-ignore
    form.getValues("tracklist") && form.getValues("tracklist").length;

  return (
    <Fullscreen>
      <Flex direction="column">
        <Flex
          justify="between"
          align="center"
          css={{ py: "$3", px: "$7", mb: "$5" }}
        >
          <Typography contrast="hi">radar</Typography>
          <Button variant="transparent">connect wallet</Button>
        </Flex>
        <Container
          css={{
            pb: 120,
          }}
          as="form"
          onSubmit={handleSubmit((data) => console.log(data))}
        >
          <Tabs
            onValueChange={(e) => {
              setCurrentTab(e as CurrentTab);
            }}
            css={{ width: "100%" }}
            defaultValue={currentTab}
            value={currentTab}
          >
            <TabsList>
              <TabsTrigger value="details">Release details</TabsTrigger>
              <TabsTrigger value="tracklist">Tracklist</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <Flex gap="20">
                <Flex css={{ flex: 1 }} direction="column">
                  <FormRow>
                    <Label htmlFor="title">Title</Label>
                    <TextField
                      id="title"
                      type="text"
                      placeholder="Release Title"
                      {...register("title")}
                    />
                    {errors.title && (
                      <FormHelperError>{errors.title.message}</FormHelperError>
                    )}
                  </FormRow>
                  <FormRow>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      size="3"
                      id="description"
                      placeholder="Release Description"
                      {...register("description")}
                    />
                    {errors.description && (
                      <FormHelperError>
                        {errors.description.message}
                      </FormHelperError>
                    )}
                  </FormRow>
                  <FormRow>
                    <Label htmlFor="genre">Genre</Label>
                    <Select
                      defaultValue={getValues("genre")}
                      {...register("genre")}
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
                  </FormRow>
                  <FormRow>
                    <Label htmlFor="releaseDate">Release Date (optional)</Label>
                    <TextField
                      id="releaseDate"
                      type="date"
                      placeholder="Release Date"
                      {...register("releaseDate")}
                    />
                    {errors.releaseDate && (
                      <FormHelperError>
                        {errors.releaseDate.message}
                      </FormHelperError>
                    )}
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
                    size="3"
                    {...image.getRootProps()}
                  >
                    <input {...image.getInputProps()} />
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
                  {errors.releaseArtwork?.data ? (
                    <FormHelperError>
                      {errors.releaseArtwork.data.message}
                    </FormHelperError>
                  ) : (
                    <FormHelperText
                    // css={{ position: "relative" }}
                    >
                      Cover art must be .jpg, .png, .webp or .avif <br />
                      - Recommended size 2000x2000 <br />- Ensure you have
                      rights to the image you choose
                    </FormHelperText>
                  )}
                </FormRow>
              </Flex>
            </TabsContent>
            <TabsContent value="tracklist">
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
                  <AudioDropContainer {...audio.getRootProps()}>
                    <input {...audio.getInputProps()} />
                    <Flex gap="5" align="center">
                      <Flex direction="column" align="center">
                        <Typography css={{ color: "$slate12" }}>
                          Drag your songs here
                        </Typography>
                        <Typography size="1">
                          .mp3, .wav, .flac, .aiff
                        </Typography>
                      </Flex>
                      <Typography>or</Typography>
                      <Typography css={{ color: "$violet11" }}>
                        Browse your computer
                      </Typography>
                    </Flex>
                  </AudioDropContainer>
                  {/* {form.formState.errors.tracklist && (
          <FormHelperErrorText>
            {form.formState.errors.tracklist.message}
          </FormHelperErrorText>
        )} */}
                  {/* {tracklist && tracklist.length && ( */}
                  <Flex css={{ width: "100%" }} direction="column" gap="3">
                    {fields.map((track, index) => (
                      <Flex
                        key={track.id}
                        css={{
                          backgroundColor: "$slate2",
                          width: "100%",
                          py: "$5",
                          pr: "$3",
                          pl: "$7",
                          br: "$1",
                        }}
                        justify="between"
                        align="center"
                      >
                        <Typography>{track.file.name}</Typography>
                        <Flex>
                          <Button
                            onClick={() => handleShowDetailsDialog(index)}
                            variant="transparent"
                            size="1"
                          >
                            Edit track details
                          </Button>
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
                        </Flex>

                        <DetailsDialog
                          track={track}
                          form={form}
                          index={index}
                          open={
                            showDetailsDialog.open &&
                            index === showDetailsDialog.index
                          }
                          onClose={() => handleCancelDetailsDialog(index)}
                        />
                      </Flex>
                    ))}
                  </Flex>
                </Flex>
              </Container>
            </TabsContent>
            <TabsContent value="review">
              <Typography css={{ mt: "$10" }} as="h3" size="5" contrast="hi">
                Review
              </Typography>
              <Flex css={{ mt: "$10" }} justify="between" gap="20">
                <Flex css={{ flex: 1 }} direction="column" gap="10">
                  <Box>
                    <Typography size="4" contrast="hi">
                      {getValues("title")}
                    </Typography>
                    {isAlbum ? (
                      <Typography>Album release, {tracks} tracks</Typography>
                    ) : (
                      <Typography>Single release, {tracks} track</Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography>Release Description</Typography>
                    <Typography contrast="hi">
                      {getValues("description")}
                    </Typography>
                  </Box>
                  {walletAddress ? (
                    <Button type="submit" css={{ mt: "auto" }} variant="solid">
                      Submit
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() =>
                        connect([
                          "ACCESS_ADDRESS",
                          "ACCESS_PUBLIC_KEY",
                          "SIGNATURE",
                          "SIGN_TRANSACTION",
                        ])
                      }
                      css={{ mt: "auto" }}
                      variant="solid"
                    >
                      Connect to submit
                    </Button>
                  )}
                </Flex>
                <Image
                  css={{
                    width: 400,
                    height: 400,
                  }}
                  src={getValues("releaseArtwork.file.url")}
                />
              </Flex>
            </TabsContent>
          </Tabs>
        </Container>
      </Flex>
      <Box
        css={{
          borderTop: "$slate6 1px solid",
          backgroundColor: "$blackA11",
          backdropFilter: "blur(4px)",
          position: "fixed",
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <Container
          css={{
            justifyContent: currentTab === "details" ? "end" : "space-between",

            py: "$5",
          }}
        >
          {currentTab !== "details" && (
            <Button onClick={handlePrevious} variant="outline">
              Back
            </Button>
          )}
          {currentTab !== "review" && (
            <Button
              onClick={handleNext}
              variant="solid"
              css={{ alignSelf: "end" }}
            >
              Next
            </Button>
          )}
        </Container>
      </Box>
    </Fullscreen>
  );
};
