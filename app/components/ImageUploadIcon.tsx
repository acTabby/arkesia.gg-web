import type { TablerIconProps } from "@tabler/icons";
import { IconCircleX, IconPhoto, IconUpload } from "@tabler/icons";

type ImageUploadIconProps = {
  status: "accepted" | "rejected" | "idle";
} & TablerIconProps;

export default function ImageUploadIcon({
  status,
  ...props
}: ImageUploadIconProps) {
  if (status === "accepted") {
    return <IconUpload {...props} />;
  }

  if (status === "rejected") {
    return <IconCircleX {...props} />;
  }

  return <IconPhoto {...props} />;
}
