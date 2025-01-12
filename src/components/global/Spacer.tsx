import React from "react"

interface Props {
    size: string
    className?: string
}

const Spacer = ({ size, className = "" }: Props) => {
    return <div className={className} style={{ width: size, height: size }} />
}

export default Spacer
