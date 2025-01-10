import React from "react"
// @ts-ignore
import { ReactComponent as CloseSVG } from "../../assets/svg/close.svg"
import "./Modal.css"
import useIsMobile from "../../hooks/useIsMobile.ts"
import Spacer from "../global/Spacer.tsx"

interface Props {
    children: React.ReactNode
    onClose: () => void
    hideOverlay?: boolean
}
const Modal = ({ children, onClose, hideOverlay = false }: Props) => {
    const isMobile = useIsMobile()

    return (
        <>
            {!hideOverlay && (
                <div className="modal-overlay" onClick={onClose} />
            )}
            <div className="modal-container">
                <div className="modal-content">
                    <CloseSVG className="modal-close" onClick={onClose} />
                    {children}
                    {isMobile && <Spacer size="50px" />}
                </div>
            </div>
        </>
    )
}

export default Modal
