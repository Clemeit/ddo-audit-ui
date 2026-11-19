import {
    getCategories,
    getItem,
    getListings,
    getMyBids,
    listingQueryToApiParams,
} from "../shardExchangeService"
import { getRequest, postRequest } from "../apiHelper"
import { DEFAULT_LISTING_QUERY } from "../../utils/shardExchangeUtils"

jest.mock("../apiHelper", () => ({
    getRequest: jest.fn(),
    postRequest: jest.fn(),
}))

const mockedGetRequest = getRequest as jest.Mock
const mockedPostRequest = postRequest as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
    mockedGetRequest.mockResolvedValue({})
    mockedPostRequest.mockResolvedValue({})
})

describe("shardExchangeService", () => {
    describe("listingQueryToApiParams", () => {
        it("sends only what is set", () => {
            expect(
                listingQueryToApiParams("Thrane", DEFAULT_LISTING_QUERY)
            ).toEqual({
                server: "thrane",
                sort: "name",
                dir: "asc",
                page: 1,
                limit: 20,
            })
        })

        it("maps every filter to its API name", () => {
            expect(
                listingQueryToApiParams(
                    "cormyr",
                    {
                        q: "  jelly cake ",
                        category: "weapons.simple",
                        minLevel: 0,
                        maxLevel: 20,
                        buyoutOnly: true,
                        mine: true,
                        sort: "unit_buyout",
                        dir: "desc",
                        page: 3,
                    },
                    { item: "test-item", limit: 50 }
                )
            ).toEqual({
                server: "cormyr",
                q: "jelly cake",
                category: "weapons.simple",
                min_level: 0,
                max_level: 20,
                buyout_only: "true",
                item: "test-item",
                sort: "unit_buyout",
                dir: "desc",
                page: 3,
                limit: 50,
            })
        })
    })

    it("getListings calls the listings endpoint with the abort signal", async () => {
        const controller = new AbortController()
        await getListings("thrane", DEFAULT_LISTING_QUERY, {
            signal: controller.signal,
        })
        expect(mockedGetRequest).toHaveBeenCalledWith(
            "shard-exchange/listings",
            expect.objectContaining({
                signal: controller.signal,
                params: expect.objectContaining({ server: "thrane" }),
            })
        )
    })

    it("getCategories sends the server only when given", async () => {
        await getCategories()
        expect(mockedGetRequest).toHaveBeenLastCalledWith(
            "shard-exchange/categories",
            expect.objectContaining({ params: undefined })
        )
        await getCategories("Thrane")
        expect(mockedGetRequest).toHaveBeenLastCalledWith(
            "shard-exchange/categories",
            expect.objectContaining({ params: { server: "thrane" } })
        )
    })

    it("getItem puts the slug in the path", async () => {
        await getItem("test-item", "Thrane", { days: 7, bucket: "hour" })
        expect(mockedGetRequest).toHaveBeenCalledWith(
            "shard-exchange/items/test-item",
            expect.objectContaining({
                params: { server: "thrane", days: 7, bucket: "hour" },
            })
        )
    })

    it("getMyBids posts the tokens in the body, not the URL", async () => {
        const controller = new AbortController()
        await getMyBids(["tokenA", "tokenB"], controller.signal)
        expect(mockedGetRequest).not.toHaveBeenCalled()
        expect(mockedPostRequest).toHaveBeenCalledWith(
            "shard-exchange/my-bids",
            {
                data: { access_tokens: ["tokenA", "tokenB"] },
                signal: controller.signal,
            }
        )
    })
})
