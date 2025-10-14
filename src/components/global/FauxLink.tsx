import React from "react"
import "./FauxLink.css"

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode
}

const FauxLink = ({
    children,
    ...rest
}: Props & React.HTMLAttributes<HTMLSpanElement>) => {
    return (
        <span className="faux-link" {...rest}>
            {children}
        </span>
    )
}

export default FauxLink
