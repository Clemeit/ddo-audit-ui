import React, { useMemo } from "react"
import { Helmet } from "react-helmet-async"
import "./Page.css"
import useNetworkStatus from "../../hooks/useNetworkStatus.ts"
import BreadcrumbSchema from "./BreadcrumbSchema.tsx"
import BannerMessage from "./BannerMessage.tsx"
import PageMessageContainer from "./PageMessageContainer.tsx"
import useBooleanFlag from "../../hooks/useBooleanFlags.ts"
import { BOOLEAN_FLAGS } from "../../utils/localStorage.ts"
import { AlphaReleasePageMessage } from "./CommonMessages.tsx"

interface Props {
    children: React.ReactNode
    title: string
    description: string
    icon?: React.ReactNode
    className?: string
    centered?: boolean
    noPadding?: boolean
    contentMaxWidth?: boolean
    logo?: string
    pageMessages?:
        | React.ReactNode
        | React.ReactNode[]
        | (() => React.ReactNode | React.ReactNode[])
    is404Page?: boolean
}

const Page = ({
    children,
    title,
    description,
    icon,
    className,
    centered = false,
    noPadding = false,
    contentMaxWidth = false,
    logo = "/icons/logo-192px.png",
    pageMessages,
    is404Page = false,
}: Props) => {
    const isOnline = useNetworkStatus()

    const [hideAlphaRelease, setHideAlphaRelease] = useBooleanFlag(
        BOOLEAN_FLAGS.hideAlphaRelease
    )

    // Convert relative logo path to absolute URL for social media meta tags
    const absoluteLogoUrl = logo.startsWith("http")
        ? logo
        : `https://www.ddoaudit.com${logo}`

    // Resolve pageMessages (supports function form for lazy/conditional evaluation)
    const rawPageMessages = useMemo<
        React.ReactNode | React.ReactNode[] | null
    >(() => {
        if (!pageMessages) return null
        if (typeof pageMessages === "function") {
            try {
                return pageMessages()
            } catch (e) {
                // Fail gracefully so a bad message function doesn't break the page
                console.error("Error evaluating pageMessages function", e)
                return null
            }
        }
        return pageMessages
    }, [pageMessages])

    // Normalize to flat array & strip falsy values.
    // React.Children.toArray also flattens fragments and filters out booleans/null automatically.
    const composedMessages = useMemo<React.ReactNode[]>(() => {
        if (!rawPageMessages) return []
        return React.Children.toArray(rawPageMessages).filter(Boolean)
    }, [rawPageMessages])

    const hasPageMessage = composedMessages.length > 0 || !hideAlphaRelease

    return (
        <div className={className}>
            {!isOnline && (
                <BannerMessage message="You're offline" type="critical" />
            )}

            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <link
                    rel="canonical"
                    href={`https://www.ddoaudit.com${window.location.pathname}`}
                />

                {/* Open Graph tags */}
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta
                    property="og:url"
                    content={`https://www.ddoaudit.com${window.location.pathname}`}
                />
                <meta property="og:image" content={absoluteLogoUrl} />

                {/* Twitter Card tags */}
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:image" content={absoluteLogoUrl} />

                {is404Page && <meta name="robots" content="noindex" />}
                {is404Page && (
                    <meta name="prerender-status-code" content="404" />
                )}
            </Helmet>
            <BreadcrumbSchema />
            <div
                className={`page ${noPadding ? "no-padding" : ""} ${hasPageMessage ? "with-messages" : ""}`}
            >
                <div
                    className={`page-content ${centered ? "centered" : ""} ${contentMaxWidth ? "content-max-width" : ""}`}
                >
                    {children}
                    {hasPageMessage && (
                        <PageMessageContainer aria-live="polite">
                            {!hideAlphaRelease && (
                                <AlphaReleasePageMessage
                                    key="alpha-release"
                                    onDismiss={() => {
                                        setHideAlphaRelease(true)
                                    }}
                                />
                            )}
                            {composedMessages.map((msg, idx) => {
                                // If consumer supplied their own key we preserve React’s own key
                                // Fallback to index only if nothing else (better: require keys downstream)
                                if (
                                    React.isValidElement(msg) &&
                                    msg.key != null &&
                                    msg.key !== null
                                ) {
                                    return msg
                                }
                                return (
                                    <React.Fragment key={idx}>
                                        {msg}
                                    </React.Fragment>
                                )
                            })}
                        </PageMessageContainer>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Page
