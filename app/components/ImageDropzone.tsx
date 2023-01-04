import type { DropzoneProps } from "@mantine/dropzone";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import ImageUploadIcon from "./ImageUploadIcon";
import type { MantineTheme } from "@mantine/core";
import { Input } from "@mantine/core";
import { ActionIcon, Group, Image, Text, useMantineTheme } from "@mantine/core";
import { useEffect } from "react";
import { IconX } from "@tabler/icons";

type ImageDropzoneProps = Omit<DropzoneProps, "children"> & {
  src?: string | null;
  onClear: () => void;
};
export default function ImageDropzone({
  src,
  onClear,
  onDrop,
  ...props
}: ImageDropzoneProps) {
  const theme = useMantineTheme();

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!event.clipboardData) {
        return;
      }
      for (const item of event.clipboardData.items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (!file) {
            continue;
          }
          onDrop([file]);
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [onDrop]);

  return (
    <Input.Wrapper
      label="Screenshot"
      sx={() => ({
        position: "relative",
      })}
    >
      <Dropzone
        accept={IMAGE_MIME_TYPE}
        multiple={false}
        onDrop={onDrop}
        {...props}
      >
        <Group
          position="center"
          spacing="xl"
          style={{ minHeight: 220, pointerEvents: "none" }}
        >
          {src ? (
            <Image src={src} alt="" />
          ) : (
            <>
              <Dropzone.Accept>
                <ImageUploadIcon
                  status="accepted"
                  style={{
                    width: 80,
                    height: 80,
                    color: getIconColor("accepted", theme),
                  }}
                />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <ImageUploadIcon
                  status="rejected"
                  style={{
                    width: 80,
                    height: 80,
                    color: getIconColor("rejected", theme),
                  }}
                />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <ImageUploadIcon
                  status="idle"
                  style={{
                    width: 80,
                    height: 80,
                    color: getIconColor("idle", theme),
                  }}
                />
              </Dropzone.Idle>
              <div>
                <Text size="xl" inline>
                  Paste, drag image here or click to select file
                </Text>
                <Text size="sm" color="dimmed" inline mt={7}>
                  The image should not exceed 5mb
                </Text>
              </div>
            </>
          )}
        </Group>
      </Dropzone>
      {src && (
        <ActionIcon
          onClick={onClear}
          sx={() => ({
            position: "absolute",
            top: 0,
            right: 0,
          })}
        >
          <IconX />
        </ActionIcon>
      )}
    </Input.Wrapper>
  );
}

function getIconColor(
  status: "accepted" | "rejected" | "idle",
  theme: MantineTheme
) {
  return status === "accepted"
    ? theme.colors[theme.primaryColor][6]
    : status === "rejected"
    ? theme.colors.red[6]
    : theme.colorScheme === "dark"
    ? theme.colors.dark[0]
    : theme.black;
}
