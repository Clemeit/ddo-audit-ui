async function lazyRetry<T extends { default: React.ComponentType<any> }>(
    componentImport: () => Promise<T>
): Promise<T> {
    const storageKey = "retry-lazy-refreshed"
    const hasRefreshed = JSON.parse(
        window.sessionStorage.getItem(storageKey) || "false"
    )
    try {
        const component = await componentImport()
        window.sessionStorage.setItem(storageKey, "false")
        if (component === undefined) {
            window.sessionStorage.setItem(storageKey, "true")
            window.location.reload()
            throw new Error("Component import returned undefined, reloading...")
        }
        return component
    } catch (error) {
        const isChunkLoadError =
            error instanceof Error &&
            (error.name === "ChunkLoadError" ||
                error.message.includes("Loading chunk") ||
                error.message.includes(
                    "Failed to fetch dynamically imported module"
                ))
        if (isChunkLoadError && !hasRefreshed) {
            window.sessionStorage.setItem(storageKey, "true")
            window.location.reload()
            throw new Error("Component import failed, reloading...")
        }
        throw error
    }
}

export { lazyRetry }
