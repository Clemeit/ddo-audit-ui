import { ServerInfoApiDataModel } from "../../models/Game.ts"
import { getDefaultServerName } from "../../utils/serverUtils.ts"
import ServerLink from "../global/ServerLink.tsx"

interface Props {
    serverInfoData: ServerInfoApiDataModel
    mostPopulatedServerThisWeek: string
    mostPopulatedServerThisMonth: string
}

const QuickInfo = ({
    serverInfoData,
    mostPopulatedServerThisWeek,
    mostPopulatedServerThisMonth,
}: Props) => {
    if (
        !serverInfoData ||
        !mostPopulatedServerThisWeek ||
        !mostPopulatedServerThisMonth
    ) {
        // Additional padding reduces CLS on eventual load
        return (
            <p>
                Loading...
                <br />
                <br />
                <br />
            </p>
        )
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
                <ServerLink serverName={getDefaultServerName(serverInfoData)} />
            </li>
            <li>{getMostPopulatedStatement()}</li>
            <li>
                In the last quarter, we've cataloged{" "}
                <span className="blue-text">123,456</span> unique characters and{" "}
                <span className="orange-text">12,345</span> unique guilds
            </li>
        </ul>
    )
}

export default QuickInfo
