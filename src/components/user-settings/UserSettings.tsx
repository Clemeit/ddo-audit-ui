import React from "react"
import { getUserSettings, postUserSettings } from "../../services/userService"
import Page from "../global/Page"
import { ContentCluster } from "../global/ContentCluster"
import Button from "../global/Button"
import Stack from "../global/Stack"
import logMessage from "../../utils/logUtils"
import ColoredText from "../global/ColoredText"
import { useWhoContext } from "../../contexts/WhoContext"
import ValidationMessage from "../global/ValidationMessage"
import { useLfmContext } from "../../contexts/LfmContext"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters"
import useGetFriends from "../../hooks/useGetFriends"
import useGetIgnores from "../../hooks/useGetIgnores"
import { AccessToken } from "../../models/Verification"
import {
    addAccessToken,
    addRegisteredCharacter,
    getBooleanFlags,
    setBooleanFlag,
} from "../../utils/localStorage"
import { useNotificationContext } from "../../contexts/NotificationContext"
import useFeatureCallouts from "../../hooks/useFeatureCallouts"
import { UserSettings as UserSettingsInterface } from "../../models/User"

const UserSettings = () => {
    const [userIdImportCode, setUserIdImportCode] = React.useState<string>("")
    const [userIdExportCode, setUserIdExportCode] = React.useState<string>("")
    const [didImportSettings, setDidImportSettings] =
        React.useState<boolean>(false)
    const [settingsNotFound, setSettingsNotFound] =
        React.useState<boolean>(false)

    const { createNotification } = useNotificationContext()
    const {
        exportSettings: exportWhoSettings,
        importSettings: importWhoSettings,
    } = useWhoContext()
    const {
        exportSettings: exportLfmSettings,
        importSettings: importLfmSettings,
    } = useLfmContext()
    const { registeredCharacters, accessTokens, verifiedCharacters } =
        useGetRegisteredCharacters()
    const { friends, addFriend } = useGetFriends()
    const { ignores, addIgnore } = useGetIgnores()
    const { dismissedCallouts, dismissCallout } = useFeatureCallouts()

    const exportSettings = async () => {
        try {
            let userId = localStorage.getItem("ddo_user_id")

            const registeredCharacterIds = registeredCharacters.map((c) => c.id)
            const verifiedCharacterIds = verifiedCharacters.map((c) => c.id)
            const friendIds = friends.map((f) => f.id)
            const ignoreIds = ignores.map((i) => i.id)
            const booleanFlags = getBooleanFlags()

            const settings: UserSettingsInterface = {
                whoSettings: exportWhoSettings(),
                lfmSettings: exportLfmSettings(),
                registeredCharacterIds,
                verifiedCharacterIds,
                accessTokens,
                friendIds,
                ignoreIds,
                booleanFlags,
                dismissedCallouts,
            }

            const response = await postUserSettings(settings, userId)
            if (response && response.data && response.data.user_id) {
                setUserIdExportCode(response.data.user_id)
                // Display or copy the code as needed
            }
        } catch (error) {
            logMessage("User settings export failed", "error", {
                metadata: { error: (error as Error).message },
            })
            console.error("Error exporting user settings:", error)
        }
    }

    const importSettings = async () => {
        if (
            userIdImportCode?.trim().length !== 6 ||
            !/^[A-Za-z]+$/.test(userIdImportCode.trim())
        ) {
            setSettingsNotFound(true)
            return
        }

        if (settingsNotFound) return

        try {
            const response = await getUserSettings(
                userIdImportCode.trim().toUpperCase()
            )

            if (!response || !response.data || !response.data.settings) {
                setSettingsNotFound(true)
                return
            }

            const settings = response.data.settings

            if (settings === null || typeof settings !== "object") {
                setSettingsNotFound(true)
                return
            }

            const failures: string[] = []

            try {
                const originatingUserId = response.data.originatingUserId
                if (originatingUserId) {
                    localStorage.setItem(
                        "originating_user_id",
                        originatingUserId
                    )
                }
            } catch (e) {}

            if (settings.whoSettings) {
                try {
                    const success = importWhoSettings(settings.whoSettings)
                    if (!success) {
                        createNotification({
                            title: "Who Settings",
                            message: "Failed to import Who settings.",
                            type: "error",
                            ttl: 5000,
                        })
                        failures.push("Who Settings")
                        logMessage("Failed to import Who settings", "error")
                    }
                } catch (e) {
                    logMessage("Failed to import Who settings", "error", {
                        metadata: { error: (e as Error).message },
                    })
                }
            }
            if (settings.lfmSettings) {
                try {
                    const success = importLfmSettings(settings.lfmSettings)
                    if (!success) {
                        createNotification({
                            title: "LFM Settings",
                            message: "Failed to import LFM settings.",
                            type: "error",
                            ttl: 5000,
                        })
                        failures.push("LFM Settings")
                        logMessage("Failed to import LFM settings", "error")
                    }
                } catch (e) {
                    logMessage("Failed to import LFM settings", "error", {
                        metadata: { error: (e as Error).message },
                    })
                }
            }
            if (settings.friendIds && Array.isArray(settings.friendIds)) {
                try {
                    const existingFriendIds = friends.map((f) => f.id)
                    settings.friendIds.forEach((friendId: number) => {
                        if (!existingFriendIds.includes(friendId)) {
                            addFriend({ id: friendId } as any)
                        }
                    })
                } catch (e) {
                    createNotification({
                        title: "Friends",
                        message: "Failed to import friends.",
                        type: "error",
                        ttl: 5000,
                    })
                    failures.push("Friends")
                    logMessage("Failed to import friends", "error", {
                        metadata: { error: (e as Error).message },
                    })
                }
            }
            if (settings.ignoreIds && Array.isArray(settings.ignoreIds)) {
                try {
                    const existingIgnoreIds = ignores.map((i) => i.id)
                    settings.ignoreIds.forEach((ignoreId: number) => {
                        if (!existingIgnoreIds.includes(ignoreId)) {
                            addIgnore({ id: ignoreId } as any)
                        }
                    })
                } catch (e) {
                    createNotification({
                        title: "Ignores",
                        message: "Failed to import ignores.",
                        type: "error",
                        ttl: 5000,
                    })
                    failures.push("Ignores")
                    logMessage("Failed to import ignores", "error", {
                        metadata: { error: (e as Error).message },
                    })
                }
            }
            if (settings.accessTokens && Array.isArray(settings.accessTokens)) {
                try {
                    const existingAccessTokenIds = accessTokens.map(
                        (t) => t.character_id
                    )
                    settings.accessTokens.forEach((token: AccessToken) => {
                        if (
                            token.character_id &&
                            !existingAccessTokenIds.includes(token.character_id)
                        ) {
                            addAccessToken(token)
                        }
                    })
                } catch (e) {
                    createNotification({
                        title: "Verified Characters",
                        message: "Failed to import verified characters.",
                        type: "error",
                        ttl: 5000,
                    })
                    failures.push("Verified Characters")
                    logMessage(
                        "Failed to import verified characters",
                        "error",
                        { metadata: { error: (e as Error).message } }
                    )
                }
            }
            if (
                settings.registeredCharacterIds &&
                Array.isArray(settings.registeredCharacterIds)
            ) {
                try {
                    const existingRegisteredCharacterIds =
                        registeredCharacters.map((c) => c.id)
                    settings.registeredCharacterIds.forEach(
                        (characterId: number) => {
                            if (
                                characterId &&
                                !existingRegisteredCharacterIds.includes(
                                    characterId
                                )
                            ) {
                                addRegisteredCharacter({
                                    id: characterId,
                                } as any)
                            }
                        }
                    )
                } catch (e) {
                    createNotification({
                        title: "Registered Characters",
                        message: "Failed to import registered characters.",
                        type: "error",
                        ttl: 5000,
                    })
                    failures.push("Registered Characters")
                    logMessage(
                        "Failed to import registered characters",
                        "error",
                        { metadata: { error: (e as Error).message } }
                    )
                }
            }
            if (
                settings.verifiedCharacterIds &&
                Array.isArray(settings.verifiedCharacterIds)
            ) {
                try {
                    const existingVerifiedCharacterIds = verifiedCharacters.map(
                        (c) => c.id
                    )
                    settings.verifiedCharacterIds.forEach(
                        (characterId: number) => {
                            if (
                                characterId &&
                                !existingVerifiedCharacterIds.includes(
                                    characterId
                                )
                            ) {
                                addRegisteredCharacter({
                                    id: characterId,
                                } as any)
                            }
                        }
                    )
                } catch (e) {
                    createNotification({
                        title: "Verified Characters",
                        message: "Failed to import verified characters.",
                        type: "error",
                        ttl: 5000,
                    })
                    failures.push("Verified Characters")
                    logMessage(
                        "Failed to import verified characters",
                        "error",
                        { metadata: { error: (e as Error).message } }
                    )
                }
            }
            if (settings.booleanFlags) {
                try {
                    Object.entries(settings.booleanFlags).forEach(
                        ([key, value]) => {
                            setBooleanFlag(key, value)
                        }
                    )
                } catch (e) {
                    createNotification({
                        title: "Settings",
                        message: "Failed to import some generic settings.",
                        type: "error",
                        ttl: 5000,
                    })
                    failures.push("Generic Settings")
                    logMessage("Failed to import generic settings", "error", {
                        metadata: { error: (e as Error).message },
                    })
                }
            }
            if (
                settings.dismissedCallouts &&
                Array.isArray(settings.dismissedCallouts)
            ) {
                try {
                    const existingDismissedCallouts = dismissedCallouts
                    settings.dismissedCallouts.forEach((callout: string) => {
                        if (
                            callout &&
                            !existingDismissedCallouts.includes(callout)
                        ) {
                            dismissCallout(callout)
                        }
                    })
                } catch (e) {
                    createNotification({
                        title: "Feature Callouts",
                        message: "Failed to import dismissed feature callouts.",
                        type: "error",
                        ttl: 5000,
                    })
                    failures.push("Feature Callouts")
                    logMessage(
                        "Failed to import dismissed feature callouts",
                        "error",
                        { metadata: { error: (e as Error).message } }
                    )
                }
            }

            setDidImportSettings(true)
            if (failures.length > 0) {
                createNotification({
                    title: "Import Completed with Some Failures",
                    message: `Some parts of your settings were not imported successfully: ${failures.join(
                        ", "
                    )}.`,
                    type: "warning",
                    ttl: 10000,
                })
            } else {
                createNotification({
                    title: "Import Successful",
                    message: "All your settings were imported successfully.",
                    type: "success",
                    ttl: 5000,
                })
                logMessage("User settings imported successfully", "info")
            }
        } catch (error) {
            if (
                error &&
                (error as any).response &&
                (error as any).response.status === 404
            ) {
                setSettingsNotFound(true)
                logMessage("User settings not found for provided code", "warn")
                return
            }

            logMessage("User settings import failed", "error", {
                metadata: { error: (error as Error).message },
            })
        }
    }

    const getBodyContent = () => {
        if (didImportSettings) {
            return (
                <p>
                    Your settings have been imported successfully! You may need
                    to refresh the page for all changes to take effect.
                </p>
            )
        }

        if (!!userIdExportCode) {
            return (
                <>
                    <p>
                        Navigate to this page on the device you want to import
                        your settings on, and enter the following one-time code.{" "}
                        <ColoredText color="orange">
                            This code can only be used once and will expire in 5
                            minutes.
                        </ColoredText>{" "}
                        If you want to import your settings on additional
                        devices, simply go back and export them again.
                    </p>
                    <code className="verification-code">
                        {userIdExportCode}
                    </code>
                    <p>
                        <ColoredText color="secondary">
                            Don't share this code with anyone!
                        </ColoredText>
                    </p>
                    <Button
                        type="secondary"
                        onClick={() => {
                            setUserIdExportCode("")
                        }}
                    >
                        Back
                    </Button>
                </>
            )
        }

        return (
            <>
                <p>
                    If you want to use DDO Audit on another device or browser,
                    you can export your settings and easily import them
                    elsewhere. There's no need to create an account or transfer
                    files.
                </p>
                <Stack direction="column" gap="10px" style={{ width: "100%" }}>
                    <div style={{ width: "100%" }}>
                        <h3
                            style={{
                                textDecoration: "underline",
                                marginTop: "10px",
                            }}
                        >
                            Export
                        </h3>
                        <p>Export your current settings:</p>
                        <Button
                            type="primary"
                            onClick={() => {
                                exportSettings()
                            }}
                            className="full-width-on-mobile"
                        >
                            Export Settings
                        </Button>
                    </div>
                    <div style={{ width: "100%" }}>
                        <h3
                            style={{
                                textDecoration: "underline",
                            }}
                        >
                            Import
                        </h3>
                        <p>
                            Already have a code? Enter it below to import your
                            settings. <strong>Remember:</strong> Codes can only
                            be used <u>once</u> and expire after 5 minutes.
                        </p>
                        <Stack
                            direction="column"
                            gap="10px"
                            style={{
                                width: "100%",
                            }}
                        >
                            <Stack
                                className="full-width-on-smallish-mobile"
                                direction="column"
                                gap="2px"
                                style={{
                                    boxSizing: "border-box",
                                    width: "100%",
                                }}
                            >
                                <label
                                    htmlFor="user-id-code"
                                    className="label"
                                    style={{
                                        color: "var(--secondary-text)",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Import Code
                                </label>
                                <Stack
                                    direction="column"
                                    gap="5px"
                                    style={{ width: "100%" }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Code"
                                        className="full-width-on-mobile"
                                        id="guild-name"
                                        value={userIdImportCode}
                                        onChange={(e) => {
                                            setUserIdImportCode(e.target.value)
                                            setSettingsNotFound(false)
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                importSettings()
                                            }
                                        }}
                                        style={{
                                            textTransform: "uppercase",
                                        }}
                                    />
                                    <ValidationMessage
                                        message="Invalid code"
                                        visible={settingsNotFound}
                                    />
                                </Stack>
                            </Stack>
                            <Button
                                type="secondary"
                                onClick={() => {
                                    importSettings()
                                }}
                                disabled={
                                    userIdImportCode.length === 0 ||
                                    settingsNotFound
                                }
                                className="full-width-on-mobile"
                            >
                                Import Settings
                            </Button>
                        </Stack>
                    </div>
                </Stack>
            </>
        )
    }

    return (
        <Page
            title="User Settings"
            description="Import and export user settings for use on other devices."
        >
            <ContentCluster title="User Settings">
                {getBodyContent()}
            </ContentCluster>
        </Page>
    )
}

export default UserSettings
