import React from "react"
import Modal from "../modal/Modal"
import { useModalNavigation } from "../../hooks/useModalNavigation"
import { ContentCluster } from "../global/ContentCluster"
import GenericToolbar from "../global/GenericToolbar"
import { DEFAULT_FRIENDS_PANEL_WIDTH } from "./friendsPanel"

interface Props {
    handleClosePanel: () => void
    reloadFriends: () => void
}

const FriendsToolbar = ({ reloadFriends, handleClosePanel }: Props) => {
    const {
        isModalOpen: showSettingsModal,
        openModal: handleOpenModal,
        closeModal: handleCloseModal,
    } = useModalNavigation()

    const settingModalContent = (
        <ContentCluster title="Settings!" hideLink>
            :D
        </ContentCluster>
    )

    return (
        <>
            {showSettingsModal && (
                <Modal
                    onClose={handleCloseModal}
                    fullScreenOnMobile
                    freezeBodyScroll
                >
                    {settingModalContent}
                </Modal>
            )}
            <GenericToolbar
                handleReload={() => {
                    reloadFriends()
                }}
                handleOpenSettingsModal={handleOpenModal}
                panelWidth={DEFAULT_FRIENDS_PANEL_WIDTH}
                linkDestination="/friends"
                isSecondaryPanel={true}
                handleClosePanel={handleClosePanel}
                hideFullScreenButton
            />
        </>
    )
}

export default FriendsToolbar
