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
import axios from "axios"

const Account = () => {
    const {
        isLoggedIn,
        openRegisterModal,
        openLoginModal,
        openChangePasswordModal,
        isLoading: isAuthLoading,
        authedRequest,
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
    const [deletePassword, setDeletePassword] = useState<string>("")
    const [deleteAccountError, setDeleteAccountError] = useState<string>("")

    const fetchUserProfile = useCallback(
        async (signal: AbortSignal) => {
            setIsUserProfileLoading(true)
            try {
                const profileData = await authedRequest((token) =>
                    getProfile(token, signal)
                )
                setUserProfileData(profileData?.data)
                setIsUserProfileError(false)
            } catch (error) {
                const name = (error as { name?: string })?.name
                // Aborted, or the session ended (the logged-out view takes over).
                if (name === "AbortError" || name === "NotLoggedInError") {
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
        [authedRequest]
    )

    // Once per login, not on every access-token refresh.
    useEffect(() => {
        if (!isLoggedIn) return
        const controller = new AbortController()
        void fetchUserProfile(controller.signal)

        return () => controller.abort()
    }, [isLoggedIn, fetchUserProfile])

    const closeDeleteAccountModal = useCallback(() => {
        setShowDeleteAccountModal(false)
        setDeletePassword("")
        setDeleteAccountError("")
    }, [])

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
        if (!deletePassword) {
            setDeleteAccountError("Enter your password to confirm.")
            return
        }
        try {
            await deleteAccount(deletePassword)
            closeDeleteAccountModal()
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                setDeleteAccountError("That password is incorrect.")
                return
            }
            if (axios.isAxiosError(error) && error.response?.status === 429) {
                setDeleteAccountError(
                    "Too many attempts. Please try again later."
                )
                return
            }
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
    }, [deleteAccount, deletePassword, closeDeleteAccountModal, createNotification])

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
            onNo={closeDeleteAccountModal}
            title="Delete Account"
            critical
            fullScreenOnMobile
        >
            <p>Are you sure you want to delete your account?</p>
            <p>This action cannot be undone.</p>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    void handleDeleteAccount()
                }}
                style={{ marginBottom: "15px" }}
            >
                <label htmlFor="delete-account-password">
                    Enter your password to confirm:
                </label>
                <input
                    id="delete-account-password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={deletePassword}
                    onChange={(e) => {
                        setDeletePassword(e.target.value)
                        setDeleteAccountError("")
                    }}
                    style={{ width: "100%", boxSizing: "border-box" }}
                />
                {deleteAccountError && (
                    <p role="alert" style={{ color: "var(--error)" }}>
                        {deleteAccountError}
                    </p>
                )}
            </form>
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
