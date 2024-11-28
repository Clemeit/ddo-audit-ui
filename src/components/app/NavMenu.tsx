import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Link } from "react-router-dom"
import "./NavMenu.css"
import { ReactComponent as HomeSVG } from "../../assets/svg_icons/home.svg"
import { ReactComponent as AboutSVG } from "../../assets/svg_icons/about.svg"
import { ReactComponent as LiveSVG } from "../../assets/svg_icons/live.svg"
import { ReactComponent as ServersSVG } from "../../assets/svg_icons/servers.svg"
import { ReactComponent as TrendsSVG } from "../../assets/svg_icons/trends.svg"
import { ReactComponent as WhoSVG } from "../../assets/svg_icons/who.svg"
import { ReactComponent as GroupingSVG } from "../../assets/svg_icons/grouping.svg"

const NavMenu = () => {
    const location = useLocation()
    const [scrollPosition, setScrollPosition] = useState(0)

    useEffect(() => {
        const handleScroll = () => setScrollPosition(window.scrollY)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {}, [location])

    return (
        <nav className={`nav-menu ${scrollPosition > 80 ? "solid" : ""}`}>
            <Link to="/" className="nav-item active">
                <HomeSVG />
                <span>Home</span>
            </Link>
            <Link to="/fakepage1" className="nav-item">
                <LiveSVG />
                <span>Live</span>
            </Link>
            <Link to="/fakepage2" className="nav-item">
                <ServersSVG />
                <span>Servers</span>
            </Link>
            <Link to="/fakepage3" className="nav-item">
                <GroupingSVG />
                <span>Grouping</span>
            </Link>
            <Link to="/lazypage1" className="nav-item">
                <WhoSVG />
                <span>Who</span>
            </Link>
            <Link to="/lazypage1" className="nav-item hide-on-mobile">
                <TrendsSVG />
                <span>Trends</span>
            </Link>
            <Link to="/lazypage1" className="nav-item hide-on-mobile">
                <AboutSVG />
                <span>About</span>
            </Link>
        </nav>
    )
}

export default NavMenu
