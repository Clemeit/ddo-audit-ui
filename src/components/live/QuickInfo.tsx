import ServerLink from "../global/ServerLink.tsx"
import QuickInfoSkeleton from "./QuickInfoSkeleton.tsx"

interface Props {
    defaultServerName: string
    mostPopulatedServerThisWeek: string
    mostPopulatedServerThisMonth: string
}

const QuickInfo = ({
    defaultServerName,
    mostPopulatedServerThisWeek,
    mostPopulatedServerThisMonth,
}: Props) => {
    if (
        !defaultServerName ||
        !mostPopulatedServerThisWeek ||
        !mostPopulatedServerThisMonth
    ) {
        return <QuickInfoSkeleton />
    }

    const getMostPopulatedStatement = () => {
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

    return (
        <ul>
            <li>
                The default server is{" "}
                <ServerLink serverName={defaultServerName} />
            </li>
            <li>{getMostPopulatedStatement()}</li>
            <li>
                In the last quarter, we've cataloged{" "}
                <span className="blue-text">----</span> unique characters and{" "}
                <span className="orange-text">----</span> unique guilds
            </li>
        </ul>
    )
}

export default QuickInfo
