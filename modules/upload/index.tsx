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
import {
  RxChevronDown,
  RxExclamationTriangle,
  RxPencil2,
  RxPlus,
  RxTrash,
} from "react-icons/rx";
import { BsFillExclamationCircleFill } from "react-icons/bs";
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
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DetailsDialog } from "./DetailsDialog";
import { ImageDropContainer } from "./components/ImageDropContainer";
import { Image } from "@/ui/Image";
import { useWallet } from "@/hooks/useWallet";
import { upload } from "@/lib/upload";
import { toast } from "sonner";
import { ImageDropzone } from "./components/Dropzone";
import { FormSelect } from "./components/FormSelect";
import { udl } from "@/data/license";
import { ControlGroup } from "@/ui/ControlGroup";
import { formatSchemaValue } from "@/utils";

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

const formTabs: { [key: string]: Tab } = {
  details: {
    name: "details",
    fields: ["title", "description", "releaseArtwork", "genre", "releaseDate"],
  },
  tracklist: {
    name: "tracklist",
    fields: ["tracklist"],
  },
  monetization: {
    name: "monetization",
    fields: ["tokenQuantity", "license"],
  },
};

type FieldName = keyof UploadSchema;

type Tab = {
  name: string;
  fields: FieldName[];
};

type CurrentTab = "details" | "tracklist" | "monetization" | "review";

export const Upload = () => {
  const [showDetailsDialog, setShowDetailsDialog] = useState({
    open: false,
    index: 0,
  });
  const [currentTab, setCurrentTab] = useState<CurrentTab>("details");
  const { walletAddress, connect } = useWallet();

  const form = useForm<UploadSchema>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      genre: "none",
      tokenQuantity: 100,
      license: {
        type: "public-use",
        derivation: "with-credit",
        revShare: 1,
        commercial: "with-credit",
        currency: "U",
        commercialFee: 1,
        feeRecurrence: "one-time",
        paymentMode: "global",
      },
      releaseArtwork: {
        file: undefined,
        url: undefined,
      },
    },
  });

  const {
    getValues,
    trigger,
    control,
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
    if (currentTab === "monetization") {
      setCurrentTab("tracklist");
    }
    if (currentTab === "review") {
      setCurrentTab("monetization");
    }
  };

  // used to dynamically enable/disable tabs based on validity of fields in each stepv
  const checkRequiredValues = (values: any[]): boolean => {
    const hasRequiredValues = values.every((field) => {
      const values = getValues(field);

      console.log(values);

      if (typeof values === "object") {
        console.log("artwork values:", values);
        const artworkValid = Object.values(values).every((item) => item);
        console.log(artworkValid);
        return artworkValid;
      }

      return values;
    });

    return hasRequiredValues;
  };

  const reactiveTitle = watch("title");
  const reactiveDescription = watch("description");
  const reactiveArtwork = watch("releaseArtwork");
  const reactiveTracklist = watch("tracklist");

  const detailsValid = () => {
    const artworkValid = Object.values(reactiveArtwork).every((item) => item);

    if (!!reactiveTitle && !!reactiveDescription && artworkValid) {
      return true;
    } else {
      return false;
    }
  };

  const tracklistValid = () => {
    const isValid =
      reactiveTracklist.length > 0
        ? reactiveTracklist.every((track, index) => {
            const isTrackValid = trackValid(index);

            return isTrackValid;
          })
        : false;

    return isValid;
  };

  // validate track by required props - should automate as list grows
  const trackValid = (index: number) => {
    const title = watch("tracklist")[index].metadata.title;
    const description = watch("tracklist")[index].metadata.description;
    const artwork = watch("tracklist")[index].metadata.artwork;

    const artworkValid = artwork
      ? Object.values(artwork).every((item) => item)
      : false;

    if (!!title && !!description && artworkValid) {
      return true;
    } else {
      return false;
    }
  };

  const handleNext = async () => {
    const fields = formTabs[currentTab as keyof typeof formTabs].fields;
    const output = await trigger(fields as FieldName[], { shouldFocus: true });

    console.log(form.getValues());

    try {
      const result = uploadSchema.parse(getValues());
      console.log(result);
    } catch (error) {
      console.error(error);
    }

    console.log(errors);

    // if (!result.success) {
    //   console.log(result.error);
    // }

    if (!output) {
      return;
    }

    if (currentTab === "details") {
      setCurrentTab("tracklist");
    }
    if (currentTab === "tracklist") {
      setCurrentTab("monetization");
    }
    if (currentTab === "monetization") {
      setCurrentTab("review");
    }
  };

  const onAudioDrop = useCallback(async (acceptedFiles: File[]) => {
    const tracks: Track[] = [];

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
              file,
              url,
              // data: reader.result as ArrayBuffer,
              metadata: {
                title: file.name,
                description: "",
                genre: form.getValues("genre"),
                artwork: {
                  // data: form.getValues("releaseArtwork.data"),
                  file: form.getValues("releaseArtwork.file"),
                  url: form.getValues("releaseArtwork.url"),
                },
              },
            };
            resolve(track);
          };

          reader.onerror = () => {
            reject(new Error("Error reading your file"));
          };
        });

        tracks.push(track);
      } catch (error) {
        console.error("Unsupported file type.");
      }
    }

    /* 
    - we could re-implement tracks array but map
    through and append
    - advantage here is that we can detect a single track and instead of using the file name, use the release title for track title
    */
    const tracklistLength = watch("tracklist").length;
    const totalTrackLength = tracks.length + tracklistLength;

    tracks.forEach((track) => {
      if (totalTrackLength <= 1) {
        append({
          // data: track.data,
          file: track.file,
          url: track.url,
          metadata: {
            title: form.getValues("title"),
            description: form.getValues("description"),
            artwork: form.getValues("releaseArtwork"),
            genre: form.getValues("genre"),
          },
        });
      } else {
        append(track);
      }
    });
  }, []);

  const audio = useDropzone({
    accept: { "audio/*": [".wav", ".flac", ".mp3", ".aac"] },
    onDrop: onAudioDrop,
  });

  const handleRemoveCoverArt = (e: any) => {
    e.stopPropagation();

    resetField("releaseArtwork");
  };

  const handleShowDetailsDialog = (index: number) =>
    setShowDetailsDialog({ open: true, index });
  const handleCancelDetailsDialog = (index: number) =>
    setShowDetailsDialog({ open: false, index });

  const isAlbum =
    !!form.getValues("tracklist") && form.getValues("tracklist").length > 1;

  const tracks =
    form.getValues("tracklist") && form.getValues("tracklist").length;

  const onSubmit = async (data: UploadSchema) => {
    try {
      await upload(data, walletAddress);
      toast.success("Tracks successfully uploaded!");
    } catch (error) {
      console.error(error);
      toast.error("Upload error. Please try again.");
    }
  };

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
        <FormProvider {...form}>
          <Container
            css={{
              pb: 120,
            }}
            as="form"
            onSubmit={handleSubmit(onSubmit)}
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
                <TabsTrigger disabled={!detailsValid()} value="tracklist">
                  Tracklist
                </TabsTrigger>
                <TabsTrigger
                  disabled={!detailsValid() || !tracklistValid()}
                  value="monetization"
                >
                  Monetization
                </TabsTrigger>
                <TabsTrigger
                  disabled={!detailsValid() || !tracklistValid()}
                  value="review"
                >
                  Review
                </TabsTrigger>
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
                        size="3"
                      />
                      {errors.title && reactiveTitle.length < 1 && (
                        <FormHelperError>
                          {errors.title.message}
                        </FormHelperError>
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
                      {errors.description && reactiveDescription.length < 1 && (
                        <FormHelperError>
                          {errors.description.message}
                        </FormHelperError>
                      )}
                    </FormRow>
                    <FormRow>
                      <Label htmlFor="genre">Genre</Label>
                      <FormSelect name="genre" values={genres} />
                    </FormRow>
                    <FormRow>
                      <Label htmlFor="topics">Additional Tags</Label>
                      <TextField
                        id="topics"
                        type="text"
                        placeholder="Comma-seperated list of tags describing the mood of your track"
                        {...register("topics")}
                        size="3"
                      />
                    </FormRow>
                    <FormRow>
                      <Label htmlFor="releaseDate">
                        Release Date (optional)
                      </Label>
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
                    <ImageDropzone
                      name="releaseArtwork.file"
                      hidden={!!reactiveArtwork?.url}
                      size="3"
                    >
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

                      {reactiveArtwork.url && (
                        <>
                          <Image
                            css={{
                              width: "100%",
                              height: "100%",
                              position: "absolute",
                              inset: 0,
                            }}
                            src={reactiveArtwork.url}
                          />
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
                        </>
                      )}
                    </ImageDropzone>
                    <Flex direction="column" gap="3">
                      <FormHelperText css={{ position: "relative" }}>
                        Cover art must be .jpg, .png, .webp or .avif <br />
                        - Recommended size 2000x2000 <br />- Ensure you have
                        rights to the image you choose
                      </FormHelperText>
                      {errors.releaseArtwork && !reactiveArtwork.file && (
                        <FormHelperError
                          css={{
                            position: "relative",
                          }}
                        >
                          {errors.releaseArtwork.file?.message}
                        </FormHelperError>
                      )}
                    </Flex>
                  </FormRow>
                </Flex>
              </TabsContent>
              <TabsContent value="tracklist">
                <Container
                  css={
                    {
                      // maxWidth: 700,
                    }
                  }
                >
                  <Flex
                    css={{ mx: "auto", mt: "$10", width: "100%" }}
                    direction="column"
                    align="center"
                    gap="10"
                  >
                    <Flex css={{ width: "100%" }} direction="column">
                      {fields.map((track, index) => (
                        <Flex
                          key={track.id}
                          css={{
                            position: "relative",
                            width: "100%",
                            py: "$5",
                            pr: "$10",
                            pl: "$7",
                            // br: "$3",

                            "&:hover": {
                              backgroundColor: "$slate2",
                            },
                          }}
                          justify="between"
                          align="center"
                        >
                          <Flex align="center" gap="5">
                            <Image
                              src={
                                form.getValues("tracklist")[index].metadata
                                  .artwork?.url
                              }
                              css={{
                                width: 40,
                                height: 40,
                              }}
                            />
                            <Typography>{track.metadata.title}</Typography>
                          </Flex>
                          <Flex align="center" gap="1">
                            <IconButton
                              aria-label="Edit track details"
                              type="button"
                              onClick={() => handleShowDetailsDialog(index)}
                              variant="ghost"
                              size="2"
                            >
                              <RxPencil2 />
                            </IconButton>
                            <IconButton
                              aria-label="Delete track from release"
                              type="button"
                              css={{
                                color: "$red10",

                                "&:hover": {
                                  backgroundColor: "$red4",
                                  color: "$red11",
                                },

                                "&:active": {
                                  backgroundColor: "$red5",
                                  // color: "$red11",
                                },
                              }}
                              onClick={() => remove(index)}
                              variant="ghost"
                              size="2"
                            >
                              <RxTrash />
                            </IconButton>

                            {errors.tracklist &&
                              errors.tracklist[index] &&
                              !trackValid(index) && (
                                <IconButton
                                  variant="transparent"
                                  as="span"
                                  css={{
                                    color: "$red10",
                                    position: "absolute",
                                    right: "$2",

                                    "&:hover": {
                                      color: "$red10",
                                    },
                                  }}
                                >
                                  <BsFillExclamationCircleFill aria-label="Track contains errors" />
                                </IconButton>
                              )}
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
                    {errors.tracklist && fields.length <= 0 && (
                      <FormHelperError
                        css={{
                          position: "relative",
                        }}
                      >
                        {errors.tracklist.message}
                      </FormHelperError>
                    )}
                  </Flex>
                </Container>
              </TabsContent>
              <TabsContent value="monetization">
                <Flex
                  css={{ mt: "$10", $$formGap: "80px" }}
                  direction="column"
                  gap="3"
                >
                  <FormRow>
                    <Label htmlFor="tokenQuantity">Content tokens</Label>
                    <TextField
                      css={{ maxWidth: `calc(50% - $$formGap / 2)` }}
                      size="3"
                      type="number"
                      defaultValue={getValues("tokenQuantity")}
                      min={1}
                      max={100}
                    />
                    {errors.tokenQuantity && (
                      <FormHelperError>
                        {errors.tokenQuantity.message}
                      </FormHelperError>
                    )}
                  </FormRow>
                  <Typography>License information</Typography>
                  <FormRow
                    css={{
                      maxWidth: `calc(50% - $$formGap / 2)`,
                    }}
                  >
                    <Label htmlFor="license.type">UDL</Label>
                    <FormSelect name="license.type" values={udl.type} />
                    <Typography
                      css={{
                        mt: "$1",
                        textDecoration: "underline",
                        cursor: "pointer",
                        alignSelf: "start",

                        "&:hover": {
                          color: "$slate12",
                        },
                      }}
                      as="a"
                      href="https://arwiki.wiki/#/en/Universal-Data-License-How-to-use-it"
                      size="1"
                    >
                      What is UDL?
                    </Typography>
                  </FormRow>
                  {watch("license.type") !== "attribution" &&
                    watch("license.type") !== "public-use" && (
                      <Flex
                        justify="between"
                        css={{
                          gap: "$$formGap",
                        }}
                      >
                        <Flex
                          css={{
                            flex: 1,
                            maxWidth: `calc(50% - $$formGap / 2)`,
                          }}
                          direction="column"
                          gap="5"
                        >
                          <FormRow>
                            <Label htmlFor="license.derivation">
                              Derivation Options
                            </Label>
                            <FormSelect
                              name="license.derivation"
                              values={udl.derivationOpts}
                            />
                          </FormRow>
                          {watch("license.derivation") ===
                            "with-revenue-share" && (
                            <FormRow>
                              <Label htmlFor="license.revShare">
                                Revenue Share Percentage
                              </Label>
                              <TextField
                                size="3"
                                type="number"
                                defaultValue={getValues("license.revShare")}
                                min={1}
                                max={100}
                                placeholder="Enter a percentage"
                              />
                            </FormRow>
                          )}
                        </Flex>
                        {watch("license.type") !== "noncommercial" && (
                          <Flex css={{ flex: 1 }} direction="column" gap="5">
                            <FormRow>
                              <Label htmlFor="license.commercial">
                                Commercial Use
                              </Label>
                              <FormSelect
                                name="license.commercial"
                                values={udl.commercialOpts}
                              />
                            </FormRow>
                            {watch("license.commercial") === "with-fee" && (
                              <>
                                <FormRow>
                                  <Label htmlFor="license.revShare">
                                    Commercial Use Fee
                                  </Label>
                                  <ControlGroup isSelect>
                                    <TextField
                                      size="3"
                                      type="number"
                                      min={1}
                                      max={100}
                                      placeholder="1"
                                      defaultValue={getValues(
                                        "license.commercialFee"
                                      )}
                                    />
                                    <FormSelect
                                      name="license.currency"
                                      values={udl.currencyOpts}
                                    />
                                  </ControlGroup>
                                </FormRow>
                                <FormRow>
                                  <Label htmlFor="license.paymentMode">
                                    Payment Mode
                                  </Label>
                                  <FormSelect
                                    name="license.paymentMode"
                                    values={udl.paymentModeOpts}
                                  />
                                </FormRow>
                              </>
                            )}
                          </Flex>
                        )}
                      </Flex>
                    )}
                </Flex>
              </TabsContent>
              <TabsContent value="review">
                <Typography css={{ mt: "$10" }} as="h3" contrast="hi">
                  Review and upload
                </Typography>
                <Flex css={{ mt: "$10" }} justify="between" gap="20">
                  <Flex css={{ flex: 1 }} direction="column" gap="7">
                    <Box>
                      <Typography size="4" weight="6" contrast="hi">
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
                        {getValues("description") || "-"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography>Genre</Typography>
                      <Typography contrast="hi">
                        {getValues("genre")}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography>Additional Tags</Typography>
                      <Typography contrast="hi">
                        {getValues("topics") || "-"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography>License</Typography>
                      <Typography contrast="hi">
                        {formatSchemaValue(getValues("license.type"))}
                      </Typography>
                    </Box>
                  </Flex>
                  <Image
                    css={{
                      width: 400,
                      height: 400,
                    }}
                    src={getValues("releaseArtwork.url")}
                  />
                </Flex>
              </TabsContent>
            </Tabs>
          </Container>
        </FormProvider>
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
          {currentTab === "review" && (
            <>
              {walletAddress ? (
                <Button type="submit" variant="solid">
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
                  variant="solid"
                >
                  Connect to submit
                </Button>
              )}
            </>
          )}
        </Container>
      </Box>
    </Fullscreen>
  );
};
