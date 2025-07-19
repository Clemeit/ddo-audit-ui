import ServerLink from "../global/ServerLink.tsx"
import Skeleton from "../global/Skeleton.tsx"

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
                    was more popular this past week
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
        <ul>
            <li>{getDefaultServerStatement()}</li>
            <li>{getMostPopulatedStatement()}</li>
            <li>{getUniqueCharactersAndGuildsStatement()}</li>
        </ul>
    )
}

export default QuickInfo
