// The registry pulls in the criteria forms (and through them contexts and the API client); none
// of that is under test here.
jest.mock("../lfmPosted/LfmPostedCriteriaForm", () => () => null)
jest.mock("../serverStatus/ServerStatusCriteriaForm", () => () => null)
jest.mock("../friendLogin/FriendLoginCriteriaForm", () => () => null)
jest.mock(
    "../shardExchangeListed/ShardExchangeListedCriteriaForm",
    () => () => null
)
jest.mock(
    "../shardExchangeOutbid/ShardExchangeOutbidCriteriaForm",
    () => () => null
)
jest.mock("../../../../utils/logUtils", () => ({
    __esModule: true,
    default: jest.fn(),
}))

import { AlertRule } from "../../../../models/Alert"
import { findDuplicateRule, getAlertTypeDefinition } from ".."

const rule = (id: number, type: string, criteria: unknown): AlertRule => ({
    id,
    type,
    criteria,
    enabled: true,
    expires_at: null,
    created_at: "2026-11-20T00:00:00Z",
    updated_at: "2026-11-20T00:00:00Z",
})

const serverStatus = getAlertTypeDefinition("server_status")!
const listed = getAlertTypeDefinition("shard_exchange_listed")!
const anyServerOnline = {
    server_names: [],
    on_offline: false,
    on_online: true,
}

describe("findDuplicateRule", () => {
    it("finds a rule with the same type and criteria", () => {
        const rules = [rule(1, "server_status", anyServerOnline)]
        expect(
            findDuplicateRule(rules, serverStatus, { ...anyServerOnline })?.id
        ).toBe(1)
    })

    it("ignores list order and key order", () => {
        const rules = [
            rule(1, "server_status", {
                on_online: true,
                on_offline: false,
                server_names: ["Cannith", "Argonnessen"],
            }),
        ]
        expect(
            findDuplicateRule(rules, serverStatus, {
                ...anyServerOnline,
                server_names: ["Argonnessen", "Cannith"],
            })?.id
        ).toBe(1)
    })

    it("does not match different criteria or another type", () => {
        const rules = [
            rule(1, "server_status", { ...anyServerOnline, on_offline: true }),
            rule(2, "lfm_posted", anyServerOnline),
        ]
        expect(
            findDuplicateRule(rules, serverStatus, anyServerOnline)
        ).toBeUndefined()
    })

    it("skips the rule being edited", () => {
        const rules = [rule(1, "server_status", anyServerOnline)]
        expect(
            findDuplicateRule(rules, serverStatus, anyServerOnline, 1)
        ).toBeUndefined()
    })

    it("ignores display-only fields", () => {
        const rules = [
            rule(1, "shard_exchange_listed", {
                item_slug: "some-item",
                item_name: "Some Item",
                server_names: [],
                max_buyout: null,
                max_price: null,
                require_buyout: false,
            }),
        ]
        expect(
            findDuplicateRule(rules, listed, {
                item_slug: "some-item",
                item_name: null,
                server_names: [],
                max_buyout: null,
                max_price: null,
                require_buyout: false,
            })?.id
        ).toBe(1)
    })
})
