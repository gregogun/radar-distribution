import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/ui/Dialog";
import { Flex } from "@/ui/Flex";
import { IconButton } from "@/ui/IconButton";
import { Typography } from "@/ui/Typography";
import { Box } from "@/ui/Box";
import { getArBalance } from "@/lib/arweave";
import { RxCross2 } from "react-icons/rx";

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
}

export const UploadDialog = ({ open, onClose }: UploadDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Flex css={{ pb: "$5" }} justify="between" align="center">
          <DialogTitle asChild>
            <Typography contrast="hi" size="4" weight="5">
              Confirm & Upload
            </Typography>
          </DialogTitle>
          <DialogClose pos="relative" asChild>
            <IconButton css={{ br: "$round" }}>
              <RxCross2 />
            </IconButton>
          </DialogClose>
        </Flex>
      </DialogContent>
    </Dialog>
  );
};
