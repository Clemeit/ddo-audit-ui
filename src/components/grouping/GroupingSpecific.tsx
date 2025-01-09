import React from "react"
import GroupingContainer from "./LfmContainer.tsx"
import { useLocation } from "react-router-dom"
import { useLfmContext } from "../../contexts/LfmContext.tsx"
import Button from "../global/Button.tsx"
import Stack from "../global/Stack.tsx"
import {
    MAXIMUM_LFM_PANEL_WIDTH,
    MINIMUM_LFM_PANEL_WIDTH,
} from "../../constants/lfmPanel.ts"
import Page from "../global/Page.tsx"
import { possessiveCase, toSentenceCase } from "../../utils/stringUtils.ts"

const GroupingSpecific = () => {
    // get server name from path, like /grouping/thelanis or /grouping/ghallanda:
    const location = useLocation()
    const serverName = location.pathname.split("/")[2] || ""
    // const {
    //     sortBy,
    //     setSortBy,
    //     fontSize,
    //     setFontSize,
    //     panelWidth,
    //     setPanelWidth,
    //     showBoundingBoxes,
    //     setShowBoundingBoxes,
    // } = useLfmContext()

    return (
        <Page
            title={`DDO Live LFM Viewer for ${toSentenceCase(serverName)}`}
            description={`Browse ${possessiveCase(toSentenceCase(serverName))} LFMs! Check the LFM panel before you login, or set up notifications and never miss raid night again!`}
            centered
            noPadding
        >
            {/* <Stack direction="row" gap="5px">
                <Button
                    onClick={() => {
                        switch (sortBy.type) {
                            case "level":
                                setSortBy({ type: "leader", direction: "asc" })
                                break
                            case "leader":
                                setSortBy({ type: "quest", direction: "asc" })
                                break
                            case "quest":
                                setSortBy({ type: "classes", direction: "asc" })
                                break
                            case "classes":
                                setSortBy({ type: "level", direction: "asc" })
                                break
                            default:
                                setSortBy({ type: "level", direction: "asc" })
                                break
                        }
                    }}
                    type="secondary"
                    text={`Sort by ${sortBy.type}`}
                />
                <Button
                    onClick={() => {
                        if (sortBy.direction === "asc") {
                            setSortBy({ type: sortBy.type, direction: "desc" })
                        } else {
                            setSortBy({ type: sortBy.type, direction: "asc" })
                        }
                    }}
                    type="secondary"
                    text={`Sort ${sortBy.direction === "asc" ? "ascending" : "descending"}`}
                />
                <input
                    type="range"
                    min={10}
                    max={20}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                />
                <input
                    type="range"
                    min={MINIMUM_LFM_PANEL_WIDTH}
                    max={MAXIMUM_LFM_PANEL_WIDTH}
                    value={panelWidth}
                    onChange={(e) => setPanelWidth(parseInt(e.target.value))}
                />
                <input
                    type="checkbox"
                    id="showBoundingBoxes"
                    checked={showBoundingBoxes}
                    onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                />
                <label htmlFor="showBoundingBoxes">Show bounding boxes</label>
            </Stack> */}
            <GroupingContainer serverName={serverName ? serverName : ""} />
        </Page>
    )
}

export default GroupingSpecific
