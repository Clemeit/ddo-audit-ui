import { ContentCluster } from "./ContentCluster.tsx"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import Link from "./Link"

interface Props {
    serverName: string
    backLink: React.ReactNode
    closestMatch?: string
}

const ServerValidationMessage = ({
    serverName,
    closestMatch,
    backLink,
}: Props) => {
    return (
        <ContentCluster title="Server Not Found">
            <p>
                We don't recognize the server "{serverName}".{" "}
                {closestMatch ? (
                    <span>
                        Did you mean{" "}
                        <Link to={`/grouping/${closestMatch}`}>
                            {toSentenceCase(closestMatch)}
                        </Link>
                        ?
                    </span>
                ) : (
                    <span>
                        Check the spelling and try again, or head back to{" "}
                        {backLink}.
                    </span>
                )}
            </p>
        </ContentCluster>
    )
}

export default ServerValidationMessage
