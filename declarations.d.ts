declare module "*.svg" {
    import React from "react"
    const RC: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    export { RC as ReactComponent }
}
