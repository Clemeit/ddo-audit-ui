import React from "react"
import useIsMobile from "../../hooks/useIsMobile.ts"

const ContentPush = () => {
    const isMobile = useIsMobile()

    return isMobile ? <div style={{ height: "50px" }} /> : null
}

export default ContentPush
