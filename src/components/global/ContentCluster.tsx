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
}) => {
    return (
        <div className={`content-cluster ${className}`}>
            <h2>{title}</h2>
            <hr />
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
}

ContentCluster.defaultProps = {
    title: "Title",
    subtitle: "",
    link: "#",
    showLink: true,
    children: null,
    className: "",
}

export default ContentCluster
