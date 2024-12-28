import React, { useState } from "react"
import PropTypes from "prop-types"
// @ts-ignore
import { ReactComponent as Expand } from "../../assets/svg/expand.svg"
// @ts-ignore
import { ReactComponent as Contract } from "../../assets/svg/contract.svg"
import "./ExpandableContainer.css"

const ExpandableContainer = ({ title, children, defaultState }) => {
    const [isOpen, setIsOpen] = useState(defaultState)

    return (
        <div className="expandable-container">
            <div
                className="expandable-container-header"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{title}</span>
                {isOpen ? (
                    <Contract className="expandable-container-icon" />
                ) : (
                    <Expand className="expandable-container-icon" />
                )}
            </div>
            {isOpen && (
                <div className="expandable-container-content drop-shadow">
                    {children}
                </div>
            )}
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
