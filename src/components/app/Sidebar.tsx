import "./Sidebar.css"
import { ReactComponent as LogoSVG } from "../../assets/svg/logo.svg"
import { ReactComponent as HomeSVG } from "../../assets/svg/new/home.svg"
import { ReactComponent as LiveSVG } from "../../assets/svg/new/live.svg"
import { ReactComponent as ServersSVG } from "../../assets/svg/new/servers.svg"
import { ReactComponent as APISVG } from "../../assets/svg/new/api.svg"
import { ReactComponent as WhoSVG } from "../../assets/svg/new/who.svg"
import { ReactComponent as GroupingSVG } from "../../assets/svg/new/grouping.svg"
import { ReactComponent as GuildsSVG } from "../../assets/svg/new/guilds.svg"
import { ReactComponent as ListSVG } from "../../assets/svg/new/list.svg"
import { ReactComponent as HistorySVG } from "../../assets/svg/new/history.svg"
import { ReactComponent as PersonAddSVG } from "../../assets/svg/new/person_add.svg"
import { ReactComponent as TimerSVG } from "../../assets/svg/new/timer.svg"
import { ReactComponent as AccountSVG } from "../../assets/svg/new/account.svg"
import { Link as ReactLink, useLocation } from "react-router-dom"
import Button from "../global/Button"
import { useAppContext } from "../../contexts/AppContext"

const Sidebar = () => {
    const { isSidebarCollapsed } = useAppContext()
    const location = useLocation()

    const getItemLinkClassName = (route: string) => {
        const classNames = ["app-layout__item-link"]
        if (route === null) {
            if (location.pathname === "/") {
                classNames.push("active")
            }
        } else if (location.pathname.startsWith(route)) {
            classNames.push("active")
        }
        return classNames.join(" ")
    }

    return (
        <>
            <div className="app-layout__item">
                <div className="app-layout__icon-row">
                    <div className="app-layout__logo-badge">
                        <LogoSVG className="app-layout__logo-icon" />
                    </div>
                    <span className="app-layout__app-name">DDO Audit</span>
                </div>
            </div>
            <div className="app-layout__horizontal-divider" />
            <div className="app-layout__item app-layout__item--grow">
                <div className="app-layout__nav-menu-scroll">
                    <div className="app-layout__nav-menu-container">
                        <div className="app-layout__nav-menu-section">
                            <span className="app-layout__section-header">
                                MAIN
                            </span>
                            <ReactLink
                                to="/"
                                aria-label="Home"
                                title="Home"
                                className={getItemLinkClassName(null)}
                            >
                                <div className="app-layout__icon-row">
                                    <HomeSVG className="app-layout__icon" />
                                    <span>Home</span>
                                </div>
                            </ReactLink>
                            <ReactLink
                                to="/live"
                                aria-label="Live Activity"
                                title="Live Activity"
                                className={getItemLinkClassName("/live")}
                            >
                                <div className="app-layout__icon-row">
                                    <LiveSVG className="app-layout__icon" />
                                    <span>Live Activity</span>
                                </div>
                            </ReactLink>
                        </div>
                        {isSidebarCollapsed && <hr />}
                        <div className="app-layout__nav-menu-section">
                            <span className="app-layout__section-header">
                                SOCIAL
                            </span>
                            <ReactLink
                                to="/grouping"
                                aria-label="Grouping"
                                title="Grouping"
                                className={getItemLinkClassName("/grouping")}
                            >
                                <div className="app-layout__icon-row">
                                    <GroupingSVG className="app-layout__icon" />
                                    <span>Grouping</span>
                                </div>
                            </ReactLink>
                            <ReactLink
                                to="/who"
                                aria-label="Who is Online"
                                title="Who is Online"
                                className={getItemLinkClassName("/who")}
                            >
                                <div className="app-layout__icon-row">
                                    <WhoSVG className="app-layout__icon" />
                                    <span>Who is Online</span>
                                </div>
                            </ReactLink>
                            <ReactLink
                                to="/guilds"
                                aria-label="Guilds"
                                title="Guilds"
                                className={getItemLinkClassName("/guilds")}
                            >
                                <div className="app-layout__icon-row">
                                    <GuildsSVG className="app-layout__icon" />
                                    <span>Guilds</span>
                                </div>
                            </ReactLink>
                        </div>
                        {isSidebarCollapsed && <hr />}
                        <div className="app-layout__nav-menu-section">
                            <span className="app-layout__section-header">
                                CHARACTER
                            </span>
                            <ReactLink
                                to="/registration"
                                aria-label="Register Characters"
                                title="Register Characters"
                                className={getItemLinkClassName(
                                    "/registration"
                                )}
                            >
                                <div className="app-layout__icon-row">
                                    <PersonAddSVG className="app-layout__icon" />
                                    <span>Register Characters</span>
                                </div>
                            </ReactLink>
                            <ReactLink
                                to="/timers"
                                aria-label="Raid Timers"
                                title="Raid Timers"
                                className={getItemLinkClassName("/timers")}
                            >
                                <div className="app-layout__icon-row">
                                    <TimerSVG className="app-layout__icon" />
                                    <span>Raid Timers</span>
                                </div>
                            </ReactLink>
                            <ReactLink
                                to="/activity"
                                aria-label="Character Activity"
                                title="Character Activity"
                                className={getItemLinkClassName("/activity")}
                            >
                                <div className="app-layout__icon-row">
                                    <HistorySVG className="app-layout__icon" />
                                    <span>Character Activity</span>
                                </div>
                            </ReactLink>
                        </div>
                        {isSidebarCollapsed && <hr />}
                        <div className="app-layout__nav-menu-section">
                            <span className="app-layout__section-header">
                                DATA
                            </span>
                            <ReactLink
                                to="/servers"
                                aria-label="Server Statistics"
                                title="Server Statistics"
                                className={getItemLinkClassName("/servers")}
                            >
                                <div className="app-layout__icon-row">
                                    <ServersSVG className="app-layout__icon" />
                                    <span>Server Statistics</span>
                                </div>
                            </ReactLink>
                            <ReactLink
                                to="/quests"
                                aria-label="Quest Activity"
                                title="Quest Activity"
                                className={getItemLinkClassName("/timers")}
                            >
                                <div className="app-layout__icon-row">
                                    <ListSVG className="app-layout__icon" />
                                    <span>Quest Activity</span>
                                </div>
                            </ReactLink>
                            <a
                                href={"https://api.ddoaudit.com/docs"}
                                rel="noreferrer"
                                target="_blank"
                                aria-label="Swagger API"
                                title="Swagger API"
                                className={getItemLinkClassName("/api")}
                            >
                                <div className="app-layout__icon-row">
                                    <APISVG className="app-layout__icon" />
                                    <span>API</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="app-layout__horizontal-divider" />
            <div className="app-layout__item">
                <div className="app-layout__account-container">
                    {isSidebarCollapsed ? (
                        <ReactLink
                            to="sign-in"
                            aria-label="Sign In"
                            title="Sign In"
                            className={getItemLinkClassName("/sign-in")}
                        >
                            <div className="app-layout__icon-row">
                                <AccountSVG className="app-layout__icon" />
                            </div>
                        </ReactLink>
                    ) : (
                        <>
                            <span style={{ fontWeight: "600" }}>
                                Sign In for More
                            </span>
                            <span className="text-muted">
                                Track your characters and save preferences
                                across devices.
                            </span>
                            <Button type="secondary" onClick={() => {}}>
                                Log In
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default Sidebar
