import React, { useState } from "react"
// @ts-ignore
import { ReactComponent as Expand } from "../../assets/svg/expand.svg"
// @ts-ignore
import { ReactComponent as Contract } from "../../assets/svg/contract.svg"
import "./ExpandableContainer.css"

interface Props {
    title?: string
    children?: React.ReactNode
    defaultState?: boolean
}

const ExpandableContainer = ({
    title = "Expandable Container",
    children,
    defaultState = false,
}: Props) => {
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

export default ExpandableContainer
