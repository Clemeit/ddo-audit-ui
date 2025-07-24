import ServerLink from "../global/ServerLink.tsx"
import Skeleton from "../global/Skeleton.tsx"
import { ReactComponent as InfoSVG } from "../../assets/svg/info.svg"

interface Props {
    defaultServerName: string
    mostPopulatedServerThisWeek: string
    mostPopulatedServerThisMonth: string
    uniqueCharactersThisQuarter: number
    uniqueGuildsThisQuarter: number
}

const QuickInfo = ({
    defaultServerName,
    mostPopulatedServerThisWeek,
    mostPopulatedServerThisMonth,
    uniqueCharactersThisQuarter,
    uniqueGuildsThisQuarter,
}: Props) => {
    const getDefaultServerStatement = () => {
        if (!defaultServerName) {
            return <Skeleton width="210px" />
        }

        if (defaultServerName === "unknown") {
            return (
                <span>
                    The default server is currently unknown - check back later
                </span>
            )
        }

        return (
            <span>
                The default server is{" "}
                <ServerLink serverName={defaultServerName} />
            </span>
        )
    }

    const getMostPopulatedStatement = () => {
        if (!mostPopulatedServerThisWeek || !mostPopulatedServerThisMonth) {
            return <Skeleton width="220px" />
        }
        if (mostPopulatedServerThisMonth !== mostPopulatedServerThisWeek) {
            return (
                <span>
                    The most populated server this month was{" "}
                    <ServerLink serverName={mostPopulatedServerThisMonth} />,
                    but <ServerLink serverName={mostPopulatedServerThisWeek} />{" "}
                    surpassed it this week
                </span>
            )
        }
        return (
            <span>
                The most populated server is{" "}
                <ServerLink serverName={mostPopulatedServerThisMonth} />
            </span>
        )
    }

    const getUniqueCharactersAndGuildsStatement = () => {
        if (!uniqueCharactersThisQuarter || !uniqueGuildsThisQuarter) {
            return <Skeleton width="320px" />
        }
        return (
            <span>
                In the last quarter, we've cataloged{" "}
                <span className="blue-text">
                    {uniqueCharactersThisQuarter.toLocaleString()}
                </span>{" "}
                unique characters and{" "}
                <span className="orange-text">
                    {uniqueGuildsThisQuarter.toLocaleString()}
                </span>{" "}
                unique guilds
            </span>
        )
    }

    return (
        <>
            <span>
                <InfoSVG
                    className="page-message-icon"
                    style={{ fill: `var(--info)` }}
                />
                Data collection has not been running for an entire quarter, so
                the following data may not be accurate.
            </span>
            <ul>
                <li>{getDefaultServerStatement()}</li>
                <li>{getMostPopulatedStatement()}</li>
                <li>{getUniqueCharactersAndGuildsStatement()}</li>
            </ul>
        </>
    )
}

export default QuickInfo
