function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: NodeJS.Timeout | null = null

    const debouncedFunction = (...args: any[]) => {
        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => func(...args), wait)
    }

    debouncedFunction.clear = () => {
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }
    }

    return debouncedFunction
}

export { debounce }
