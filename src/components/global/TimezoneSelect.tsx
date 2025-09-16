import React, { useState } from "react"
import { useAppContext } from "../../contexts/AppContext.tsx"
import Stack from "./Stack.tsx"
import ColoredText from "../global/ColoredText.tsx"
import FauxLink from "../global/FauxLink.tsx"
import { ReactComponent as CloseSVG } from "../../assets/svg/close.svg"

interface IntlWithSupportedValuesOf extends Partial<typeof Intl> {
    supportedValuesOf?: (key: string) => string[]
}

const TimezoneSelect = () => {
    const [isTimezoneSelectShown, setIsTimezoneSelectShown] = useState(false)
    const { timezoneOverride, setTimezoneOverride } = useAppContext()

    const getTimezoneDisplay = () => {
        if (isTimezoneSelectShown) {
            return (
                <Stack
                    direction="row"
                    gap="5px"
                    align="center"
                    style={{ lineHeight: "1.7rem" }}
                >
                    <span>Timezone:</span>
                    <select
                        className="full-width-on-mobile"
                        id="timezoneSelect"
                        value={
                            timezoneOverride ||
                            Intl.DateTimeFormat().resolvedOptions().timeZone
                        }
                        onChange={(e) => {
                            setTimezoneOverride(e.target.value)
                            setIsTimezoneSelectShown(false)
                        }}
                    >
                        <option value="">(Use browser setting)</option>
                        {typeof (Intl as IntlWithSupportedValuesOf)
                            .supportedValuesOf === "function"
                            ? (Intl as IntlWithSupportedValuesOf)
                                  .supportedValuesOf!("timeZone").map(
                                  (tz: string) => (
                                      <option key={tz} value={tz}>
                                          {tz}
                                      </option>
                                  )
                              )
                            : [
                                  "UTC",
                                  "America/New_York",
                                  "America/Chicago",
                                  "America/Denver",
                                  "America/Los_Angeles",
                                  "Europe/London",
                                  "Europe/Paris",
                                  "Asia/Tokyo",
                                  "Australia/Sydney",
                              ].map((tz) => (
                                  <option key={tz} value={tz}>
                                      {tz}
                                  </option>
                              ))}
                    </select>
                    <CloseSVG
                        className="clickable-icon"
                        onClick={() => setIsTimezoneSelectShown(false)}
                    />
                </Stack>
            )
        }

        return (
            <Stack
                direction="row"
                gap="5px"
                align="center"
                style={{ lineHeight: "1.7rem" }}
            >
                <ColoredText color="secondary">Timezone:</ColoredText>
                <ColoredText color="secondary">
                    <FauxLink onClick={() => setIsTimezoneSelectShown(true)}>
                        {timezoneOverride ||
                            Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </FauxLink>
                </ColoredText>
            </Stack>
        )
    }

    return <div>{getTimezoneDisplay()}</div>
}

export default TimezoneSelect
