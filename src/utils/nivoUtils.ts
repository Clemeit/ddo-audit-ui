import { PopulationPointInTime } from "../models/Game"

export interface NivoSeries {
    id: string
    data: { x: string; y: number }[]
}

function convertToNivoFormat(data: PopulationPointInTime[]): NivoSeries[] {
    if (!data || data.length === 0) {
        return []
    }
    const series: NivoSeries[] = []
    data.forEach((point) => {
        if (point.data) {
            Object.entries(point.data).forEach(([serverName, dataPoint]) => {
                const existingSeries = series.find((s) => s.id === serverName)
                if (existingSeries) {
                    existingSeries.data.push({
                        x: point.timestamp || "",
                        y: dataPoint.character_count,
                    })
                } else {
                    series.push({
                        id: serverName,
                        data: [
                            {
                                x: point.timestamp || "",
                                y: dataPoint.character_count,
                            },
                        ],
                    })
                }
            })
        }
    })
    return series
}

export { convertToNivoFormat }
