import React from "react"
import PropTypes from "prop-types"

const Badge = ({ direction, gap, children, fullWidth, justify }) => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: direction,
                gap: gap,
                width: fullWidth ? "100%" : "auto",
                justifyContent: justify,
            }}
        >
            {children}
        </div>
    )
}

Badge.propTypes = {
    direction: PropTypes.oneOf(["row", "column"]),
    gap: PropTypes.string,
    children: PropTypes.node,
    fullWidth: PropTypes.bool,
    justify: PropTypes.oneOf([
        "flex-start",
        "flex-end",
        "center",
        "space-between",
        "space-around",
        "space-evenly",
    ]),
}

Badge.defaultProps = {
    direction: "row",
    gap: "0px",
    children: null,
    fullWidth: false,
    justify: "flex-start",
}

export default Badge