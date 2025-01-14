import React, { useMemo } from "react"
import GroupingContainer from "./LfmCanvasContainer.tsx"
import Page from "../global/Page.tsx"
import { useThemeContext } from "../../contexts/ThemeContext.tsx"
import Spacer from "../global/Spacer.tsx"
import useGetCurrentServer from "../../hooks/useGetCurrentServer.ts"
import Modal from "../modal/Modal.tsx"
import Button from "../global/Button.tsx"
import Stack from "../global/Stack.tsx"
import { VIP_SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import Badge from "../global/Badge.tsx"
import { DONATE_LINK } from "../../constants/client.ts"

const GroupingSpecific = () => {
    // get server name from path, like /grouping/thelanis or /grouping/ghallanda:
    const {
        serverNameLowercase,
        serverNamePossessiveCase,
        serverNameSentenceCase,
    } = useGetCurrentServer()
    const { isFullScreen } = useThemeContext()

    const dismissedVipModal = useMemo(
        () => localStorage.getItem("dismissed-vip-modal"),
        [serverNameLowercase]
    )

    const [showVipModal, setShowVipModal] = React.useState(
        VIP_SERVER_NAMES_LOWER.includes(serverNameLowercase) &&
            !dismissedVipModal
    )

    const handleDismissVipModal = () => {
        localStorage.setItem("dismissed-vip-modal", "true")
        setShowVipModal(false)
    }

    return (
        <Page
            title={`DDO Live LFM Viewer for ${serverNameSentenceCase}`}
            description={`Browse ${serverNamePossessiveCase} LFMs! Check the LFM panel before you login, or set up notifications and never miss raid night again!`}
            centered
            noPadding
            contentMaxWidth
        >
            {showVipModal && (
                <Modal onClose={handleDismissVipModal}>
                    <h3 style={{ marginTop: "0px" }}>
                        <Badge text="VIP" backgroundColor="var(--orange4)" />{" "}
                        Server
                    </h3>
                    <p>
                        Cormyr is a VIP server, and providing it has increased
                        hosting fees.
                    </p>
                    <p>
                        If you find this service useful, please consider{" "}
                        <a
                            href={DONATE_LINK}
                            target="_blank"
                            onClick={handleDismissVipModal}
                        >
                            donating
                        </a>
                        .
                    </p>
                    <Stack direction="row" fullWidth justify="flex-end">
                        <Button onClick={handleDismissVipModal}>Ok</Button>
                    </Stack>
                </Modal>
            )}
            {!isFullScreen && <Spacer className="hide-on-mobile" size="20px" />}
            <GroupingContainer
                serverName={serverNameLowercase ? serverNameLowercase : ""}
            />
        </Page>
    )
}

export default GroupingSpecific
