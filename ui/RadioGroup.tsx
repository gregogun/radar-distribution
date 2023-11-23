import { styled } from "@/stitches.config";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

export const RadioGroup = styled(RadioGroupPrimitive.Root, {
  display: "flex",
  flexDirection: "column",

  variants: {
    gap: {
      1: {
        gap: "$1",
      },
      2: {
        gap: "$2",
      },
      3: {
        gap: "$3",
      },
      4: {
        gap: "$4",
      },
      5: {
        gap: "$5",
      },
      6: {
        gap: "$6",
      },
      7: {
        gap: "$7",
      },
      8: {
        gap: "$8",
      },
      9: {
        gap: "$9",
      },
      10: {
        gap: "$10",
      },
      20: {
        gap: "$20",
      },
    },
  },
});

export const RadioItem = styled(RadioGroupPrimitive.Item, {
  // resets
  all: "unset",

  //custom
  br: "$round",

  $$inactiveBorder: "$colors$slate7",
  $$inactiveBorderHover: "$colors$slate8",
  $$activeBorder: "$colors$blue9",
  $$activeBorderHover: "$colors$blue10",

  $$inactiveBackground: "$colors$slate3",
  $$inactiveBackgroundHover: "$colors$slate3",
  $$activeBackground: "$colors$blue9",
  $$activeColor: "white",

  variants: {
    variant: {
      outline: {
        bg: "transparent",
        boxShadow: "0 0 0 1px $$inactiveBorder",
        color: "$$activeBorder",

        "&:hover": {
          boxShadow: "0 0 0 1px $$inactiveBorderHover",
        },

        '&[aria-checked="true"]': {
          boxShadow: "0 0 0 1px $$activeBorder",
          $$activeBorderHover: "$colors$blue10",
        },
      },
      solid: {
        bg: "$$background",
        boxShadow: "0 0 0 1px $$inactiveBorder",
        color: "$$activeColor",

        "&:hover": {
          bg: "$$backgroundHover",
          boxShadow: "0 0 0 1px $$inactiveBorderHover",
        },

        '&[aria-checked="true"]': {
          bg: "$$activeBackground",
          boxShadow: "0 0 0 1px $$activeBorder",
        },
      },
    },
    size: {
      1: {
        boxSize: "$3",
      },
      2: {
        boxSize: "$4",
      },
      3: {
        boxSize: "$5",
      },
    },
  },

  defaultVariants: {
    variant: "solid",
    size: "2",
  },
});

export const RadioIndicator = styled(RadioGroupPrimitive.Indicator, {
  display: "grid",
  placeItems: "center",
  width: "100%",
  height: "100%",
  position: "relative",
  "&::after": {
    content: '""',
    display: "block",
    br: "$round",
    bg: "currentColor",
    boxSize: "50%",
  },

  variants: {
    indicatorSize: {
      1: {
        "&::after": {
          boxSize: "40%",
        },
      },
      2: {
        "&::after": {
          boxSize: "50%",
        },
      },
      3: {
        "&::after": {
          boxSize: "60%",
        },
      },
    },
  },

  defaultVariants: {
    indicatorSize: "2",
  },
});

// export interface RadioProps extends StyledRadioProps, Pick<StyledIndicatorProps, 'indicatorSize'> {
//   children: React.ReactNode;
// }

// export const Radio = forwardRef<HTMLButtonElement, RadioProps>(
//   (
//     { children, id, disabled, value, checked, indicatorSize, css, ...rest },
//     ref
//   ) => {
//     return (
//       <Flex as="span" gap="2" align="center">
//         <StyledRadio
//           css={{
//             $$activeBorder: `$colors$${colorScheme}9`,
//             $$activeBorderHover: `$colors$${colorScheme}10`,

//             $$inactiveBackground: '$colors$slate3',
//             $$inactiveBackgroundHover: '$colors$slate3',
//             $$activeBackground:
//               colorScheme === 'slate' ? '$colors$slate12' : `$colors$${colorScheme}9`,
//             $$activeColor:
//               colorScheme === 'slate' ? '$colors$slate1' : getContrastingColor(colorScheme),
//             ...css,
//           }}
//           ref={ref}
//           id={id}
//           value={value}
//           {...rest}
//         >
//           <StyledIndicator indicatorSize={indicatorSize} />
//         </StyledRadio>
//         <Label htmlFor={id}>{children}</Label>
//       </Flex>
//     );
//   }
// );
