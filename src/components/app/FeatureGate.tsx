import React, { lazy } from "react"
import { useAppContext } from "../../contexts/AppContext.tsx"
import { getIsFeatureEnabled } from "../../utils/configUtils.ts"
import { lazyRetry } from "../../utils/routerUtils.ts"

const NotFound = lazy(() => lazyRetry(() => import("./NotFound.tsx")))

interface Props {
    featureKey: string
    children: React.ReactNode
}

/**
 * Renders its children only when the config flag is on; otherwise the generic 404 page.
 * Renders nothing until the config has loaded (from cache or network), so a direct
 * navigation doesn't flash the 404 before the flag is known.
 */
const FeatureGate = ({ featureKey, children }: Props) => {
    const { config } = useAppContext()

    if (!config) return null

    return getIsFeatureEnabled(config, featureKey) ? (
        <>{children}</>
    ) : (
        <NotFound />
    )
}

export default FeatureGate
