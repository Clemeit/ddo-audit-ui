import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import Link from "../global/Link.tsx"
import "./NavMenu.css"
import { ReactComponent as HomeSVG } from "../../assets/svg/home.svg"
import { ReactComponent as AboutSVG } from "../../assets/svg/about.svg"
import { ReactComponent as LiveSVG } from "../../assets/svg/live.svg"
import { ReactComponent as ServersSVG } from "../../assets/svg/servers.svg"
import { ReactComponent as TrendsSVG } from "../../assets/svg/trends.svg"
import { ReactComponent as WhoSVG } from "../../assets/svg/who.svg"
import { ReactComponent as GroupingSVG } from "../../assets/svg/grouping.svg"

const NavMenu = () => {
    const location = useLocation()
    const [scrollPosition, setScrollPosition] = useState(0)

    useEffect(() => {
        const handleScroll = () => setScrollPosition(window.scrollY)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <nav className={`nav-menu ${scrollPosition > 0 ? "solid" : ""}`}>
            <Link
                to="/"
                className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
            >
                <HomeSVG className="nav-icon" />
                <span>Home</span>
            </Link>
            <Link
                to="/live"
                className={`nav-item ${location.pathname.startsWith("/live") ? "active" : ""}`}
            >
                <LiveSVG className="nav-icon" />
                <span>Live</span>
            </Link>
            <Link
                to="/servers"
                className={`nav-item ${location.pathname.startsWith("/servers") ? "active" : ""}`}
                disabled
            >
                <ServersSVG className="nav-icon" />
                <span>Servers</span>
            </Link>
            <Link
                to="/grouping"
                className={`nav-item ${location.pathname.startsWith("/grouping") ? "active" : ""}`}
            >
                <GroupingSVG className="nav-icon" />
                <span>Grouping</span>
            </Link>
            <Link
                to="/who"
                className={`nav-item ${location.pathname.startsWith("/who") ? "active" : ""}`}
            >
                <WhoSVG className="nav-icon" />
                <span>Who</span>
            </Link>
            <Link
                to="/trends"
                className={`nav-item hide-on-mobile ${location.pathname.startsWith("/trends") ? "active" : ""}`}
                disabled
            >
                <TrendsSVG className="nav-icon" />
                <span>Trends</span>
            </Link>
            <Link
                to="/about"
                className={`nav-item hide-on-mobile ${location.pathname.startsWith("/about") ? "active" : ""}`}
            >
                <AboutSVG className="nav-icon" />
                <span>About</span>
            </Link>
        </nav>
    )
}

export default NavMenu
