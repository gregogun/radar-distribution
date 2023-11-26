import { abbreviateAddress, userPreferredGateway } from "../../utils";
import {
  RxChevronDown,
  RxChevronLeft,
  RxDotFilled,
  RxPencil2,
} from "react-icons/rx";
import { BsCurrencyDollar, BsPlug } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import { appConfig } from "../../appConfig";
import { ArAccount } from "arweave-account";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSubContent,
  DropdownMenuSubRoot,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/ui/Dropdown";
import { Button } from "@/ui/Button";
import { Avatar, AvatarImage } from "@/ui/Avatar";
import { Flex } from "@/ui/Flex";
import { Link } from "react-router-dom";
import { styled } from "@/stitches.config";
import { useConnect } from "@/hooks/useConnect";
import { PermaProfile } from "@/types";
import { FundNodeDialog } from "../wallet/FundNodeDialog";
import { useQuery } from "@tanstack/react-query";
import { getAccount } from "@/lib/account/api";

const StyledLink = styled(Link);

interface HeaderDropdownProps {
  walletAddress: string;
}

export const HeaderDropdown = ({ walletAddress }: HeaderDropdownProps) => {
  const { setState } = useConnect();
  // const [showFundNodeDialog, setShowFundNodeDialog] = useState(false);
  const [currentGateway, setCurrentGateway] = useState(
    userPreferredGateway || appConfig.defaultGateway
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openingDialog, setOpeningDialog] = useState(false);
  const [closingDialog, setClosingDialog] = useState(false);
  const dropdownItemRef = useRef<HTMLDivElement | null>(null);

  const { data: profile, isError } = useQuery({
    queryKey: [`profile-${walletAddress}`],
    queryFn: () => {
      if (!walletAddress) {
        throw new Error("No profile has been found");
      }

      return getAccount(walletAddress, { gateway: appConfig.defaultGateway });
    },
  });

  useEffect(() => {
    if (openingDialog) {
      if (!dropdownOpen) {
        setDialogOpen(true);
        setOpeningDialog(false);
      }
    }
    if (closingDialog) {
      if (dialogOpen) {
        setDialogOpen(false);
      }
      if (!dialogOpen) {
        setDropdownOpen(true);
      }
      if (dropdownOpen) {
        dropdownItemRef.current?.focus();
        setClosingDialog(false);
      }
    }
  }, [dropdownOpen, dialogOpen, openingDialog, closingDialog]);

  const handleGatewaySwitch = (gateway: string) => {
    const url = `https://${gateway}`;
    localStorage.setItem("gateway", url);
    setCurrentGateway(url);
  };

  const name =
    profile && profile.handle
      ? profile.handle
      : abbreviateAddress({ address: profile?.address || walletAddress });
  return (
    <>
      <DropdownMenuRoot
        modal={dropdownOpen}
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button
            css={{
              fontWeight: 400,
              "&:hover": {
                backgroundColor: "transparent",
                color: "$slate12",
              },
              "&:active": { backgroundColor: "transparent" },
            }}
            variant="ghost"
          >
            <Avatar size="1">
              <AvatarImage
                src={
                  profile && profile.avatar
                    ? profile.avatar
                    : `https://source.boringavatars.com/marble/40/${
                        profile?.address || walletAddress
                      }`
                }
              />
            </Avatar>
            {name}
            <RxChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            css={{
              minWidth: 200,

              '[role="menuitem"]': {
                py: "$3",
              },
            }}
            sideOffset={8}
            collisionPadding={8}
          >
            <DropdownMenuItem asChild>
              <Flex align="center" gap="2">
                <RxPencil2 />
                Edit Profile
              </Flex>
            </DropdownMenuItem>
            <DropdownMenuSubRoot>
              <DropdownMenuSubTrigger>
                <Flex align="center" gap="2">
                  <RxChevronLeft />
                  Wallet
                </Flex>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent
                  css={{
                    minWidth: 200,

                    '[role="menuitem"]': {
                      py: "$3",
                    },
                  }}
                  sideOffset={8}
                >
                  {/* <DropdownMenuItem>Check Balance</DropdownMenuItem> */}
                  <DropdownMenuItem
                    ref={dropdownItemRef}
                    onSelect={() => setOpeningDialog(true)}
                  >
                    Fund Irys Node
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSubRoot>

            <DropdownMenuItem
              onSelect={() => {
                window.arweaveWallet.disconnect().then(() => {
                  setState({ walletAddress: "" });
                });
              }}
            >
              <Flex align="center" gap="2">
                <BsPlug />
                Disconnect
              </Flex>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>

      <FundNodeDialog
        modal={dialogOpen}
        open={dialogOpen}
        onClose={() => setClosingDialog(true)}
      />
    </>
  );
};
