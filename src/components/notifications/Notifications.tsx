import React, { useCallback, useEffect, useMemo, useState } from "react"
import "./Notifications.css"
import Page from "../global/Page"
import Button from "../global/Button"
import PageMessage from "../global/PageMessage"
import Skeleton from "../global/Skeleton"
import { useUserContext } from "../../contexts/UserContext"
import { useAlertContext } from "../../contexts/AlertContext"
import { useNotificationContext } from "../../contexts/NotificationContext"
import { useQuestContext } from "../../contexts/QuestContext"
import { AlertRule } from "../../models/Alert"
import { ALERT_TYPES, AlertTypeDefinition } from "../alerts/types"
import { isExpired } from "../../utils/alertExpiry"
import RuleEditorModal from "./RuleEditorModal"
import RuleCard from "./RuleCard"
import NotificationGate from "./NotificationGate"
import DeviceBar from "./DeviceBar"
import useDeviceNotifications from "./useDeviceNotifications"
import { ReactComponent as AddSVG } from "../../assets/svg/add.svg"

type EditorState =
    | { mode: "closed" }
    | { mode: "create" }
    | { mode: "edit"; rule: AlertRule }

function apiErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { response?: { data?: { error?: string } } })
        ?.response?.data?.error
    return typeof message === "string" && message ? message : fallback
}

const STEPS = [
    {
        title: "Pick your quests",
        text: "Choose the quests and raids you want, and optionally a server, level range and difficulty.",
    },
    {
        title: "Turn on notifications",
        text: "Allow notifications on each device where you want to hear about it.",
    },
    {
        title: "Get alerted",
        text: "When a matching LFM is posted, DDO Audit lets you know right away.",
    },
]

const Notifications = () => {
    const {
        isLoggedIn,
        isLoading: isAuthLoading,
        openLoginModal,
        openRegisterModal,
    } = useUserContext()
    const {
        rules,
        isLoadingRules,
        rulesError,
        reloadRules,
        createRule,
        updateRule,
        deleteRule,
    } = useAlertContext()
    const { createNotification } = useNotificationContext()
    const { quests } = useQuestContext()
    const device = useDeviceNotifications()
    const [editor, setEditor] = useState<EditorState>({ mode: "closed" })
    const [busyRuleId, setBusyRuleId] = useState<number | null>(null)

    // Re-render every minute so "Ends in …" and expired states stay current.
    const [, setTick] = useState(0)
    useEffect(() => {
        if (!rules.some((rule) => rule.expires_at)) return
        const interval = setInterval(() => setTick((t) => t + 1), 60_000)
        return () => clearInterval(interval)
    }, [rules])

    const helpers = useMemo(
        () => ({ questName: (id: number) => quests[id]?.name }),
        [quests]
    )

    // Active alerts first, then paused, then expired; newest first within each.
    const sortedRules = useMemo(() => {
        const rank = (rule: AlertRule) =>
            isExpired(rule.expires_at) ? 2 : rule.enabled ? 0 : 1
        return [...rules].sort((a, b) => rank(a) - rank(b) || b.id - a.id)
    }, [rules])

    const notifyError = useCallback(
        (error: unknown, fallback: string) =>
            createNotification({
                title: "Something went wrong",
                message: apiErrorMessage(error, fallback),
                type: "error",
                ttl: 5000,
            }),
        [createNotification]
    )

    const toggleRule = async (rule: AlertRule) => {
        setBusyRuleId(rule.id)
        try {
            await updateRule(rule.id, {
                type: rule.type,
                criteria: rule.criteria,
                enabled: !rule.enabled,
                expires_at: rule.expires_at,
            })
        } catch (error) {
            notifyError(error, "Couldn't update the alert.")
        } finally {
            setBusyRuleId(null)
        }
    }

    const removeRule = async (rule: AlertRule) => {
        setBusyRuleId(rule.id)
        try {
            await deleteRule(rule.id)
        } catch (error) {
            notifyError(error, "Couldn't delete the alert.")
        } finally {
            setBusyRuleId(null)
        }
    }

    const saveRule = async (
        definition: AlertTypeDefinition,
        criteria: unknown,
        expiresAt: string | null,
        existing?: AlertRule
    ): Promise<boolean> => {
        const input = {
            type: definition.type,
            criteria,
            // Renewing an expired alert turns it back on.
            enabled:
                !existing || isExpired(existing.expires_at)
                    ? true
                    : existing.enabled,
            expires_at: expiresAt,
        }
        try {
            if (existing) await updateRule(existing.id, input)
            else await createRule(input)
            setEditor({ mode: "closed" })
            return true
        } catch (error) {
            notifyError(error, "Couldn't save the alert.")
            return false
        }
    }

    const renderLoggedOut = () => (
        <div className="notifications-intro">
            <h2>Never miss an LFM</h2>
            <p>
                Tell DDO Audit which quests and raids you're after, and get a
                notification the moment someone posts an LFM for one of them,
                even when the site is closed.
            </p>
            <ol className="notifications-steps">
                {STEPS.map((step, i) => (
                    <li key={step.title}>
                        <span className="notifications-step-number">
                            {i + 1}
                        </span>
                        <div>
                            <strong>{step.title}</strong>
                            <p>{step.text}</p>
                        </div>
                    </li>
                ))}
            </ol>
            <p className="secondary-text">
                Alerts are saved to your account, so you'll need to log in.
            </p>
            <div className="notifications-intro-actions">
                <Button type="primary" onClick={openLoginModal}>
                    Log in
                </Button>
                <Button type="secondary" onClick={openRegisterModal}>
                    Create an account
                </Button>
            </div>
        </div>
    )

    const renderRules = () => {
        if (rulesError) {
            return (
                <PageMessage
                    type="error"
                    title="Couldn't load your alerts"
                    message={
                        <Button type="secondary" small onClick={reloadRules}>
                            Try again
                        </Button>
                    }
                />
            )
        }
        if (isLoadingRules && rules.length === 0) {
            return (
                <ul className="alert-rule-list" aria-busy>
                    {[0, 1].map((i) => (
                        <li key={i} className="alert-rule-card">
                            <Skeleton width="60%" height="20px" />
                        </li>
                    ))}
                </ul>
            )
        }
        if (sortedRules.length === 0) {
            return (
                <div className="alert-rules-empty">
                    <p>
                        <strong>No alerts yet.</strong>
                    </p>
                    <p className="secondary-text">
                        Create one to hear about LFMs for the quests and raids
                        you care about.
                    </p>
                    <Button
                        type="primary"
                        icon={<AddSVG />}
                        onClick={() => setEditor({ mode: "create" })}
                    >
                        Create your first alert
                    </Button>
                </div>
            )
        }
        return (
            <ul className="alert-rule-list">
                {sortedRules.map((rule) => (
                    <RuleCard
                        key={rule.id}
                        rule={rule}
                        helpers={helpers}
                        busy={busyRuleId === rule.id}
                        onToggle={toggleRule}
                        onEdit={(r) => setEditor({ mode: "edit", rule: r })}
                        onDelete={removeRule}
                    />
                ))}
            </ul>
        )
    }

    const renderLoggedIn = () => {
        const { state } = device.device
        if (state === "gate" || state === "gate-blocked") {
            return <NotificationGate device={device} />
        }
        const existing = editor.mode === "edit" ? editor.rule : undefined
        return (
            <>
                <DeviceBar device={device} />
                <section className="alert-rules" aria-labelledby="your-alerts">
                    <div className="alert-rules-header">
                        <h2 id="your-alerts">Your alerts</h2>
                        {sortedRules.length > 0 && (
                            <Button
                                type="primary"
                                small
                                icon={<AddSVG />}
                                onClick={() => setEditor({ mode: "create" })}
                            >
                                New alert
                            </Button>
                        )}
                    </div>
                    {renderRules()}
                </section>
                {editor.mode !== "closed" && (
                    <RuleEditorModal
                        key={existing?.id ?? "new"}
                        types={ALERT_TYPES}
                        existing={existing}
                        onSave={(definition, criteria, expiresAt) =>
                            saveRule(definition, criteria, expiresAt, existing)
                        }
                        onClose={() => setEditor({ mode: "closed" })}
                    />
                )}
            </>
        )
    }

    return (
        <Page
            title="Notifications"
            description="Get alerted when someone posts an LFM for your favorite quest or raid."
        >
            <div className="notifications-page">
                {isAuthLoading ? (
                    <Skeleton width="100%" height="120px" />
                ) : !isLoggedIn ? (
                    renderLoggedOut()
                ) : (
                    renderLoggedIn()
                )}
            </div>
        </Page>
    )
}

export default Notifications
