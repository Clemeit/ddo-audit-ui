import React, { useMemo } from "react"
import "./Footer.css"
import useWindowSize from "../../hooks/useWindowSize.ts"
import { useLocation } from "react-router-dom"

const showFooterOnPages = ["/", "/about"]

const Footer = () => {
    const { isMobile } = useWindowSize()
    const location = useLocation()

    const showFooter = useMemo(() => {
        return showFooterOnPages.includes(location.pathname)
    }, [location.pathname])

    return isMobile || !showFooter ? null : (
        <div className="footer">
            <p>
                DDO Audit is brought to you by Clemeit of Thrane.
                <br />
                This utility is subject to change without notice.
            </p>
        </div>
    )
}

export default Footer
