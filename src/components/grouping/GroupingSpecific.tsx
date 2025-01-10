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
import ContentCluster from "../global/ContentCluster.tsx"
import ExpandableContainer from "../global/ExpandableContainer.tsx"

const GroupingSpecific = () => {
    // get server name from path, like /grouping/thelanis or /grouping/ghallanda:
    const location = useLocation()
    const serverName = location.pathname.split("/")[2] || ""
    const {
        sortBy,
        setSortBy,
        fontSize,
        setFontSize,
        panelWidth,
        setPanelWidth,
        showBoundingBoxes,
        setShowBoundingBoxes,
        isDynamicWidth,
        setIsDynamicWidth,
        resetAll,
    } = useLfmContext()

    return (
        <Page
            title={`DDO Live LFM Viewer for ${toSentenceCase(serverName)}`}
            description={`Browse ${possessiveCase(toSentenceCase(serverName))} LFMs! Check the LFM panel before you login, or set up notifications and never miss raid night again!`}
            centered
            noPadding
            contentMaxWidth
        >
            <ExpandableContainer title="Options">
                <Stack direction="column" gap="10px">
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
                        onChange={(e) =>
                            setPanelWidth(parseInt(e.target.value))
                        }
                    />
                    <label htmlFor="showBoundingBoxes">
                        <input
                            type="checkbox"
                            id="showBoundingBoxes"
                            checked={showBoundingBoxes}
                            onChange={(e) =>
                                setShowBoundingBoxes(e.target.checked)
                            }
                        />
                        Show bounding boxes
                    </label>
                    <label htmlFor="dynamicWidth">
                        <input
                            type="checkbox"
                            id="dynamicWidth"
                            checked={isDynamicWidth}
                            onChange={(e) =>
                                setIsDynamicWidth(e.target.checked)
                            }
                        />
                        Dynamic width
                    </label>
                    <Button
                        onClick={resetAll}
                        type="secondary"
                        text="Reset all"
                    />
                </Stack>
            </ExpandableContainer>
            <GroupingContainer serverName={serverName ? serverName : ""} />
        </Page>
    )
}

export default GroupingSpecific
