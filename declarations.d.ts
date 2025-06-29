declare module "*.svg" {
    import React from "react"
    const ReactComponent: React.FunctionComponent<
        React.SVGProps<SVGSVGElement> & { title?: string }
    >
    export { ReactComponent }

    const src: string
    export default src
}
