import React from "react"
import Button from "../global/Button.tsx"
import Modal from "./Modal.tsx"
import Stack from "../global/Stack.tsx"
import { ContentCluster } from "../global/ContentCluster.tsx"

interface Props {
    title: string
    text: string
    onYes: () => void
    onNo: () => void
    fullScreenOnMobile?: boolean
}

const YesNoModal = ({
    title,
    text,
    onYes,
    onNo,
    fullScreenOnMobile = false,
}: Props) => {
    const content = (
        <ContentCluster title={title}>
            <p>{text}</p>
            <Stack direction="row" gap="10px">
                <Button onClick={onYes}>Yes</Button>
                <Button onClick={onNo}>No</Button>
            </Stack>
        </ContentCluster>
    )

    return (
        <Modal onClose={onNo} fullScreenOnMobile={fullScreenOnMobile}>
            {content}
        </Modal>
    )
}

export default YesNoModal
