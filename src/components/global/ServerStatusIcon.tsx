import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { ReactComponent as Pending } from "../../assets/svg/pending.svg"
import { ReactComponent as GreenPumpkin } from "../../assets/svg/green_pumpkin.svg"
import { ReactComponent as RedPumpkin } from "../../assets/svg/red_pumpkin.svg"
import { ReactComponent as BluePumpkin } from "../../assets/svg/blue_pumpkin.svg"
import { useMemo } from "react"
import { useAppContext } from "../../contexts/AppContext"
import { getIsNightRevels } from "../../utils/configUtils"

interface Props {
    type: "online" | "offline" | "indeterminate"
    className?: string
}

const ServerStatusIcon = ({
    type = "indeterminate",
    className = "",
}: Props) => {
    const { config } = useAppContext()
    const isNightRevels = useMemo(() => getIsNightRevels(config), [config])

    const getIcon = useMemo((): JSX.Element => {
        switch (type) {
            case "online":
                if (isNightRevels) {
                    return <GreenPumpkin className={className} title="Online" />
                } else {
                    return <Checkmark className={className} title="Online" />
                }
            case "offline":
                if (isNightRevels) {
                    return <RedPumpkin className={className} title="Offline" />
                } else {
                    return <X className={className} title="Offline" />
                }
            case "indeterminate":
                if (isNightRevels) {
                    return <BluePumpkin className={className} title="Loading" />
                } else {
                    return <Pending className={className} title="Loading" />
                }
        }
    }, [type, config])

    return getIcon
}

export default ServerStatusIcon
