import {
    KeyboardEvent,
    PointerEvent as ReactPointerEvent,
    ReactNode,
    useRef,
    useState,
} from "react"
import "./gameUi.css"

interface Props {
    title: string
    children: ReactNode
    // The window always fills its container's width; only the height changes.
    // Leave it out to size the window with CSS.
    height?: number
    minHeight?: number
    maxHeight?: number
    // The title's element id, for aria-labelledby on a surrounding dialog
    titleId?: string
    // Called while dragging the grip (commit=false) and once when it is released (commit=true)
    onResize?: (height: number, commit: boolean) => void
    // Double-clicking the grip: go back to the automatic height
    onResetSize?: () => void
    onClose?: () => void
    closeLabel?: string
    // A button beside the close button that toggles full screen
    isFullScreen?: boolean
    onToggleFullScreen?: () => void
    className?: string
    resizable?: boolean
}

// Four corner brackets pointing out (enter) or in (exit). Drawn here, not taken from anywhere.
const FullScreenIcon = ({ exit }: { exit: boolean }) => (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <path
            d={
                exit
                    ? "M4 1 V4 H1 M8 1 V4 H11 M4 11 V8 H1 M8 11 V8 H11"
                    : "M1 4 V1 H4 M8 1 H11 V4 M1 8 V11 H4 M11 8 V11 H8"
            }
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
        />
    </svg>
)

/**
 * A window in the style of a fantasy MMO: a red title bar with a plate, a stone frame with gold
 * edges, and an optional grip in the bottom-right corner that changes its height.
 */
const GameWindow = ({
    title,
    children,
    height,
    minHeight = 0,
    maxHeight = Infinity,
    titleId,
    onResize,
    onResetSize,
    onClose,
    closeLabel = "Close",
    isFullScreen = false,
    onToggleFullScreen,
    className,
    resizable = true,
}: Props) => {
    const drag = useRef<{ y: number; height: number } | null>(null)
    const [isResizing, setIsResizing] = useState(false)

    const clamp = (value: number) =>
        Math.round(Math.min(maxHeight, Math.max(minHeight, value)))

    const heightFromPointer = (e: ReactPointerEvent) => {
        const start = drag.current
        return start ? clamp(start.height + e.clientY - start.y) : null
    }

    const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
        if (e.button !== 0) return
        if (height == null) return
        drag.current = { y: e.clientY, height }
        e.currentTarget.setPointerCapture(e.pointerId)
        setIsResizing(true)
        e.preventDefault()
    }

    const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
        const next = heightFromPointer(e)
        if (next != null) onResize?.(next, false)
    }

    const onPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
        const next = heightFromPointer(e)
        const moved = next != null && next !== drag.current?.height
        drag.current = null
        setIsResizing(false)
        if (next != null && moved) onResize?.(next, true)
    }

    // Arrow keys on the focused grip change the height by 20px (Shift: 100px)
    const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
        if (!onResize || height == null) return
        const step = e.shiftKey ? 100 : 20
        if (e.key === "ArrowUp") onResize(clamp(height - step), true)
        else if (e.key === "ArrowDown") onResize(clamp(height + step), true)
        else if (e.key === "Home" || e.key === "Escape") onResetSize?.()
        else return
        e.preventDefault()
    }

    return (
        <section
            className={`gw${isResizing ? " is-resizing" : ""}${className ? ` ${className}` : ""}`}
            style={height == null ? undefined : { height: `${height}px` }}
            aria-label={titleId ? undefined : title}
        >
            <header
                className={`gw-titlebar${onToggleFullScreen ? " has-extra-button" : ""}`}
            >
                {/* Squared gold plates behind the bar's two rounded ends */}
                <span className="gw-title-end left" aria-hidden="true" />
                <span className="gw-title-end right" aria-hidden="true" />
                <div className="gw-title-plate">
                    <h2 className="gw-title" id={titleId}>
                        {title}
                    </h2>
                </div>
                {onToggleFullScreen && (
                    <button
                        type="button"
                        className="gw-close gw-fullscreen"
                        aria-label={
                            isFullScreen ? "Exit full screen" : "Full screen"
                        }
                        aria-pressed={isFullScreen}
                        title={
                            isFullScreen
                                ? "Exit full screen (Esc)"
                                : "Full screen"
                        }
                        onClick={onToggleFullScreen}
                    >
                        <FullScreenIcon exit={isFullScreen} />
                    </button>
                )}
                {onClose && (
                    <button
                        type="button"
                        className="gw-close"
                        aria-label={closeLabel}
                        title={closeLabel}
                        onClick={onClose}
                    >
                        X
                    </button>
                )}
            </header>
            <div className="gw-frame">
                <div className="gw-body">{children}</div>
            </div>
            {resizable && onResize && height != null && (
                <button
                    type="button"
                    className="gw-resize"
                    aria-label="Resize window height (arrow keys; Home to fit the screen)"
                    title="Drag to change the height. Double-click to fit the screen."
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onDoubleClick={onResetSize}
                    onKeyDown={onKeyDown}
                />
            )}
        </section>
    )
}

export default GameWindow
