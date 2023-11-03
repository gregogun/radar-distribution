import { styled } from "@/stitches.config";
import { Flex } from "./Flex";

const FormHelperErrorText = styled("p", {
  fontSize: "$1",
  lineHeight: "$2",
  color: "$red11",
  m: 0,
  mt: "$1",
  position: "absolute",
  bottom: 0,
});

export const FormHelperError = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <FormHelperErrorText role="alert" aria-live="polite">
    {children}
  </FormHelperErrorText>
);

export const FormHelperText = styled("p", {
  fontSize: "$1",
  lineHeight: "$2",
  m: 0,
  mt: "$1",
  position: "absolute",
  bottom: 0,
});

export const FormRow = styled(Flex, {
  gap: "$3",
  mt: "$5",
  pb: "$7",
  position: "relative",

  defaultVariants: {
    direction: "column",
  },

  "& span": {
    color: "$slate12",
  },
});
