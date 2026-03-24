import { useCallback, useEffect, useRef, useState } from "react"

interface UseCanvasViewportProps {
    itemHeight: number
    itemCount: number
    headerHeight: number
    footerHeight?: number
    panelWidth: number
}

interface UseCanvasViewportReturn {
    scrollOffset: number
    viewportHeight: number
    totalLogicalHeight: number
    firstVisibleIndex: number
    lastVisibleIndex: number
    scrollContainerRef: React.RefObject<HTMLDivElement | null>
    canvasRef: React.RefObject<HTMLCanvasElement | null>
    canvasScaleWidth: number
    canvasScaleHeight: number
    requestRender: () => void
}

const useCanvasViewport = ({
    itemHeight,
    itemCount,
    headerHeight,
    footerHeight = 0,
    panelWidth,
}: UseCanvasViewportProps): UseCanvasViewportReturn => {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const scrollOffsetRef = useRef(0)
    const rafIdRef = useRef<number | null>(null)
    const [scrollOffset, setScrollOffset] = useState(0)
    const [viewportHeight, setViewportHeight] = useState(600)
    const [canvasScaleWidth, setCanvasScaleWidth] = useState(1)
    const [canvasScaleHeight, setCanvasScaleHeight] = useState(1)

    const totalLogicalHeight =
        headerHeight + itemCount * itemHeight + footerHeight

    // Calculate visible range
    const firstVisibleIndex = Math.max(
        0,
        Math.floor((scrollOffset - headerHeight) / itemHeight)
    )
    const lastVisibleIndex = Math.min(
        itemCount - 1,
        Math.ceil((scrollOffset + viewportHeight - headerHeight) / itemHeight)
    )

    // Trigger a re-render via state update
    const requestRender = useCallback(() => {
        if (rafIdRef.current !== null) return
        rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null
            setScrollOffset(scrollOffsetRef.current)
        })
    }, [])

    // Handle scroll events
    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        const handleScroll = () => {
            scrollOffsetRef.current = container.scrollTop
            requestRender()
        }

        container.addEventListener("scroll", handleScroll, { passive: true })
        return () => container.removeEventListener("scroll", handleScroll)
    }, [requestRender])

    // Measure viewport height from the scroll container
    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const height = entry.contentRect.height
                if (height > 0) {
                    setViewportHeight(height)
                }
            }
        })
        observer.observe(container)
        return () => observer.disconnect()
    }, [])

    // Measure canvas scale for hit-testing
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const handleResize = () => {
            const rect = canvas.getBoundingClientRect()
            if (rect.width > 0 && rect.height > 0) {
                setCanvasScaleWidth(canvas.width / rect.width)
                setCanvasScaleHeight(canvas.height / rect.height)
            }
        }

        const observer = new ResizeObserver(handleResize)
        observer.observe(canvas)
        handleResize()
        return () => observer.disconnect()
    }, [panelWidth, viewportHeight])

    // Clean up rAF on unmount
    useEffect(() => {
        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current)
            }
        }
    }, [])

    return {
        scrollOffset,
        viewportHeight,
        totalLogicalHeight,
        firstVisibleIndex,
        lastVisibleIndex,
        scrollContainerRef,
        canvasRef,
        canvasScaleWidth,
        canvasScaleHeight,
        requestRender,
    }
}

export default useCanvasViewport
