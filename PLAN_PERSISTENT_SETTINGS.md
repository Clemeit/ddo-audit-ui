## Plan: Persistent Settings Cloud Sync

Implement a centralized sync orchestrator in UserContext that keeps existing localStorage behavior intact, fetches and applies server settings when auth becomes valid (server wins), and uploads local changes while logged in using a 1000ms debounced dirty-key queue. Keep backwards compatibility by preserving current local keys and formats; add only sync metadata keys. Use global notifications in App for sync outcomes and logged-out warnings.

**Steps**

1. Define sync scope, exclusions, and metadata keys in src/utils/localStorage.ts.
2. Add reusable sync helpers in src/utils/localStorage.ts. Depends on 1.
3. Add auth-coupled persistent sync state and lifecycle in src/contexts/UserContext.tsx. Depends on 1-2.
4. Implement initial server reconciliation flow in src/contexts/UserContext.tsx. Depends on 3.
   Phase details: on session-valid (login or refresh), call getPersistentSettings. If server settings are empty, upload one full local snapshot and mark everSynced. If server settings exist, apply server values to local storage (server wins), bump a revision counter, and mark everSynced.
5. Implement debounced incremental upload while logged in in src/contexts/UserContext.tsx. Depends on 3-4.
   Phase details: subscribe to local-storage write notifications from helper layer, track dirty keys, debounce 1000ms, and PUT only changed keys (merge semantics). Suppress writes during server-apply window and skip no-op uploads by comparing against last known server values.
6. Wire consumers to refresh after server settings are applied. Parallelizable after 4.
   Phase details: add effect listeners keyed by UserContext revision in src/contexts/LfmContext.tsx and src/contexts/WhoContext.tsx to re-run loadSettingsFromLocalStorage. Add equivalent refresh triggers in src/hooks/useGetCharacterList.ts, src/hooks/useGetRegisteredCharacters.ts, and src/hooks/useFeatureCallouts.ts.
7. Add user-facing notifications in src/components/app/App.tsx. Depends on 3-5.
   Phase details: show one info notification when server settings overwrite local settings, show success info when initial upload seeds server, and show one logged-out warning per browser session if everSynced is true.
8. Keep backwards compatibility and non-disruptive behavior. Depends on 1-7.
   Phase details: do not rename or migrate existing v1 keys. Continue local-only persistence when logged out. Exclude sensitive/non-settings keys from server payload: refresh_token, ddo_user_id, originating_user_id. Exclude v1-cached-areas and v1-cached-quests from sync.
9. Validate and harden edge cases. Depends on 1-8.
   Phase details: handle aborted requests, token loss during in-flight sync, malformed server payload values, and duplicate notification suppression.

**Relevant files**

- src/utils/localStorage.ts — add sync key filtering, snapshot/apply helpers, key exclusion constants, and local write subscription mechanism used by the sync queue.
- src/contexts/UserContext.tsx — host sync orchestrator, auth-triggered pull/push flows, debounce queue, server-wins reconciliation, revision signaling, and sync status flags.
- src/services/userService.ts — reuse getPersistentSettings and putPersistentSettings as-is for authenticated sync calls.
- src/hooks/userAuthedUserService.ts — optional reuse path if orchestration is moved out of UserContext later; no required change for v1.
- src/contexts/LfmContext.tsx — reload local settings when UserContext revision changes so active UI reflects server-wins updates.
- src/contexts/WhoContext.tsx — same revision-driven reload behavior as LFM context.
- src/hooks/useGetCharacterList.ts — reload friends/ignores list from local storage when revision changes.
- src/hooks/useGetRegisteredCharacters.ts — reload registered/verified character state when revision changes.
- src/hooks/useFeatureCallouts.ts — refresh dismissed callouts state when revision changes.
- src/components/app/App.tsx — issue global notifications (sync applied/seeded/logged-out warning) using NotificationContext + UserContext status.
- src/contexts/NotificationContext.tsx — existing notification API reused; no structural changes expected.

**Verification**

1. Logged-out local save behavior: change LFM/WHO/friends/ignores settings while logged out and confirm local storage updates continue with no persistent API calls.
2. First-login bootstrap: start with empty server settings and populated local settings, log in, verify one initial PUT uploads full snapshot and sets local everSynced metadata.
3. Server-wins reconcile: create divergent local and server settings, log in, verify local keys are overwritten by server values and UI state refreshes from revision-triggered reload.
4. Debounce behavior: rapidly change fontSize/mouseOverDelay and verify only one PUT per debounce window (1000ms) with merged dirty keys.
5. Incremental diff payloads: change one small setting and verify PUT payload includes only changed key(s), not full snapshot.
6. Logged-out warning UX: after any successful sync, log out and reload app; verify one per-session info notification appears and does not spam.
7. Session refresh path: with refresh_token present, reload app, verify auto-refresh login path triggers persistent fetch/apply without requiring manual login.
8. Regression checks: confirm cached-areas and cached-quests remain local-only; confirm refresh_token/ddo_user_id/originating_user_id are never sent to persistent settings endpoint.

**Decisions**

- Sync scope: all versioned localStorage settings except cached area/quest entries and sync metadata keys.
- Sensitive key exclusions: refresh_token, ddo_user_id, originating_user_id are never synced.
- Conflict policy: server wins on login/session validation.
- Upload policy: no upload unless logged in.
- First-login policy: if server has no persisted settings, upload current local snapshot once.
- Ongoing upload policy: partial updates are safe because PUT merges keys; use dirty-key diff with global debounce 1000ms.
- Logged-out UX: global info notification once per session when everSynced is true.
- Backup policy: no pre-overwrite backup snapshot.

**Further Considerations**

1. Consider adding a small dev-only debug panel later to inspect sync state (last sync time, dirty queue size, last error) to simplify QA.
2. Consider adding retry backoff and max queue age metrics if network instability causes repeated sync failures.
3. Consider eventually extracting the UserContext sync orchestrator into a dedicated hook once behavior stabilizes to reduce context size.
