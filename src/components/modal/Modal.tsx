import React, { useEffect, useRef } from "react"
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
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Prevent body scroll when modal is open
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        // Ensure modal gets focus after render
        if (modalRef.current) {
            modalRef.current.focus()
        }

        return () => {
            document.body.style.overflow = originalOverflow
        }
    }, [])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onClose()
        }
    }

    return (
        <>
            {!hideOverlay && (
                <div className="modal-overlay" onClick={onClose} />
            )}
            <div
                className={`modal-container ${centeredContent ? "centered-content" : ""} ${fullScreenOnMobile ? "full-screen-on-mobile" : ""}`}
                onKeyDown={handleKeyDown}
                tabIndex={-1}
                ref={modalRef}
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
