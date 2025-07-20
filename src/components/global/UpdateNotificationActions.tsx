import Button from "./Button"
import Stack from "./Stack"

interface UpdateNotificationActionsProps {
    onRefresh: () => void
    onDismiss: () => void
}

export const UpdateNotificationActions = ({
    onRefresh,
    onDismiss,
}: UpdateNotificationActionsProps) => {
    return (
        <Stack direction="row" gap="8px">
            <Button onClick={onRefresh}>Refresh</Button>
            <Button onClick={onDismiss} type="secondary">
                Later
            </Button>
        </Stack>
    )
}
