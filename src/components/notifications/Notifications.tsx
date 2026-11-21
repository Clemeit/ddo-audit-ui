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
import { useSearchParams } from "react-router-dom"
import { useAppContext } from "../../contexts/AppContext"
import { useRegisteredCharactersContext } from "../../contexts/RegisteredCharactersContext"
import { AlertRule } from "../../models/Alert"
import {
    ALERT_GROUPS,
    AlertGroup,
    AlertTypeDefinition,
    getAlertTypeDefinition,
    getVisibleAlertTypes,
    SummaryHelpers,
} from "../alerts/types"
import { getFriends } from "../../utils/localStorage"
import { isExpired } from "../../utils/alertExpiry"
import RuleEditorModal from "./RuleEditorModal"
import RuleCard from "./RuleCard"
import NotificationGate from "./NotificationGate"
import DeviceBar from "./DeviceBar"
import useQuietHours from "./useQuietHours"
import useDeviceNotifications from "./useDeviceNotifications"
import { ReactComponent as AddSVG } from "../../assets/svg/add.svg"

type EditorState =
    | { mode: "closed" }
    | {
          mode: "create"
          // Limit the picker to these types (e.g. one section's), and start on one.
          types?: AlertTypeDefinition[]
          initialType?: string
          initialCriteria?: unknown
      }
    | { mode: "edit"; rule: AlertRule }

// Links can open the editor: /notifications?new=<type>, plus &item=<slug>&name=<name> for listings.
const NEW_PARAM = "new"
const ITEM_PARAM = "item"
const ITEM_NAME_PARAM = "name"
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function apiErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { response?: { data?: { error?: string } } })
        ?.response?.data?.error
    return typeof message === "string" && message ? message : fallback
}

const STEPS = [
    {
        title: "Choose what to watch",
        text: "LFMs for your quests and raids, servers going down or coming back, friends logging in, or Shard Exchange listings and bids.",
    },
    {
        title: "Turn on notifications",
        text: "Allow notifications on each device where you want to hear about it.",
    },
    {
        title: "Get alerted",
        text: "When it happens, DDO Audit lets you know, even when the site is closed.",
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
    const { config } = useAppContext()
    const { registeredCharacters, verifiedCharacters } =
        useRegisteredCharactersContext()
    const [searchParams, setSearchParams] = useSearchParams()
    const device = useDeviceNotifications()
    const quietHours = useQuietHours()
    const [editor, setEditor] = useState<EditorState>({ mode: "closed" })
    const [busyRuleId, setBusyRuleId] = useState<number | null>(null)

    // Re-render every minute so "Ends in …" and expired states stay current.
    const [, setTick] = useState(0)
    useEffect(() => {
        if (!rules.some((rule) => rule.expires_at)) return
        const interval = setInterval(() => setTick((t) => t + 1), 60_000)
        return () => clearInterval(interval)
    }, [rules])

    const visibleTypes = useMemo(() => getVisibleAlertTypes(config), [config])

    const helpers: SummaryHelpers = useMemo(() => {
        const names = new Map<number, string>()
        for (const c of [
            ...getFriends(),
            ...registeredCharacters,
            ...verifiedCharacters,
        ]) {
            if (c?.id != null && c.name) names.set(c.id, c.name)
        }
        return {
            questName: (id: number) => quests[id]?.name,
            characterName: (id: number) => names.get(id),
        }
        // `rules` is a dependency so the friends list is read again after a rule is saved.
    }, [quests, registeredCharacters, verifiedCharacters, rules])

    // Active alerts first, then paused, then expired; newest first within each.
    const sortedRules = useMemo(() => {
        const rank = (rule: AlertRule) =>
            isExpired(rule.expires_at) ? 2 : rule.enabled ? 0 : 1
        return [...rules].sort((a, b) => rank(a) - rank(b) || b.id - a.id)
    }, [rules])

    // Rules by section. Rules of a type this page doesn't know go in a last "Other" section.
    const rulesByGroup = useMemo(() => {
        const byGroup = new Map<string, AlertRule[]>()
        for (const rule of sortedRules) {
            const group = getAlertTypeDefinition(rule.type)?.group ?? "other"
            byGroup.set(group, [...(byGroup.get(group) ?? []), rule])
        }
        return byGroup
    }, [sortedRules])

    // Open the editor from a link (e.g. "Alert me when this is listed" on the Shard Exchange).
    useEffect(() => {
        const type = searchParams.get(NEW_PARAM)
        if (!type || !isLoggedIn) return
        const definition = visibleTypes.find((t) => t.type === type)
        if (definition) {
            const slug = (searchParams.get(ITEM_PARAM) || "").toLowerCase()
            const initialCriteria =
                type === "shard_exchange_listed" && SLUG_PATTERN.test(slug)
                    ? {
                          item_slug: slug,
                          item_name: searchParams.get(ITEM_NAME_PARAM) || null,
                      }
                    : undefined
            setEditor({ mode: "create", initialType: type, initialCriteria })
        }
        const next = new URLSearchParams(searchParams)
        for (const key of [NEW_PARAM, ITEM_PARAM, ITEM_NAME_PARAM])
            next.delete(key)
        setSearchParams(next, { replace: true })
    }, [searchParams, setSearchParams, isLoggedIn, visibleTypes])

    const openCreateForGroup = (group: AlertGroup) => {
        const groupTypes = visibleTypes.filter((t) => t.group === group.name)
        // No initialType: a group with several types opens on the type picker.
        setEditor({ mode: "create", types: groupTypes })
    }

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
            <h2>Never miss a thing</h2>
            <p>
                Tell DDO Audit what you care about and get a notification the
                moment it happens: an LFM for your favorite raid, a server
                coming back online, a friend logging in, or an item showing up
                on the Shard Exchange.
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
                        Create one to hear about LFMs, servers, friends and
                        more.
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
        const otherRules = rulesByGroup.get("other") ?? []
        return (
            <>
                {ALERT_GROUPS.map((group) => {
                    const groupRules = rulesByGroup.get(group.name) ?? []
                    const canCreate = visibleTypes.some(
                        (t) => t.group === group.name
                    )
                    if (!groupRules.length && !canCreate) return null
                    return (
                        <section
                            key={group.name}
                            className="alert-group"
                            aria-labelledby={`alert-group-${group.name}`}
                        >
                            <h3
                                id={`alert-group-${group.name}`}
                                className="alert-group-title"
                            >
                                {group.title}
                            </h3>
                            {groupRules.length ? (
                                renderRuleList(groupRules)
                            ) : (
                                <p className="alert-group-empty secondary-text">
                                    {group.emptyText}{" "}
                                    <button
                                        type="button"
                                        className="alert-group-add"
                                        onClick={() =>
                                            openCreateForGroup(group)
                                        }
                                    >
                                        Add one
                                    </button>
                                </p>
                            )}
                        </section>
                    )
                })}
                {otherRules.length > 0 && (
                    <section
                        className="alert-group"
                        aria-labelledby="alert-group-other"
                    >
                        <h3
                            id="alert-group-other"
                            className="alert-group-title"
                        >
                            Other
                        </h3>
                        {renderRuleList(otherRules)}
                    </section>
                )}
            </>
        )
    }

    const renderRuleList = (list: AlertRule[]) => (
        <ul className="alert-rule-list">
            {list.map((rule) => (
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

    const renderLoggedIn = () => {
        const { state } = device.device
        if (state === "gate" || state === "gate-blocked") {
            return <NotificationGate device={device} />
        }
        const existing = editor.mode === "edit" ? editor.rule : undefined
        return (
            <>
                <DeviceBar device={device} quietHours={quietHours} />
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
                        rules={rules}
                        types={
                            editor.mode === "create" && editor.types?.length
                                ? editor.types
                                : visibleTypes
                        }
                        initialType={
                            editor.mode === "create"
                                ? editor.initialType
                                : undefined
                        }
                        initialCriteria={
                            editor.mode === "create"
                                ? editor.initialCriteria
                                : undefined
                        }
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
            description="Get alerted about LFMs for your favorite quests, servers going offline or online, friends logging in, and the Shard Exchange."
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
