import React, { useState } from "react"
import { ReactComponent as Expand } from "../../assets/svg/expand.svg"
import { ReactComponent as Contract } from "../../assets/svg/contract.svg"
import "./ExpandableContainer.css"

interface Props {
    title?: React.ReactElement
    children?: React.ReactNode
    defaultState?: boolean
    stateChangeCallback?: (isOpen: boolean) => void
    className?: string
}

const ExpandableContainer = ({
    title = <span>Expandable Container</span>,
    children,
    defaultState = false,
    stateChangeCallback = () => {},
    className = "",
}: Props) => {
    const [isOpen, setIsOpen] = useState(defaultState)

    React.useEffect(() => {
        stateChangeCallback?.(isOpen)
    }, [isOpen])

    return (
        <div className={`expandable-container ${className ? className : ""}`}>
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
