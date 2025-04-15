import React, { useEffect } from "react"
import { ReactComponent as CloseSVG } from "../../assets/svg/close.svg"
import "./Modal.css"
import useIsMobile from "../../hooks/useIsMobile.ts"

interface Props {
    children: React.ReactNode
    onClose: () => void
    hideOverlay?: boolean
    centeredContent?: boolean
    maxWidth?: string
    fullScreenOnMobile?: boolean
}
const Modal = ({
    children,
    onClose,
    hideOverlay = false,
    centeredContent = false,
    maxWidth = "400px",
    fullScreenOnMobile = false,
}: Props) => {
    useEffect(() => {
        // event listener for closing modal on escape key press
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }
        document.body.style.overflowY = "hidden"
        document.addEventListener("keydown", handleKeyDown)
        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.body.style.overflowY = "scroll"
        }
    }, [])

    return (
        <>
            {!hideOverlay && (
                <div className="modal-overlay" onClick={onClose} />
            )}
            <div
                className={`modal-container ${centeredContent ? "centered-content" : ""} ${fullScreenOnMobile ? "full-screen-on-mobile" : ""}`}
                style={{ maxWidth }}
            >
                <div
                    className={`modal-content ${centeredContent ? "centered-content" : ""}`}
                >
                    <div className="modal-close-container" onClick={onClose}>
                        <CloseSVG className="modal-close" />
                    </div>
                    {children}
                </div>
            </div>
        </>
    )
}

export default Modal
