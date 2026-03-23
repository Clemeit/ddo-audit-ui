import Page from "../global/Page"
import { useUserContext } from "../../contexts/UserContext"
import { ContentCluster, ContentClusterGroup } from "../global/ContentCluster"
import Button from "../global/Button"
import Stack from "../global/Stack"
import Skeleton from "../global/Skeleton"
import { useCallback, useEffect, useState } from "react"
import { getProfile } from "../../services/userService"
import { UserObject } from "../../models/Auth"
import FauxLink from "../global/FauxLink"
import YesNoModal from "../modal/YesNoModal"
import { useNotificationContext } from "../../contexts/NotificationContext"
import { notifyAuthError } from "../../utils/authNotifications"
import logMessage from "../../utils/logUtils"
import Badge from "../global/Badge"
import useWindowSize from "../../hooks/useWindowSize"
import PageMessage from "../global/PageMessage"

const Account = () => {
    const {
        isLoggedIn,
        openRegisterModal,
        openLoginModal,
        openChangePasswordModal,
        isLoading: isAuthLoading,
        accessToken,
        logout,
        deleteAccount,
        deleteSettings,
    } = useUserContext()
    const { createNotification } = useNotificationContext()
    const { isSmallishMobile } = useWindowSize()

    const [skeletonWidths] = useState<number[]>(() =>
        Array.from({ length: 3 }, () => Math.floor(Math.random() * 81) + 20)
    )
    const [userProfileData, setUserProfileData] = useState<UserObject>(null)
    const [isUserProfileLoading, setIsUserProfileLoading] =
        useState<boolean>(false)
    const [isUserProfileError, setIsUserProfileError] = useState<boolean>(false)
    const [showDeleteAccountModal, setShowDeleteAccountModal] =
        useState<boolean>(false)
    const [showDeleteSettingsModal, setShowDeleteSettingsModal] =
        useState<boolean>(false)

    const fetchUserProfile = useCallback(
        async (accessToken: string, signal: AbortSignal) => {
            setIsUserProfileLoading(true)
            try {
                const profileData = await getProfile(accessToken, signal)
                setUserProfileData(profileData?.data)
                setIsUserProfileError(false)
            } catch (error) {
                if ((error as { name?: string })?.name === "AbortError") {
                    return
                }
                logMessage("Failed to fetch user profile", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                })
                setIsUserProfileError(true)
            } finally {
                setIsUserProfileLoading(false)
            }
        },
        []
    )

    useEffect(() => {
        if (!accessToken || !isLoggedIn) return
        const controller = new AbortController()
        fetchUserProfile(accessToken, controller.signal)

        return () => controller.abort()
    }, [accessToken, isLoggedIn, fetchUserProfile])

    const handleLogout = useCallback(async () => {
        try {
            await logout()
        } catch (error) {
            logMessage("Logout from Account component failed", "error", {
                metadata: {
                    error:
                        error instanceof Error ? error.message : String(error),
                },
            })
            notifyAuthError(createNotification, "logout")
        }
    }, [logout, createNotification])

    const handleDeleteAccount = useCallback(async () => {
        try {
            await deleteAccount()
            setShowDeleteAccountModal(false)
        } catch (error) {
            logMessage(
                "Account deletion from Account component failed",
                "error",
                {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                }
            )
            notifyAuthError(createNotification, "delete-account")
        }
    }, [deleteAccount, createNotification])

    const handleDeleteSettings = useCallback(async () => {
        try {
            await deleteSettings()
            setShowDeleteSettingsModal(false)
        } catch (error) {
            logMessage(
                "Settings deletion from Account component failed",
                "error",
                {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                }
            )
            notifyAuthError(createNotification, "delete-settings")
        }
    }, [deleteSettings, createNotification])

    const notLoggedInScreen = (
        <div>
            <p>
                Create an account to sync your settings and character lists
                across all your devices.
            </p>
            <p>
                Register or log in to manage your DDO Audit account, update your
                password, and control saved settings and preferences.
            </p>
            <Stack gap="8px" style={{ marginBottom: "20px" }}>
                <Badge type="beta" text="Beta" />
                <span>This is a new feature and may contain bugs.</span>
            </Stack>
            <Stack gap="10px" wrap={isSmallishMobile}>
                <Button
                    type="primary"
                    onClick={() => openLoginModal()}
                    fullWidthOnMobile
                >
                    Log in
                </Button>
                <Button
                    type="secondary"
                    onClick={() => openRegisterModal()}
                    fullWidthOnMobile
                >
                    Register
                </Button>
            </Stack>
        </div>
    )

    const manageAccountScreen = (
        <div>
            <h3>Welcome back, {userProfileData?.username}!</h3>
            <p>
                Your account keeps your settings and character lists synced
                across devices. Manage your account and data below.
            </p>
            <label htmlFor="management-list">Account management:</label>
            <ul id="management-list">
                <li>
                    <FauxLink
                        style={{ color: "var(--text)" }}
                        onClick={() => openChangePasswordModal()}
                    >
                        Change password
                    </FauxLink>
                </li>
                <li>
                    <FauxLink
                        style={{ color: "var(--text)" }}
                        onClick={() => void handleLogout()}
                    >
                        Log out
                    </FauxLink>
                </li>
            </ul>
            <br />
            <label htmlFor="data-list">Manage your data:</label>
            <ul id="data-list">
                <li>
                    <FauxLink
                        style={{ color: "var(--text)" }}
                        onClick={() => setShowDeleteSettingsModal(true)}
                    >
                        Delete saved settings
                    </FauxLink>
                </li>
                <li>
                    <FauxLink
                        style={{ color: "var(--text)" }}
                        onClick={() => setShowDeleteAccountModal(true)}
                    >
                        Delete account
                    </FauxLink>
                </li>
            </ul>
        </div>
    )

    const getPageContent = () => {
        if (isUserProfileError) {
            return (
                <p>
                    There was an error loading your account profile. Please try
                    again later.
                </p>
            )
        }

        if (isAuthLoading || isUserProfileLoading) {
            return (
                <Stack direction="column" gap="10px">
                    {skeletonWidths.map((width, index) => (
                        <Skeleton
                            variant="rectangular"
                            width={`${width}%`}
                            key={`skel_${index}`}
                        />
                    ))}
                </Stack>
            )
        }

        if (isLoggedIn) {
            return manageAccountScreen
        }

        return notLoggedInScreen
    }

    const deleteAccountModal = (
        <YesNoModal
            onYes={() => void handleDeleteAccount()}
            onNo={() => setShowDeleteAccountModal(false)}
            title="Delete Account"
            critical
            fullScreenOnMobile
        >
            <p>Are you sure you want to delete your account?</p>
            <p>This action cannot be undone.</p>
        </YesNoModal>
    )

    const deleteSettingsModal = (
        <YesNoModal
            onYes={() => void handleDeleteSettings()}
            onNo={() => setShowDeleteSettingsModal(false)}
            title="Delete Saved Settings and Preferences"
            critical
            fullScreenOnMobile
        >
            <p>
                Are you sure you want to delete your saved settings and
                preferences?
            </p>
            <p>This action cannot be undone.</p>
        </YesNoModal>
    )

    return (
        <Page
            title="DDO Audit Account"
            description="Create a DDO Audit account to securely sync settings and character lists across devices, then manage your password, preferences, and saved data in one place."
        >
            {showDeleteAccountModal && deleteAccountModal}
            {showDeleteSettingsModal && deleteSettingsModal}
            <ContentClusterGroup>
                <ContentCluster title="DDO Audit Account">
                    {getPageContent()}
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Account
