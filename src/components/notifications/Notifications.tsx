import { useCallback, useMemo, useState } from "react"
import "./Notifications.css"
import Page from "../global/Page"
import { ContentCluster, ContentClusterGroup } from "../global/ContentCluster"
import Stack from "../global/Stack"
import Button from "../global/Button"
import PageMessage from "../global/PageMessage"
import { useUserContext } from "../../contexts/UserContext"
import { useAlertContext } from "../../contexts/AlertContext"
import { useNotificationContext } from "../../contexts/NotificationContext"
import { useQuestContext } from "../../contexts/QuestContext"
import { AlertRule } from "../../models/Alert"
import {
    ALERT_TYPES,
    AlertTypeDefinition,
    getAlertTypeDefinition,
} from "../alerts/types"
import RuleEditor from "./RuleEditor"
import DeviceSettings from "./DeviceSettings"

type EditorState =
    | { mode: "closed" }
    | { mode: "create" }
    | { mode: "edit"; rule: AlertRule }

function apiErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { response?: { data?: { error?: string } } })
        ?.response?.data?.error
    return typeof message === "string" && message ? message : fallback
}

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
    const [editor, setEditor] = useState<EditorState>({ mode: "closed" })
    const [busyRuleId, setBusyRuleId] = useState<number | null>(null)

    const questName = useCallback((id: number) => quests[id]?.name, [quests])

    const sortedRules = useMemo(
        () => [...rules].sort((a, b) => a.id - b.id),
        [rules]
    )

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
        existing?: AlertRule
    ) => {
        const input = {
            type: definition.type,
            criteria,
            enabled: existing?.enabled ?? true,
            expires_at: existing?.expires_at ?? null,
        }
        try {
            if (existing) await updateRule(existing.id, input)
            else await createRule(input)
            setEditor({ mode: "closed" })
        } catch (error) {
            notifyError(error, "Couldn't save the alert.")
        }
    }

    const renderLoggedOut = () => (
        <ContentCluster title="Get alerted">
            <p>
                Tell DDO Audit what you care about and it will let you know when
                it happens. For example, get an alert when someone posts an LFM
                for your favorite raid on your server.
            </p>
            <p className="secondary-text">
                Alerts are tied to your account, so you'll need to log in.
            </p>
            <Stack direction="row" gap="10px" wrap>
                <Button type="primary" onClick={openLoginModal}>
                    Log in
                </Button>
                <Button type="secondary" onClick={openRegisterModal}>
                    Create an account
                </Button>
            </Stack>
        </ContentCluster>
    )

    const renderRule = (rule: AlertRule) => {
        const definition = getAlertTypeDefinition(rule.type)
        const busy = busyRuleId === rule.id
        return (
            <li
                key={rule.id}
                className={`alert-rule ${rule.enabled ? "" : "alert-rule-disabled"}`}
            >
                <div className="alert-rule-text">
                    <span className="alert-rule-type">
                        {definition?.label ?? rule.type}
                        {!rule.enabled && " (paused)"}
                    </span>
                    <span>
                        {definition
                            ? definition.summarize(rule.criteria, { questName })
                            : "This alert type isn't supported on this page yet."}
                    </span>
                </div>
                <Stack
                    direction="row"
                    gap="6px"
                    wrap
                    className="alert-rule-actions"
                >
                    <Button
                        type="secondary"
                        small
                        disabled={busy}
                        onClick={() => toggleRule(rule)}
                    >
                        {rule.enabled ? "Pause" : "Resume"}
                    </Button>
                    {definition && (
                        <Button
                            type="secondary"
                            small
                            disabled={busy}
                            onClick={() => setEditor({ mode: "edit", rule })}
                        >
                            Edit
                        </Button>
                    )}
                    <Button
                        type="secondary"
                        small
                        disabled={busy}
                        onClick={() => removeRule(rule)}
                    >
                        Delete
                    </Button>
                </Stack>
            </li>
        )
    }

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
            return <p className="secondary-text">Loading your alerts…</p>
        }
        return (
            <>
                {sortedRules.length === 0 ? (
                    <p className="secondary-text">
                        You don't have any alerts yet.
                    </p>
                ) : (
                    <ul className="alert-rule-list">
                        {sortedRules.map(renderRule)}
                    </ul>
                )}
                {editor.mode === "closed" && (
                    <Button
                        type="primary"
                        onClick={() => setEditor({ mode: "create" })}
                    >
                        New alert
                    </Button>
                )}
            </>
        )
    }

    const renderEditor = () => {
        if (editor.mode === "closed") return null
        const existing = editor.mode === "edit" ? editor.rule : undefined
        return (
            <ContentCluster title={existing ? "Edit alert" : "New alert"}>
                <RuleEditor
                    key={existing?.id ?? "new"}
                    types={ALERT_TYPES}
                    existing={existing}
                    onSave={(definition, criteria) =>
                        saveRule(definition, criteria, existing)
                    }
                    onCancel={() => setEditor({ mode: "closed" })}
                />
            </ContentCluster>
        )
    }

    return (
        <Page
            title="Notifications"
            description="Get alerted when someone posts an LFM for your favorite quest or raid."
        >
            <ContentClusterGroup>
                {isAuthLoading ? (
                    <p className="secondary-text">Loading…</p>
                ) : !isLoggedIn ? (
                    renderLoggedOut()
                ) : (
                    <>
                        <ContentCluster title="Your alerts">
                            {renderRules()}
                        </ContentCluster>
                        {renderEditor()}
                        <DeviceSettings />
                    </>
                )}
            </ContentClusterGroup>
        </Page>
    )
}

export default Notifications
