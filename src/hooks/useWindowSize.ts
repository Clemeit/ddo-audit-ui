import { useState, useEffect } from "react"

const useWindowSize = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const [isSmallWeb, setIsSmallWeb] = useState(
        window.innerWidth <= 1000 && window.innerWidth > 768
    )

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
            setIsSmallWeb(window.innerWidth <= 1000 && window.innerWidth > 768)
        }

        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    return { isMobile, isSmallWeb }
}

export default useWindowSize
