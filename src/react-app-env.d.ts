declare module "*.svg" {
    import React from "react"
    const ReactComponent: React.FunctionComponent<
        React.SVGProps<SVGSVGElement> & { title?: string }
    >
    export { ReactComponent }

    const src: string
    export default src
}

declare module "*.png" {
    const src: string
    export default src
}

declare module "*.jpg" {
    const src: string
    export default src
}

declare module "*.jpeg" {
    const src: string
    export default src
}

declare module "*.gif" {
    const src: string
    export default src
}

declare module "*.webp" {
    const src: string
    export default src
}

declare module "*.ico" {
    const src: string
    export default src
}

declare module "*.bmp" {
    const src: string
    export default src
}
