import React from "react"
import GroupingContainer from "./GroupingContainer.tsx"
import { useLocation } from "react-router-dom"
import { useGroupingContext } from "../../contexts/GroupingContext.tsx"
import Button from "../global/Button.tsx"
import Stack from "../global/Stack.tsx"

const GroupingSpecific = () => {
    // get server name from path, like /grouping/thelanis or /grouping/ghallanda:
    const location = useLocation()
    const serverName = location.pathname.split("/")[2]
    const { sortBy, setSortBy } = useGroupingContext()

    return (
        <div>
            <Stack direction="row" gap="5px">
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
            </Stack>
            <GroupingContainer serverName={serverName ? serverName : ""} />
        </div>
    )
}

export default GroupingSpecific
