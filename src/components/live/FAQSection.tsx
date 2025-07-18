import { toSentenceCase } from "../../utils/stringUtils.ts"
import { SERVER_NAMES } from "../../constants/servers.ts"
import ServerLink from "../global/ServerLink.tsx"
import "./FAQSection.css"

interface Props {
    defaultServerName: string
    mostPopulatedServerThisWeek: string
    mostPopulatedServerThisMonth: string
}

interface FAQItem {
    question: string
    answer: string
    fallbackAnswer?: string
    dependencies?: string[]
}

const FAQSection = ({
    defaultServerName,
    mostPopulatedServerThisWeek,
    mostPopulatedServerThisMonth,
}: Props) => {
    const getMostPopulatedServerString = (): string => {
        if (mostPopulatedServerThisMonth !== mostPopulatedServerThisWeek) {
            return `${toSentenceCase(mostPopulatedServerThisMonth)} was recently DDO's most populated server, but it has recently been passed by ${toSentenceCase(mostPopulatedServerThisWeek)}.`
        }
        return `${toSentenceCase(mostPopulatedServerThisMonth)} is currently DDO's most populated server.`
    }

    const allFaqData: FAQItem[] = [
        {
            question: "What is DDO's most populated server?",
            answer: `${getMostPopulatedServerString()} This changes from time to time based on the current default server.`,
            fallbackAnswer:
                "Server population varies based on time of day and current events. Check our Live page for real-time server population data.",
            dependencies: [
                mostPopulatedServerThisWeek,
                mostPopulatedServerThisMonth,
            ],
        },
        {
            question: "What is DDO's default server?",
            answer: `${toSentenceCase(defaultServerName)} is currently DDO's default server and will likely have the most new players. This changes periodically to help balance the game's population.`,
            fallbackAnswer:
                "DDO's default server changes periodically to help balance the game's population. Check our Servers page for current default server information.",
            dependencies: [defaultServerName],
        },
        {
            question: "How many players does DDO have?",
            answer: "Estimating the total number of players is difficult, and isn't something that DDO Audit does. However, we have cataloged 123,456 unique characters in the past quarter.",
        },
        {
            question: "What is DDO's best server?",
            answer: `The best server for you will depend on a myriad of factors including time zone, guild activity, a server's physical location, and your play style. You can check our "Servers" page for more information, or try starting out on ${toSentenceCase(defaultServerName)} which is currently DDO's default server.`,
            fallbackAnswer:
                'The best server for you will depend on a myriad of factors including time zone, guild activity, a server\'s physical location, and your play style. You can check our "Servers" page for more information about current server populations.',
            dependencies: [defaultServerName],
        },
        {
            question: "Is DDO down?",
            answer: 'Server status can be checked on our "Live" page. Server status is checked every few seconds and is updated in real-time.',
        },
        {
            question: "Is DDO still active in 2025?",
            answer: "Yes, DDO is still quite active and receives periodic updates and content releases.",
        },
    ]

    // Use all FAQ data to prevent layout shift
    const faqData = allFaqData

    // Helper function to check if FAQ item is ready to display
    const isFaqItemReady = (item: FAQItem): boolean => {
        return (
            !item.dependencies ||
            item.dependencies.every((dep) => dep && dep.trim() !== "")
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

    const replaceServerNamesWithServerLinks = (text: string): JSX.Element => {
        // Create a regex pattern that matches any server name (case insensitive)
        const serverNamesPattern = SERVER_NAMES.join("|")
        const regex = new RegExp(`\\b(${serverNamesPattern})\\b`, "gi")

        // Split the text by server names while preserving the matched parts
        const parts = text.split(regex)

        return (
            <>
                {parts.map((part, index) => {
                    // Check if this part is a server name (case insensitive)
                    const isServerName = SERVER_NAMES.some(
                        (serverName) =>
                            serverName.toLowerCase() === part.toLowerCase()
                    )

                    if (isServerName) {
                        return <ServerLink key={index} serverName={part} />
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
                                    {replaceServerNamesWithServerLinks(
                                        item.answer
                                    )}
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
