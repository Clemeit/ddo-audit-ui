import React, { useMemo } from "react"
import { Link } from "react-router-dom"
import { FriendLoginCriteria } from "../../../../models/Alert"
import useGetFriends from "../../../../hooks/useGetFriends"
import PillToggleGroup from "../../../global/PillToggleGroup"
import type { CriteriaFormProps } from "../index"

const FriendLoginCriteriaForm = ({
    criteria,
    onChange,
}: CriteriaFormProps<FriendLoginCriteria>) => {
    const { friends } = useGetFriends()

    const options = useMemo(() => {
        const known = [...friends]
            .filter((f) => f.id != null)
            .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
            .map((f) => ({
                value: String(f.id),
                label: f.server_name
                    ? `${f.name} (${f.server_name})`
                    : (f.name ?? "Unknown character"),
            }))
        // Keep characters the rule already has, even if they were removed from the friends list.
        const knownIds = new Set(known.map((o) => o.value))
        const missing = (criteria.character_ids ?? [])
            .map(String)
            .filter((id) => !knownIds.has(id))
            .map((value) => ({ value, label: "Removed friend" }))
        return [...known, ...missing]
    }, [friends, criteria.character_ids])

    const selected = criteria.all_friends
        ? []
        : (criteria.character_ids ?? []).map(String)

    return (
        <div className="alert-form">
            <div className="alert-field">
                <span className="alert-field-label">Friends</span>
                {friends.length === 0 && (
                    <span className="alert-field-hint">
                        Your friends list is empty.{" "}
                        <Link to="/friends">Add some friends</Link>, or keep
                        &ldquo;All my friends&rdquo; to hear about anyone you
                        add later.
                    </span>
                )}
                <PillToggleGroup
                    ariaLabel="Friends"
                    anyLabel="All my friends"
                    options={options}
                    selected={selected}
                    onChange={(ids) =>
                        onChange(
                            ids.length === 0
                                ? { all_friends: true, character_ids: [] }
                                : {
                                      all_friends: false,
                                      character_ids: ids.map(Number),
                                  }
                        )
                    }
                />
                <span className="alert-field-hint">
                    &ldquo;All my friends&rdquo; follows your friends list as it
                    changes. Anonymous characters don&rsquo;t trigger alerts.
                </span>
            </div>
        </div>
    )
}

export default FriendLoginCriteriaForm
