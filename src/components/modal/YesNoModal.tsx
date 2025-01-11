import React from "react"
import Button from "../global/Button.tsx"
import Modal from "./Modal.tsx"
import Stack from "../global/Stack.tsx"
import ContentCluster from "../global/ContentCluster.tsx"

interface Props {
    title: string
    text: string
    onYes: () => void
    onNo: () => void
}

const YesNoModal = ({ title, text, onYes, onNo }: Props) => {
    const content = (
        <ContentCluster title={title}>
            <p>{text}</p>
            <Stack direction="row" gap="10px">
                <Button text="Yes" onClick={onYes} />
                <Button text="No" onClick={onNo} />
            </Stack>
        </ContentCluster>
    )

    return <Modal onClose={onNo}>{content}</Modal>
}

export default YesNoModal
