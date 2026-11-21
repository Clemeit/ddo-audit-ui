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

import {
    defaultServerStatusCriteria,
    describeServerStatus,
    summarizeServerStatus,
    validateServerStatus,
} from "../serverStatus/summarize"
import {
    defaultFriendLoginCriteria,
    describeFriendLogin,
    summarizeFriendLogin,
    validateFriendLogin,
} from "../friendLogin/summarize"
import {
    defaultShardExchangeListedCriteria,
    describeShardExchangeListed,
    summarizeShardExchangeListed,
    validateShardExchangeListed,
} from "../shardExchangeListed/summarize"
import {
    defaultShardExchangeOutbidCriteria,
    describeShardExchangeOutbid,
    validateShardExchangeOutbid,
} from "../shardExchangeOutbid/summarize"
import {
    ALERT_GROUPS,
    ALERT_TYPES,
    getAlertTypeDefinition,
    getVisibleAlertTypes,
} from "../index"
import { SHARD_EXCHANGE_FEATURE_KEY } from "../../../../utils/configUtils"
import { ConfigEndpointResponse } from "../../../../models/Config"

const names: Record<number, string> = { 1: "Alpha", 2: "Bravo", 3: "Charlie" }
const characterName = (id: number) => names[id]

describe("server_status", () => {
    it("describes servers and direction", () => {
        const c = { ...defaultServerStatusCriteria(), server_names: ["Thrane"] }
        expect(describeServerStatus(c)).toEqual({
            title: "Thrane",
            chips: ["Goes offline or comes online"],
        })
        expect(
            summarizeServerStatus({ ...c, on_online: false, server_names: [] })
        ).toBe("Any server · goes offline")
    })

    it("needs a direction", () => {
        expect(validateServerStatus(defaultServerStatusCriteria())).toBeNull()
        expect(
            validateServerStatus({
                server_names: [],
                on_offline: false,
                on_online: false,
            })
        ).not.toBeNull()
    })
})

describe("friend_login", () => {
    it("defaults to all friends, which is valid", () => {
        const c = defaultFriendLoginCriteria()
        expect(c.all_friends).toBe(true)
        expect(validateFriendLogin(c)).toBeNull()
        expect(describeFriendLogin(c, characterName).title).toBe(
            "Any of my friends"
        )
    })

    it("lists picked friends by name", () => {
        const c = { all_friends: false, character_ids: [1, 2, 3, 99] }
        expect(summarizeFriendLogin(c, characterName)).toBe(
            "Alpha, Bravo, Charlie and 1 more logs in"
        )
        expect(describeFriendLogin(c, characterName).chips).toEqual([
            "4 friends",
        ])
    })

    it("needs someone when not all friends", () => {
        expect(
            validateFriendLogin({ all_friends: false, character_ids: [] })
        ).not.toBeNull()
    })
})

describe("shard_exchange_listed", () => {
    const listed = (overrides = {}) => ({
        ...defaultShardExchangeListedCriteria(),
        item_slug: "some-item",
        item_name: "Some Item",
        ...overrides,
    })

    it("needs an item and sane prices", () => {
        expect(
            validateShardExchangeListed(defaultShardExchangeListedCriteria())
        ).not.toBeNull()
        expect(validateShardExchangeListed(listed())).toBeNull()
        expect(
            validateShardExchangeListed(listed({ max_buyout: 0 }))
        ).not.toBeNull()
        expect(
            validateShardExchangeListed(listed({ max_price: 1.5 }))
        ).not.toBeNull()
    })

    it("describes the item, servers and price limits", () => {
        expect(
            describeShardExchangeListed(
                listed({ server_names: ["Thrane"], max_buyout: 50000 })
            )
        ).toEqual({
            title: "Some Item",
            chips: ["Thrane", "Buyout up to 50,000"],
        })
        expect(
            summarizeShardExchangeListed(
                listed({ require_buyout: true, max_price: 1000 })
            )
        ).toBe("Some Item on any server · Has a buyout · Bid up to 1,000")
    })
})

describe("shard_exchange_outbid", () => {
    it("defaults to all verified characters", () => {
        const c = defaultShardExchangeOutbidCriteria()
        expect(validateShardExchangeOutbid(c)).toBeNull()
        expect(describeShardExchangeOutbid(c, characterName).title).toBe(
            "All my verified characters"
        )
        expect(
            describeShardExchangeOutbid({ character_ids: [2] }, characterName)
        ).toEqual({ title: "Bravo", chips: ["1 character"] })
    })
})

describe("registry", () => {
    it("puts every type in a known group", () => {
        const groups = new Set(ALERT_GROUPS.map((g) => g.name))
        for (const t of ALERT_TYPES) expect(groups.has(t.group)).toBe(true)
        expect(getAlertTypeDefinition("server_status")?.group).toBe("servers")
    })

    it("hides Shard Exchange types until the feature flag is on", () => {
        const off = getVisibleAlertTypes(null).map((t) => t.type)
        expect(off).toContain("lfm_posted")
        expect(off).not.toContain("shard_exchange_listed")
        expect(off).not.toContain("shard_exchange_outbid")

        const config: ConfigEndpointResponse = {
            data: {
                [SHARD_EXCHANGE_FEATURE_KEY]: {
                    key: SHARD_EXCHANGE_FEATURE_KEY,
                    value: "",
                    is_enabled: true,
                },
            },
        }
        const on = getVisibleAlertTypes(config).map((t) => t.type)
        expect(on).toContain("shard_exchange_listed")
        expect(on).toContain("shard_exchange_outbid")
    })
})
