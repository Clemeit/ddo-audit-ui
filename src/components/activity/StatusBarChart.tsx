import React, { useMemo } from "react"
import {
    BarChart,
    Bar,
    Rectangle,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Label,
} from "recharts"
import { ActivityEvent } from "../../models/Activity"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils.ts"

interface Props {
    statusActivity: ActivityEvent[]
    locationActivity: ActivityEvent[]
}

const StatusBarChart = ({ statusActivity, locationActivity }: Props) => {
    const statusData = useMemo(() => {
        if (statusActivity.length === 0) return []
        const activityCopy = [
            ...statusActivity.filter(
                (event) =>
                    new Date().getTime() - new Date(event.timestamp).getTime() <
                    1000 * 60 * 60 * 24 * 8
            ),
        ]
        console.log("activityCopy", activityCopy)

        const days: { [key: string]: number } = {}
        // let totalTime = 0
        let startTime: Date | null = null

        const earliestEventDate = new Date(
            activityCopy.reduce((a, b) =>
                a.timestamp < b.timestamp ? a : b
            ).timestamp
        )
        // fill in days with every day from earliest event to today
        for (
            let date = new Date(earliestEventDate);
            date <= new Date();
            date.setDate(date.getDate() + 1)
        ) {
            days[date.toDateString()] = 0
        }

        activityCopy
            .sort((a, b) => {
                return (
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                )
            })
            .forEach((event) => {
                const eventDate = new Date(event.timestamp).toDateString()
                if (!(eventDate in days)) {
                    days[eventDate] = 0
                }

                if (event.data?.value === true) {
                    // log in
                    startTime = new Date(event.timestamp)
                } else {
                    // log off
                    if (startTime) {
                        const endTime = new Date(event.timestamp)
                        while (startTime < endTime) {
                            const startOfNextDay = new Date(startTime)
                            startOfNextDay.setHours(24, 0, 0, 0)
                            const timeSpent = Math.min(
                                endTime.getTime() - startTime.getTime(),
                                startOfNextDay.getTime() - startTime.getTime()
                            )
                            const currentDay = startTime.toDateString()
                            days[currentDay] += timeSpent
                            // totalTime += timeSpent
                            startTime = startOfNextDay
                        }
                        startTime = null
                    }
                }
            })

        // if the last event is log in, add the time from that event to now
        if (startTime) {
            const endTime = new Date()
            while (startTime < endTime) {
                const startOfNextDay = new Date(startTime)
                startOfNextDay.setHours(24, 0, 0, 0)
                const timeSpent = Math.min(
                    endTime.getTime() - startTime.getTime(),
                    startOfNextDay.getTime() - startTime.getTime()
                )
                const currentDay = startTime.toDateString()
                days[currentDay] += timeSpent
                // totalTime += timeSpent
                startTime = startOfNextDay
            }
        }

        // console.log(days)
        // console.log(convertMillisecondsToPrettyString(totalTime))
        // console.log(
        //     Object.entries(days).map(([date, time]) => ({
        //         date,
        //         playtime: time,
        //     }))
        // )

        return Object.entries(days)
            .map(([date, time]) => ({
                date,
                playtime: time,
            }))
            .slice(-7)
    }, [statusActivity])

    const locationData = useMemo(() => {
        if (locationActivity.length === 0) return []
        const activityCopy = [
            ...locationActivity.filter(
                (event) =>
                    new Date().getTime() - new Date(event.timestamp).getTime() <
                    1000 * 60 * 60 * 24 * 8
            ),
        ]

        const days: { [key: string]: number } = {}
        let totalTime = 0
        let startTime: Date | null = null

        const earliestEventDate = new Date(
            activityCopy.reduce((a, b) =>
                a.timestamp < b.timestamp ? a : b
            ).timestamp
        )
        // fill in days with every day from earliest event to today
        for (
            let date = new Date(earliestEventDate);
            date <= new Date();
            date.setDate(date.getDate() + 1)
        ) {
            days[date.toDateString()] = 0
        }

        console.log(
            "bbbbbbp",
            activityCopy.sort((a, b) => {
                return (
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                )
            })
        )

        activityCopy
            .sort((a, b) => {
                return (
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                )
            })
            .forEach((event) => {
                const eventDate = new Date(event.timestamp).toDateString()
                if (!(eventDate in days)) {
                    days[eventDate] = 0
                }

                if (event.data?.is_public_space === false) {
                    // log in
                    if (!startTime) startTime = new Date(event.timestamp)
                } else {
                    // log off
                    if (startTime) {
                        const endTime = new Date(event.timestamp)
                        while (startTime < endTime) {
                            const startOfNextDay = new Date(startTime)
                            startOfNextDay.setHours(24, 0, 0, 0)
                            const timeSpent = Math.min(
                                endTime.getTime() - startTime.getTime(),
                                startOfNextDay.getTime() - startTime.getTime()
                            )
                            const currentDay = startTime.toDateString()
                            days[currentDay] += timeSpent
                            totalTime += timeSpent
                            startTime = startOfNextDay
                        }
                        startTime = null
                    }
                }
            })

        // if the last event is log in, add the time from that event to now
        if (startTime) {
            const endTime = new Date()
            while (startTime < endTime) {
                const startOfNextDay = new Date(startTime)
                startOfNextDay.setHours(24, 0, 0, 0)
                const timeSpent = Math.min(
                    endTime.getTime() - startTime.getTime(),
                    startOfNextDay.getTime() - startTime.getTime()
                )
                const currentDay = startTime.toDateString()
                days[currentDay] += timeSpent
                totalTime += timeSpent
                startTime = startOfNextDay
            }
        }

        // console.log(days)
        // console.log(convertMillisecondsToPrettyString(totalTime))
        // console.log(
        //     Object.entries(days).map(([date, time]) => ({
        //         date,
        //         playtime: time,
        //     }))
        // )

        return Object.entries(days)
            .map(([date, time]) => ({
                date,
                questtime: time,
            }))
            .slice(-7)
    }, [locationActivity])

    const data = useMemo(() => {
        const status = statusData
        const location = locationData
        return status.map((day) => ({
            date: day.date,
            playtime: day.playtime,
            questtime:
                location.find((entry) => entry.date === day.date)?.questtime ||
                0,
        }))
    }, [statusActivity, locationActivity])

    return (
        <div
            style={{
                width: "100%",
                height: "500px",
            }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    width={500}
                    height={300}
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 45,
                        bottom: 15,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date">
                        <Label
                            value="Date"
                            offset={-10}
                            position="insideBottom"
                        />
                    </XAxis>
                    <YAxis>
                        <Label
                            value="Time online"
                            angle={-90}
                            offset={-35}
                            position="insideLeft"
                        />
                    </YAxis>
                    <Tooltip
                        formatter={(value: number, name: string) => {
                            if (name === "playtime") {
                                return [
                                    value
                                        ? convertMillisecondsToPrettyString(
                                              value
                                          )
                                        : "No activity",
                                    "Online for",
                                ]
                            } else {
                                return [
                                    value
                                        ? convertMillisecondsToPrettyString(
                                              value
                                          )
                                        : "No activity",
                                    "In quests for",
                                ]
                            }
                        }}
                        contentStyle={{
                            backgroundColor: "var(--background-light)",
                        }}
                        cursor={<Rectangle fill="var(--highlight)" />}
                    />
                    <Bar
                        dataKey="playtime"
                        fill="#8884d8"
                        activeBar={<Rectangle fill="#9998d8" />}
                    />
                    <Bar
                        dataKey="questtime"
                        fill="#e2a93f"
                        activeBar={<Rectangle fill="#e0b159" />}
                    />
                    <Legend height={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default StatusBarChart
