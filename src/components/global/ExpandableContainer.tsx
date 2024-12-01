import React, { useState } from "react"
import PropTypes from "prop-types"
// @ts-ignore
import { ReactComponent as Expand } from "../../assets/svg/expand.svg"
// @ts-ignore
import { ReactComponent as Contract } from "../../assets/svg/contract.svg"
import "./ExpandableContainer.css"

const ExpandableContainer = ({ title, children, defaultState }) => {
    const [isOpen, setIsOpen] = useState(defaultState)
    return isOpen ? (
        <div className="expandable-container">
            <div
                className="expandable-container-header"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h2>{title}</h2>
                <Contract className="expandable-container-icon" />
            </div>
            <div className="expandable-container-content">{children}</div>
        </div>
    ) : (
        <div className="expandable-container">
            <div
                className="expandable-container-header"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h2>{title}</h2>
                <Expand className="expandable-container-icon" />
            </div>
        </div>
    )
}

ExpandableContainer.propTypes = {
    title: PropTypes.string,
    children: PropTypes.element,
    defaultState: PropTypes.bool,
}

ExpandableContainer.defaultProps = {
    title: "Expandable Container",
    children: null,
    defaultState: false,
}

export default ExpandableContainer
