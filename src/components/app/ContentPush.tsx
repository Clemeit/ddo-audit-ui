import React from "react"
import useWindowSize from "../../hooks/useWindowSize.ts"

const ContentPush = () => {
    const { isMobile } = useWindowSize()

    return isMobile ? <div style={{ height: "50px" }} /> : null
}

export default ContentPush
