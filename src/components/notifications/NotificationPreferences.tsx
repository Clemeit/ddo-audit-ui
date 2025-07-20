import React, { useState, useEffect } from "react"
import { ContentCluster, ContentClusterGroup } from "../global/ContentCluster"
import Stack from "../global/Stack"
import Button from "../global/Button"
import PageMessage from "../global/PageMessage"
import Spacer from "../global/Spacer"
import Link from "../global/Link"

interface NotificationPreferences {
    lfmUpdates: boolean
    raidAlerts: boolean
    guildEvents: boolean
    serverStatus: boolean
    questOfTheDay: boolean
    favoriteQuestAlerts: boolean
    instantNotifications: boolean
    digestNotifications: boolean
    scheduleStartHour: number
    scheduleEndHour: number
}

interface Props {
    isSubscribed: boolean
    onPreferencesChange: (preferences: NotificationPreferences) => void
    setPage: (page: number) => void
}

const NotificationPreferences = ({
    isSubscribed,
    onPreferencesChange,
    setPage,
}: Props) => {
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        lfmUpdates: true,
        raidAlerts: true,
        guildEvents: false,
        serverStatus: true,
        questOfTheDay: false,
        favoriteQuestAlerts: true,
        instantNotifications: true,
        digestNotifications: false,
        scheduleStartHour: 9,
        scheduleEndHour: 22,
    })

    useEffect(() => {
        // Load preferences from localStorage
        const savedPrefs = localStorage.getItem("notification_preferences")
        if (savedPrefs) {
            try {
                const parsed = JSON.parse(savedPrefs)
                setPreferences(parsed)
            } catch (error) {
                console.error("Error loading notification preferences:", error)
            }
        }
    }, [])

    useEffect(() => {
        // Save preferences to localStorage and notify parent
        localStorage.setItem(
            "notification_preferences",
            JSON.stringify(preferences)
        )
        onPreferencesChange(preferences)
    }, [preferences, onPreferencesChange])

    const handleToggle = (key: keyof NotificationPreferences) => {
        if (typeof preferences[key] === "boolean") {
            setPreferences((prev) => ({
                ...prev,
                [key]: !prev[key],
            }))
        }
    }

    const handleTimeChange = (
        key: "scheduleStartHour" | "scheduleEndHour",
        value: number
    ) => {
        setPreferences((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const PreferenceToggle = ({
        label,
        description,
        enabled,
        onChange,
    }: {
        label: string
        description: string
        enabled: boolean
        onChange: () => void
    }) => (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #eee",
            }}
        >
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        fontSize: "1.1rem",
                        fontWeight: "500",
                        marginBottom: "4px",
                    }}
                >
                    {label}
                </div>
                <div style={{ fontSize: "0.9rem" }}>{description}</div>
            </div>
            <Button
                type={enabled ? "primary" : "secondary"}
                onClick={onChange}
                disabled={!isSubscribed}
                style={{ minWidth: "80px" }}
            >
                {enabled ? "ON" : "OFF"}
            </Button>
        </div>
    )

    const TimeInput = ({
        label,
        value,
        onChange,
    }: {
        label: string
        value: number
        onChange: (value: number) => void
    }) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ minWidth: "60px", fontSize: "14px" }}>{label}:</span>
            <select
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                disabled={!isSubscribed}
                style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    backgroundColor: isSubscribed ? "white" : "#f5f5f5",
                }}
            >
                {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                        {i.toString().padStart(2, "0")}:00
                    </option>
                ))}
            </select>
        </div>
    )

    return (
        <>
            {!isSubscribed && (
                <PageMessage
                    title="Notifications Not Configured"
                    type="warning"
                    message={
                        <span>
                            You need to{" "}
                            <Link to="/notifications">
                                enable notifications
                            </Link>{" "}
                            first to configure your preferences.
                        </span>
                    }
                />
            )}
            <ContentClusterGroup>
                <ContentCluster title="Types of Notifications">
                    <div>
                        <PreferenceToggle
                            label="LFM Updates"
                            description="Get notified when an LFM matches your criteria"
                            enabled={preferences.lfmUpdates}
                            onChange={() => handleToggle("lfmUpdates")}
                        />

                        <PreferenceToggle
                            label="Server Status"
                            description="Get notified when the servers go down or come back up"
                            enabled={preferences.serverStatus}
                            onChange={() => handleToggle("serverStatus")}
                        />

                        <PreferenceToggle
                            label="Friends"
                            description="Get notified when your friends log in"
                            enabled={preferences.guildEvents}
                            onChange={() => handleToggle("guildEvents")}
                        />
                    </div>
                </ContentCluster>
                <ContentCluster title="Quiet Hours">
                    <div
                        style={{
                            padding: "15px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "4px",
                            marginBottom: "10px",
                        }}
                    >
                        <div
                            style={{
                                marginBottom: "10px",
                                fontSize: "14px",
                                color: "#666",
                            }}
                        >
                            Set hours when you don't want to receive
                            notifications
                        </div>
                        <Stack gap="15px" direction="row" align="center">
                            <TimeInput
                                label="Start"
                                value={preferences.scheduleStartHour}
                                onChange={(value) =>
                                    handleTimeChange("scheduleStartHour", value)
                                }
                            />
                            <TimeInput
                                label="End"
                                value={preferences.scheduleEndHour}
                                onChange={(value) =>
                                    handleTimeChange("scheduleEndHour", value)
                                }
                            />
                        </Stack>
                        <div
                            style={{
                                fontSize: "12px",
                                color: "#888",
                                marginTop: "8px",
                            }}
                        >
                            Notifications will be sent between{" "}
                            {preferences.scheduleEndHour}:00 and{" "}
                            {preferences.scheduleStartHour}:00
                        </div>
                    </div>

                    {isSubscribed && (
                        <div
                            style={{
                                padding: "15px",
                                backgroundColor: "#d1ecf1",
                                border: "1px solid #b6d4fe",
                                borderRadius: "4px",
                                fontSize: "14px",
                                color: "#0c5460",
                            }}
                        >
                            <strong>Preferences saved automatically.</strong>{" "}
                            Changes will take effect immediately for new
                            notifications.
                        </div>
                    )}
                </ContentCluster>
            </ContentClusterGroup>
            <Spacer size="20px" />
            <Stack>
                <Button
                    type="secondary"
                    onClick={() => setPage(1)}
                    style={{ minWidth: "120px" }}
                >
                    Back to Notifications
                </Button>
            </Stack>
        </>
    )
}

export default NotificationPreferences
