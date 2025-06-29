enum LoadingState {
    Initial = "Initial",
    Loading = "Loading",
    Loaded = "Loaded",
    Error = "Error",
    Haulted = "Haulted",
}

interface ApiState<T> {
    data: T | null
    loadingState: LoadingState
    error: string | null
}

export { LoadingState }
export type { ApiState }
