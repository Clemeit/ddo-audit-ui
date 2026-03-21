import { useState, useEffect } from "react"

const useWindowSize = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const [isSmallWeb, setIsSmallWeb] = useState(
        window.innerWidth <= 1000 && window.innerWidth > 768
    )
    const [isSmallishMobile, setIsSmallishMobile] = useState(
        window.innerWidth <= 400
    )
    const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 300)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
            setIsSmallWeb(window.innerWidth <= 1000 && window.innerWidth > 768)
            setIsSmallishMobile(window.innerWidth <= 400)
            setIsSmallMobile(window.innerWidth <= 300)
        }

        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    return { isMobile, isSmallWeb, isSmallishMobile, isSmallMobile }
}

export default useWindowSize
