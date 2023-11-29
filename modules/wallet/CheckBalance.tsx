import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/ui/Dialog";
import { Flex } from "@/ui/Flex";
import { IconButton } from "@/ui/IconButton";
import { Typography } from "@/ui/Typography";
import { Box } from "@/ui/Box";
import { getArBalance } from "@/lib/arweave";
import { MutableRefObject, useCallback } from "react";
import { RxCheck, RxCross2, RxReload } from "react-icons/rx";
import { useConnect } from "@/hooks/useConnect";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "Zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { styled } from "@/stitches.config";
import { abbreviateAddress } from "@/utils";
import { Button } from "@/ui/Button";
import { getTurboBalance } from "@/lib/turbo";
import { BigNumber } from "bignumber.js";
import { LoadingSpinner } from "@/ui/Loader";

interface CheckBalanceDialogProps {
  modal: boolean;
  open: boolean;
  onClose: () => void;
  dropdownTriggerRef: MutableRefObject<HTMLButtonElement | null>;
}

export const CheckBalanceDialog = ({
  modal,
  open,
  onClose,
  dropdownTriggerRef,
}: CheckBalanceDialogProps) => {
  const { walletAddress } = useConnect();

  const {
    data: arBalance,
    isLoading: arBalanceLoading,
    isError: arBalanceError,
  } = useQuery({
    queryKey: [`AR-balance-${walletAddress}`],
    enabled: !!walletAddress,
    queryFn: () => {
      if (!walletAddress) {
        return;
      }

      return getArBalance(walletAddress);
    },
  });

  const turboBalance = useMutation({
    mutationFn: getTurboBalance,
    mutationKey: ["turboBalance"],
    onError: (error) => {
      console.error(error);
      // toast.error("Error getting balance");
    },
  });

  const formatCredits = (winc: string) => {
    const credits = new BigNumber(winc);

    const formattedCredits = credits.dividedBy(1e12).toFixed(4);

    return formattedCredits;
  };

  return (
    <Dialog modal={modal} open={open} onOpenChange={onClose}>
      <DialogContent
        onCloseAutoFocus={(event) => {
          // focus dropdown trigger for accessibility so user doesn't lose their place in the document
          dropdownTriggerRef.current?.focus();
          event.preventDefault();
        }}
        css={
          {
            // minHeight: 450,
          }
        }
      >
        <Flex css={{ pb: "$5" }} justify="between" align="center">
          <DialogTitle asChild>
            <Typography contrast="hi" size="4" weight="5">
              Check Balance
            </Typography>
          </DialogTitle>
          <DialogClose pos="relative" asChild>
            <IconButton css={{ br: "$round" }}>
              <RxCross2 />
            </IconButton>
          </DialogClose>
        </Flex>
        <Box
          css={{ height: 1, backgroundColor: "$slate5", mb: "$5", mx: "-$5" }}
        />
        <Flex direction="column" gap="10">
          <Flex direction="column" gap="1">
            <Typography size="1">AR balance:</Typography>
            {arBalanceError ||
              (arBalanceLoading && (
                <Typography size="5" contrast="hi">
                  -
                </Typography>
              ))}
            {arBalance && (
              <Typography size="5" contrast="hi">
                {arBalance.toString()}
                <Box css={{ color: "$slate11" }} as="span">
                  {" "}
                  AR
                </Box>
              </Typography>
            )}
          </Flex>
          <Flex direction="column" gap="3">
            <Typography size="1">Turbo credits:</Typography>
            {turboBalance.isLoading && (
              <Flex align="center" gap="2">
                <LoadingSpinner />
                <Typography>Fetching balance...</Typography>
              </Flex>
            )}
            {turboBalance.isSuccess && (
              <>
                <Typography size="5" contrast="hi">
                  {formatCredits(turboBalance.data.winc)}
                  <Box css={{ color: "$slate11" }} as="span">
                    {" "}
                    Credits
                  </Box>
                </Typography>
              </>
            )}
            {turboBalance.isIdle && (
              <Button
                size="1"
                onClick={() => turboBalance.mutate()}
                disabled={turboBalance.isLoading}
                css={{ alignSelf: "start" }}
                variant="solid"
              >
                {turboBalance.isLoading
                  ? "Fetching balance..."
                  : "Check Credits"}
              </Button>
            )}
            {turboBalance.isError && (
              <>
                {turboBalance.error instanceof Error &&
                turboBalance.error.message.includes("User") ? (
                  <Typography size="5" contrast="hi">
                    0
                    <Box css={{ color: "$slate11" }} as="span">
                      {" "}
                      Credits
                    </Box>
                  </Typography>
                ) : (
                  <Flex align="center" gap="2">
                    <Typography size="2" css={{ color: "$red11" }}>
                      Error occurred getting balance.
                    </Typography>
                    <Button
                      onClick={() => turboBalance.mutate()}
                      disabled={turboBalance.isLoading}
                      size="1"
                      variant="solid"
                    >
                      <RxReload />
                      Retry
                    </Button>
                  </Flex>
                )}
              </>
            )}
          </Flex>
        </Flex>
      </DialogContent>
    </Dialog>
  );
};
