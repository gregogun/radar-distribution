import { Button } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { styled } from "@/stitches.config";
import { Link, useLocation } from "react-router-dom";
import { Image } from "@/ui/Image";
import { HeaderDropdown } from "./HeaderDropdown";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { ConnectWallet } from "../wallet/ConnectWallet";
import { useConnect } from "@/hooks/useConnect";
import { IconButton } from "@/ui/IconButton";
import { BsSun } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import { getAccount } from "@/lib/account/api";
import { appConfig } from "@/appConfig";

const NavLink = styled(Link, {
  display: "flex",
  gap: "$2",
  fontSize: "$3",
  alignItems: "center",
  p: "$2",
  color: "$slate11",

  "&:hover": {
    color: "$slate12",
  },

  variants: {
    selected: {
      true: {
        color: "$slate12",
      },
    },
  },
});

export const AppHeader = () => {
  const { walletAddress, connecting } = useConnect();
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    resolvedTheme === "dark" ? setTheme("light") : setTheme("dark");
  };

  let src;

  switch (resolvedTheme) {
    case "dark":
      src = "arcadia_logo_text_white.svg";
      break;
    default:
      src = "arcadia_logo_text_black.svg";
      break;
  }

  return (
    <Flex
      as="header"
      css={{
        // display: "grid",
        // gridTemplateColumns: "1fr 1fr 1fr",
        display: "flex",
        justifyContent: "space-between",
        py: "$3",
        px: "$10",
        mb: location.pathname === "/profile" ? 0 : "$10",
      }}
      justify="between"
      align="center"
    >
      <Flex gap="10" align="center">
        <Link
          to={{
            pathname: "/",
          }}
        >
          {/* <Image
            src={src}
            css={{
              width: 94,
              height: 17,
            }}
          /> */}
          Radar
        </Link>
      </Flex>

      <Flex align="center" justify="end" gap="2">
        <IconButton
          css={{
            backgroundColor: "transparent",

            "&:hover": {
              backgroundColor: "transparent",
              color: "$slate12",
            },
            "&:active": {
              backgroundColor: "transparent",
            },
          }}
          onClick={toggleTheme}
        >
          <BsSun />
        </IconButton>
        {walletAddress ? (
          <HeaderDropdown walletAddress={walletAddress} />
        ) : (
          <ConnectWallet
            permissions={[
              "ACCESS_ADDRESS",
              "DISPATCH",
              "SIGN_TRANSACTION",
              "ACCESS_ARWEAVE_CONFIG",
              "ACCESS_PUBLIC_KEY",
              "SIGNATURE",
            ]}
            options={{
              connectButtonVariant: "ghost",
              connectButtonLabel: "connect wallet",
              connectButtonStyles: {
                "&:hover": {
                  backgroundColor: "transparent",
                  color: "$slate12",
                },
              },
            }}
            providers={{
              arconnect: true,
              arweaveApp: false,
            }}
            appName="Radar"
          >
            <Button
              css={{
                fontWeight: 400,
                fontSize: "$3",
              }}
              variant="transparent"
            >
              {connecting ? "connecting..." : "connect wallet"}
            </Button>
          </ConnectWallet>
        )}
      </Flex>
    </Flex>
  );
};
