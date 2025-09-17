import React from "react"
import { RangeEnum } from "../../models/Population"

const LevelPopulationDistribution = () => {
    const [dataMapping, setDataMapping] = useState<
        Record<RangeEnum, PopulationByHourAndDayOfWeekData | undefined>
    >({
        [RangeEnum.DAY]: undefined,
        [RangeEnum.WEEK]: undefined,
        [RangeEnum.MONTH]: undefined,
        [RangeEnum.QUARTER]: undefined,
        [RangeEnum.YEAR]: undefined,
    })

    return <div>LevelPopulationDistribution</div>
}

export default LevelPopulationDistribution
