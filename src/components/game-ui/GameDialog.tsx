import { KeyboardEvent, ReactNode, useEffect, useId, useRef } from "react"
import { createPortal } from "react-dom"
import GameWindow from "./GameWindow.tsx"
import "./gameUi.css"

interface Props {
    title: string
    children: ReactNode
    onClose: () => void
    className?: string
}

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * A smaller game window over a dimmed page. Escape, the X and a click outside close it.
 * Focus stays inside while it is open and goes back where it was when it closes.
 */
const GameDialog = ({ title, children, onClose, className }: Props) => {
    const titleId = useId()
    const dialogRef = useRef<HTMLDivElement>(null)
    const onCloseRef = useRef(onClose)
    onCloseRef.current = onClose

    useEffect(() => {
        const opener = document.activeElement as HTMLElement | null
        const body = document.body
        const overflow = body.style.overflow
        body.style.overflow = "hidden"
        dialogRef.current?.focus()
        // Escape anywhere closes the dialog first (and nothing else, such as full screen)
        const onKeyDown = (e: globalThis.KeyboardEvent) => {
            if (e.key !== "Escape" || e.defaultPrevented) return
            e.preventDefault()
            e.stopPropagation()
            onCloseRef.current()
        }
        window.addEventListener("keydown", onKeyDown, true)
        return () => {
            window.removeEventListener("keydown", onKeyDown, true)
            body.style.overflow = overflow
            if (opener && document.contains(opener)) opener.focus()
        }
    }, [])

    // Tab and Shift+Tab wrap around inside the dialog
    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== "Tab" || !dialogRef.current) return
        const items = Array.from(
            dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
        ).filter((el) => el.offsetParent !== null)
        if (items.length === 0) {
            e.preventDefault()
            return
        }
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement
        if (e.shiftKey && (active === first || active === dialogRef.current)) {
            e.preventDefault()
            last.focus()
        } else if (!e.shiftKey && active === last) {
            e.preventDefault()
            first.focus()
        }
    }

    return createPortal(
        <div
            className="gw-dialog-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div
                ref={dialogRef}
                className={`gw-dialog${className ? ` ${className}` : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                onKeyDown={onKeyDown}
            >
                <GameWindow
                    title={title}
                    titleId={titleId}
                    onClose={onClose}
                    resizable={false}
                >
                    {children}
                </GameWindow>
            </div>
        </div>,
        document.body
    )
}

export default GameDialog
