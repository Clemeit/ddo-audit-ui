import React from "react"
import PropTypes from "prop-types"
import "./ContentCluster.css"

const ContentCluster = ({
    title,
    subtitle,
    link,
    showLink,
    children,
    className,
    hideHeaderOnMobile,
}) => {
    return (
        <div className={`content-cluster ${className}`}>
            <h2 className={hideHeaderOnMobile ? "hide-on-mobile" : ""}>
                {title}
            </h2>
            {subtitle && <p className="subtitle">{subtitle}</p>}
            <div className="content">{children}</div>
        </div>
    )
}

ContentCluster.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    link: PropTypes.string,
    showLink: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
    hideHeaderOnMobile: PropTypes.bool,
}

ContentCluster.defaultProps = {
    title: "",
    subtitle: "",
    link: "#",
    showLink: true,
    children: null,
    className: "",
    hideHeaderOnMobile: false,
}

export default ContentCluster
