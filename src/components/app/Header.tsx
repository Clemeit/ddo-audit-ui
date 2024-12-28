import React, { useState, useEffect } from "react"
import NavMenu from "./NavMenu.tsx"
import Banner from "./Banner.tsx"
import { useLocation } from "react-router-dom"
import { bannerRouteMapping } from "../../config/routes.ts"

const Header = () => {
    const location = useLocation()
    const [bannerData, setBannerData] = useState({
        title: "DDO Audit",
        subtitle: "Real-time Player Concurrency Data and LFM Viewer",
        miniature: false,
        showButtons: true,
    })

    useEffect(() => {
        if (bannerRouteMapping[location.pathname])
            setBannerData(bannerRouteMapping[location.pathname])
    }, [location.pathname])

    return (
        <>
            <NavMenu />
            <Banner
                title={bannerData.title}
                subtitle={bannerData.subtitle}
                miniature={bannerData.miniature}
                showButtons={bannerData.showButtons}
            />
        </>
    )
}

export default Header
