import React, { useEffect } from "react"

const TempCanvas = () => {
    const mainCanvasRef = React.useRef<HTMLCanvasElement>(null)
    const backBufferCanvasRef = React.useRef<HTMLCanvasElement>(
        document.createElement("canvas")
    )
    const panelWidthRef = React.useRef(800)
    const panelHeightRef = React.useRef(600)

    // useEffect(() => {
    //     mainCanvasRef.current.width = panelWidthRef.current
    //     mainCanvasRef.current.height = panelHeightRef.current
    //     mainCanvasRef.current.width = panelWidthRef.current
    //     mainCanvasRef.current.height = panelHeightRef.current
    // }, [panelWidthRef.current, panelHeightRef.current])

    const drawRandomRectangle = (context: CanvasRenderingContext2D) => {
        const x = Math.random() * panelWidthRef.current
        const y = Math.random() * panelHeightRef.current
        const width = Math.random() * 100 + 50 // Width between 50 and 150
        const height = Math.random() * 100 + 50 // Height between 50 and 150
        context.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
        context.fillRect(x, y, width, height)
    }

    const expandCanvasWithoutFlicker = () => {
        if (panelHeightRef.current >= 800) {
            panelHeightRef.current = 600
        } else {
            panelHeightRef.current = panelHeightRef.current + 5
        }

        // Resize the back buffer canvas to match the new panel height
        // Copy the mainCanvasRef to the backBufferCanvasRef
        backBufferCanvasRef.current.width = panelWidthRef.current
        backBufferCanvasRef.current.height = panelHeightRef.current
        const backBufferContext = backBufferCanvasRef.current.getContext("2d")
        if (backBufferContext) {
            backBufferContext.clearRect(
                0,
                0,
                panelWidthRef.current,
                panelHeightRef.current
            )
            const mainContext = mainCanvasRef.current?.getContext("2d")
            if (mainContext) {
                backBufferContext.drawImage(mainCanvasRef.current, 0, 0)
            }
        }

        if (mainCanvasRef.current) {
            mainCanvasRef.current.width = panelWidthRef.current
            mainCanvasRef.current.height = panelHeightRef.current
        }

        // Draw the back buffer canvas onto the main canvas
        if (backBufferCanvasRef.current) {
            const mainContext = mainCanvasRef.current?.getContext("2d")
            if (mainContext) {
                mainContext.clearRect(
                    0,
                    0,
                    panelWidthRef.current,
                    panelHeightRef.current
                )
                mainContext.drawImage(backBufferCanvasRef.current, 0, 0)
            }
        }
    }

    useEffect(() => {
        const resizeInterval = setInterval(() => {
            if (mainCanvasRef.current) {
                expandCanvasWithoutFlicker()
            }
            drawRandomRectangle(backBufferCanvasRef.current?.getContext("2d"))
            if (mainCanvasRef.current) {
                const context = mainCanvasRef.current.getContext("2d")
                if (context) {
                    context.clearRect(
                        0,
                        0,
                        panelWidthRef.current,
                        panelHeightRef.current
                    )
                    context.drawImage(backBufferCanvasRef.current, 0, 0)
                }
            }
        }, 100)

        return () => clearInterval(resizeInterval)
    }, [])

    return (
        <canvas
            ref={mainCanvasRef}
            id="lfm-canvas"
            width={panelWidthRef.current}
            height={panelHeightRef.current}
            style={{
                backgroundColor: "white",
            }}
        />
    )
}

export default TempCanvas
