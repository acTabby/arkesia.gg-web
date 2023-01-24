import { ActionIcon, CheckIcon } from "@mantine/core";

type AcceptActionProps = {
  disabled: boolean;
  ariaLabel: string;
};
const AcceptAction = ({ disabled, ariaLabel }: AcceptActionProps) => {
  return (
    <ActionIcon
      size="xs"
      disabled={disabled}
      variant="transparent"
      color="green"
      aria-label={ariaLabel}
      type="submit"
    >
      <CheckIcon width="100%" height="100%" />
    </ActionIcon>
  );
};

export default AcceptAction;
