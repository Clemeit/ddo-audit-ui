import React from "react"
import Button from "../global/Button.tsx"
import Modal from "./Modal.tsx"
import Stack from "../global/Stack.tsx"
import { ContentCluster } from "../global/ContentCluster.tsx"

interface Props {
    title: string
    text?: string
    onYes: () => void
    onNo: () => void
    fullScreenOnMobile?: boolean
    children?: React.ReactNode
}

const YesNoModal = ({
    title,
    text,
    onYes,
    onNo,
    fullScreenOnMobile = false,
    children,
}: Props) => {
    const content = (
        <ContentCluster title={title}>
            {text && <p>{text}</p>}
            {children}
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
