import React from "react"
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
    return (
        <nav>
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
            <Link to="/lazypage1" className="nav-item">
                <TrendsSVG />
                <span>Trends</span>
            </Link>
            <Link to="/lazypage1" className="nav-item">
                <AboutSVG />
                <span>About</span>
            </Link>
        </nav>
    )
}

export default NavMenu
