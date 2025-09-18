function areArraysEqual(arr1: number[], arr2: number[]) {
    if (arr1.length !== arr2.length) return false
    const set1 = new Set(arr1)
    const set2 = new Set(arr2)
    return [...set1].every((value) => set2.has(value))
}

export { areArraysEqual }
