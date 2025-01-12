import React from "react"
import { Helmet } from "react-helmet-async"
import "./Page.css"

interface Props {
    children: React.ReactNode
    title: string
    description: string
    icon?: React.ReactNode
    className?: string
    centered?: boolean
    noPadding?: boolean
    contentMaxWidth?: boolean
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
}: Props) => {
    return (
        <div className={className}>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta
                    property="og:image"
                    content="/icons/logo-512px.png"
                    data-react-helmet="true"
                />
                <meta
                    property="twitter:image"
                    content="/icons/logo-512px.png"
                    data-react-helmet="true"
                />
            </Helmet>
            <div className={`page ${noPadding ? "no-padding" : ""}`}>
                <div
                    className={`page-content ${centered ? "centered" : ""} ${contentMaxWidth ? "content-max-width" : ""}`}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Page
