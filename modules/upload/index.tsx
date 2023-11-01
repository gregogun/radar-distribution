import { Button } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Typography } from "@/ui/Typography";
import styles from "@/styles/Home.module.css";
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
import { useForm } from "react-hook-form";
import { UploadSchema, uploadSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/ui/TextField";
import { Textarea } from "@/ui/Textarea";
import { genres } from "@/data/genres";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { IconButton } from "@/ui/IconButton";

const DropContainer = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  py: "$4",
  px: "$4",
  cursor: "pointer",
  border: "2px dashed $colors$slate6",
  position: "relative",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",

  "&:hover": {
    border: "2px dashed $colors$slate7",
  },

  variants: {
    size: {
      1: {
        width: 200,
        height: 200,
        // fontSize: "$1",
        "& svg": {
          width: 40,
          height: 40,
        },
      },
      2: {
        width: 300,
        height: 300,
        // fontSize: "$2",
        "& svg": {
          width: 80,
          height: 80,
        },
      },
      3: {
        width: 400,
        height: 400,
        // fontSize: "$2",
        "& svg": {
          width: 140,
          height: 140,
        },
      },
    },
    hovered: {
      true: {
        border: "2px dashed $colors$focus",
      },
    },
    hidden: {
      true: {
        border: "none",

        "&:hover": {
          border: "none",
        },
        "& svg": {
          display: "none",
        },
        "& p": {
          display: "none",
        },
      },
    },
  },
  compoundVariants: [
    {
      hovered: true,
      hidden: true,
      css: {
        border: "none",
        opacity: 0.7,
      },
    },
  ],

  defaultVariants: {
    size: "2",
  },
});

const Container = styled("div", {
  display: "flex",
  width: "100%",
  mx: "auto",

  "@bp3": {
    px: 0,
    maxWidth: 700,
  },
  "@bp4": {
    maxWidth: 1000,
  },
  "@bp5": {
    maxWidth: 1200,
  },
});

const FormHelperErrorText = styled("p", {
  fontSize: "$1",
  lineHeight: "$2",
  color: "$red11",
  m: 0,
  mt: "$1",
  position: "absolute",
  bottom: 0,
});

const FormHelperError = ({ children }: { children: React.ReactNode }) => (
  <FormHelperErrorText role="alert" aria-live="polite">
    {children}
  </FormHelperErrorText>
);

const FormHelperText = styled("p", {
  fontSize: "$1",
  lineHeight: "$2",
  m: 0,
  mt: "$1",
  position: "absolute",
  bottom: 0,
});

const FormRow = styled(Flex, {
  gap: "$3",
  mt: "$10",
  pb: "$7",
  position: "relative",

  defaultVariants: {
    direction: "column",
  },

  "& span": {
    color: "$slate12",
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
  // tracklist: Tab;
};

export const Upload = () => {
  const [releaseArtwork, setReleaseArtwork] = useState<string>();
  const [currentTab, setCurrentTab] = useState<CurrentTab>("details");
  const [formTabs, setFormTabs] = useState<FormTabs>({
    details: {
      name: "details",
      fields: ["title", "description", "genre", "releaseDate"],
    },
  });

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    resetField,
    formState: { errors },
  } = useForm<UploadSchema>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      genre: "none",
    },
  });

  const handleNext = async () => {
    const fields = formTabs[currentTab as keyof FormTabs].fields;
    const output = await trigger(fields as FieldName[], { shouldFocus: true });

    if (!output) return;

    if (currentTab === "details") {
      setCurrentTab("tracklist");
    } else if (currentTab === "tracklist") {
      setCurrentTab("review");
    } else {
      await handleSubmit((data) => console.log(data))();
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
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

  useEffect(() => {
    if (releaseArtwork) {
      console.log(releaseArtwork);
    }
  }, [releaseArtwork]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpeg", ".png", ".webp", ".avif"] },
    maxFiles: 1,
    // accept: { "audio/*": [".wav", ".flac", ".mp3", ".aac"] },
    onDrop,
  });

  const handleRemoveCoverArt = (e: any) => {
    e.stopPropagation();

    resetField("releaseArtwork");
    setReleaseArtwork(undefined);
  };

  return (
    <Fullscreen>
      <Flex direction="column">
        <Flex justify="between" align="center" css={{ p: "$7" }}>
          <Typography size="5">radar</Typography>
          <Button>connect wallet</Button>
        </Flex>
        <Button css={{ alignSelf: "center" }} onClick={() => trigger()}>
          Display requirements
        </Button>
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
              <Flex gap="10">
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
                  <DropContainer
                    css={{
                      background: releaseArtwork
                        ? `url(${releaseArtwork})`
                        : "transparent",

                      mb: "$15",
                    }}
                    hidden={!!releaseArtwork}
                    hovered={isDragActive}
                    size="3"
                    {...getRootProps()}
                  >
                    <input {...getInputProps()} />
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
                  </DropContainer>
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
            <TabsContent value="tracklist">Add tracklist</TabsContent>
            <TabsContent value="review">Review your changes</TabsContent>
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

            py: "$7",
          }}
        >
          {currentTab !== "details" && <Button variant="outline">Back</Button>}
          <Button
            onClick={handleNext}
            variant="solid"
            css={{ alignSelf: "end" }}
          >
            Next
          </Button>
        </Container>
      </Box>
    </Fullscreen>
  );
};
