import { toSentenceCase } from "../../utils/stringUtils.ts"
import { SERVER_NAMES } from "../../constants/servers.ts"
import ServerLink from "../global/ServerLink.tsx"
import "./FAQSection.css"
import ColoredText from "../global/ColoredText.tsx"

interface Props {
    defaultServerName: string
    mostPopulatedServerThisWeek: string
    mostPopulatedServerThisMonth: string
    uniqueCharactersThisQuarter: number
}

interface FAQItem {
    question: string
    answer: string
    fallbackAnswer?: string
    dependencies?: any[]
}

const FAQSection = ({
    defaultServerName,
    mostPopulatedServerThisWeek,
    mostPopulatedServerThisMonth,
    uniqueCharactersThisQuarter,
}: Props) => {
    const getMostPopulatedServerString = (): string => {
        if (mostPopulatedServerThisMonth !== mostPopulatedServerThisWeek) {
            return `${toSentenceCase(mostPopulatedServerThisMonth)} has been DDO's most populated server for a while, but it was recently passed by ${toSentenceCase(mostPopulatedServerThisWeek)}.`
        }
        return `${toSentenceCase(mostPopulatedServerThisMonth)} is currently DDO's most populated server.`
    }
    const getDefaultServerString = (): string => {
        if (defaultServerName == "unknown") {
            return "DDO's default server is currently unknown because the game servers are offline. Please check back later."
        }
        return `${toSentenceCase(defaultServerName)} is currently DDO's default server and will likely have the most new players. This changes periodically to help balance the game's population.`
    }
    const getBestServerString = (): string => {
        if (defaultServerName == "unknown") {
            return "The best server for you will depend on a myriad of factors including time zone, guild activity, a server's physical location, and your play style. You can check our 'Servers' page for more information about current server populations, or try starting out on the default server."
        }
        return `The best server for you will depend on a myriad of factors including time zone, guild activity, a server's physical location, and your play style. You can check our 'Servers' page for more information, or try starting out on ${toSentenceCase(defaultServerName)} which is currently DDO's default server.`
    }

    const allFaqData: FAQItem[] = [
        {
            question: "What is DDO's most populated server?",
            answer: `${getMostPopulatedServerString()} This fluctuates based on the current default server.`,
            fallbackAnswer:
                "Server population varies based on time of day and other factors. Check our Live page for real-time server population data.",
            dependencies: [
                mostPopulatedServerThisWeek,
                mostPopulatedServerThisMonth,
            ],
        },
        {
            question: "What is DDO's default server?",
            answer: getDefaultServerString(),
            fallbackAnswer:
                "DDO's default server changes periodically to help balance the game's population. Check our Live page for current default server information.",
            dependencies: [defaultServerName],
        },
        {
            question: "How many players does DDO have?",
            answer: `Estimating the total number of players is difficult, and isn't something that DDO Audit does. However, we have cataloged ${uniqueCharactersThisQuarter?.toLocaleString()} unique characters in the past quarter.`,
            fallbackAnswer:
                "Estimating the total number of players is difficult, and isn't something that DDO Audit does. However, you can get a rough idea of player count by checking the number of unique characters we've cataloged this past quarter.",
            dependencies: [uniqueCharactersThisQuarter],
        },
        {
            question: "What is DDO's best server?",
            answer: getBestServerString(),
            fallbackAnswer:
                'The best server for you will depend on a myriad of factors including time zone, guild activity, a server\'s physical location, and your play style. You can check our "Servers" page for more information about current server populations.',
            dependencies: [defaultServerName],
        },
        {
            question: "Is DDO down?",
            answer: 'Server status can be checked on our "Live" page. Server status is checked every few seconds and is updated in real-time.',
        },
        {
            question: `Is DDO still active in ${new Date().getFullYear()}?`,
            answer: "Yes, DDO is still quite active and receives periodic updates and content releases.",
        },
        {
            question: "What is DDO Audit?",
            answer: "DDO Audit is a community-driven project that tracks DDO server populations, player activity, and provides insights into the game's health and trends. It also serves as a Live LFM and character viewer.",
        },
    ]

    // Use all FAQ data to prevent layout shift
    const faqData = allFaqData

    // Helper function to check if FAQ item is ready to display
    const isFaqItemReady = (item: FAQItem): boolean => {
        return (
            !item.dependencies ||
            item.dependencies.every(
                (dep) =>
                    dep &&
                    (typeof dep === "string" ? dep.trim() !== "" : dep !== null)
            )
        )
    }

    // Generate JSON-LD structured data for search engines (with fallbacks for incomplete data)
    const faqStructuredData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqData.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: isFaqItemReady(item)
                    ? item.answer
                    : item.fallbackAnswer ||
                      "Please check our website for the most current information.",
            },
        })),
    }

    const convertToRichText = (text: string): JSX.Element => {
        // Create a regex pattern that matches server names and numbers (with optional commas)
        const serverNamesPattern = SERVER_NAMES.join("|")
        const regex = new RegExp(
            `\\b(${serverNamesPattern}|\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?)\\b`,
            "gi"
        )

        // Split the text by server names and numbers while preserving the matched parts
        const parts = text.split(regex)

        return (
            <>
                {parts.map((part, index) => {
                    // Check if this part is a server name (case insensitive)
                    const isServerName = SERVER_NAMES.some(
                        (serverName) =>
                            serverName.toLowerCase() === part.toLowerCase()
                    )
                    const isNumeric = !isNaN(Number(part.replace(/,/g, "")))

                    if (isServerName) {
                        return <ServerLink key={index} serverName={part} />
                    } else if (isNumeric && part.trim() !== "") {
                        return (
                            <ColoredText color="blue" key={index}>
                                {part}
                            </ColoredText>
                        )
                    } else {
                        return <span key={index}>{part}</span>
                    }
                })}
            </>
        )
    }

    return (
        <div className="faq-section">
            {/* JSON-LD structured data for search engines */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(faqStructuredData),
                }}
            />

            <div className="faq-container">
                {faqData.map((item, index) => (
                    <div
                        key={index}
                        className="faq-item"
                        itemScope
                        itemType="https://schema.org/Question"
                    >
                        <h3 className="faq-question" itemProp="name">
                            {item.question}
                        </h3>
                        <div
                            className="faq-answer"
                            itemScope
                            itemType="https://schema.org/Answer"
                            itemProp="acceptedAnswer"
                        >
                            {isFaqItemReady(item) ? (
                                <p className="faq-answer-text" itemProp="text">
                                    {convertToRichText(item.answer)}
                                </p>
                            ) : (
                                <p className="faq-answer-text" itemProp="text">
                                    {item.fallbackAnswer || "Loading..."}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FAQSection
