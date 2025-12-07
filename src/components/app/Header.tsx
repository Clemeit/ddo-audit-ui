import React, { useState, useEffect } from "react"
import NavMenu from "./NavMenu.tsx"
import Banner from "./Banner.tsx"
import { useLocation } from "react-router-dom"
import { bannerRouteMapping } from "../../config/routes.ts"
import { useAppContext } from "../../contexts/AppContext.tsx"
import LogInButtonContainer from "./LogInButtonContainer.tsx"

const Header = () => {
    const location = useLocation()
    const [bannerData, setBannerData] = useState({
        title: "DDO Audit",
        subtitle: "Real-time Player Concurrency Data and LFM Viewer",
        miniature: false,
        showButtons: true,
        hideSuggestionButton: false,
    })
    const { isFullScreen } = useAppContext()

    useEffect(() => {
        const rootPath = location.pathname.split("/")[1]
        if (bannerRouteMapping[rootPath])
            setBannerData(bannerRouteMapping[rootPath])
    }, [location.pathname])

    return (
        !isFullScreen && (
            <>
                <NavMenu />
                <Banner
                    title={bannerData.title}
                    subtitle={bannerData.subtitle}
                    miniature={bannerData.miniature}
                    showButtons={bannerData.showButtons}
                    hideSuggestionButton={bannerData.hideSuggestionButton}
                />
                <LogInButtonContainer />
            </>
        )
    )
}

export default Header
