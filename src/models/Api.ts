enum LoadingState {
    Initial = "Initial",
    Loading = "Loading",
    Loaded = "Loaded",
    Error = "Error",
}

interface ApiState<T> {
    data: T | null
    loadingState: LoadingState
    error: string | null
}

export { LoadingState, ApiState }