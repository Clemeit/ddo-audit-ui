import React from "react"
import Stack from "../global/Stack"
import FriendsCanvas from "./FriendsCanvas"
import FriendsToolbar from "./FriendsToolbar"

interface Props {
    handleClosePanel: () => void
}

const FriendsCanvasContainer = ({ handleClosePanel }: Props) => {
    const reloadFriends = () => {}

    return (
        <Stack direction="column">
            <FriendsToolbar
                handleClosePanel={handleClosePanel}
                reloadFriends={reloadFriends}
            />
            <FriendsCanvas />
        </Stack>
    )
}

export default FriendsCanvasContainer
