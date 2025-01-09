import React from "react"
import PropTypes from "prop-types"
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
}

const Page = ({
    children,
    title,
    description,
    icon,
    className,
    centered = false,
    noPadding = false,
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
                <div className={`page-content ${centered ? "centered" : ""}`}>
                    {children}
                </div>
            </div>
        </div>
    )
}

Page.propTypes = {
    children: PropTypes.node,
    title: PropTypes.string,
    description: PropTypes.string,
    icon: PropTypes.node,
    className: PropTypes.string,
}

Page.defaultProps = {
    children: null,
    title: "DDO Audit",
    description:
        "A live summary of DDO's current player population and LFM status. View population trends, check server status, browse live grouping panels, check to see if your friends are online, and decide what server is best for you!",
    icon: null,
    className: "",
}

export default Page
