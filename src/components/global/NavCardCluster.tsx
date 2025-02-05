import React from "react"

interface Props {
    children?: React.ReactNode
}

const NavCardCluster = ({ children = null }: Props) => {
    return <div className="nav-card-cluster">{children}</div>
}

export default NavCardCluster
