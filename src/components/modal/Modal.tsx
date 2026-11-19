import React, { useEffect, useRef } from "react"
import { ReactComponent as CloseSVG } from "../../assets/svg/close.svg"
import "./Modal.css"

interface Props {
    children: React.ReactNode
    onClose: () => void
    hideOverlay?: boolean
    centeredContent?: boolean
    maxWidth?: string
    fullScreenOnMobile?: boolean
    freezeBodyScroll?: boolean
    ariaLabel?: string
    className?: string
}
const Modal = ({
    children,
    onClose,
    hideOverlay = false,
    centeredContent = false,
    maxWidth,
    fullScreenOnMobile = false,
    freezeBodyScroll = false,
    ariaLabel,
    className = "",
}: Props) => {
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Prevent body scroll when modal is open
        const originalOverflow = document.body.style.overflow
        if (freezeBodyScroll) document.body.style.overflow = "hidden"

        // Ensure modal gets focus after render
        if (modalRef.current) {
            modalRef.current.focus()
        }

        return () => {
            if (freezeBodyScroll)
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
                className={`modal-container ${centeredContent ? "centered-content" : ""} ${fullScreenOnMobile ? "full-screen-on-mobile" : ""} ${className}`}
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel}
                style={maxWidth ? { maxWidth, width: "100%" } : undefined}
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
