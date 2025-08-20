const SERVER_NAMES = Object.freeze([
    "Argonnessen",
    "Cannith",
    "Ghallanda",
    "Khyber",
    "Orien",
    "Sarlona",
    "Thelanis",
    "Wayfinder",
    "Cormyr",
    "Shadowdale",
    "Thrane",
    "Moonsea",
])

const SERVER_NAMES_LOWER = Object.freeze(
    SERVER_NAMES.map((server) => server.toLowerCase())
)

const VIP_SERVER_NAMES: readonly string[] = Object.freeze([])

const VIP_SERVER_NAMES_LOWER = VIP_SERVER_NAMES.map((server) =>
    server.toLowerCase()
)

const SERVERS_64_BITS: readonly string[] = Object.freeze([
    "Cormyr",
    "Shadowdale",
    "Thrane",
    "Moonsea",
])

const SERVERS_64_BITS_LOWER = Object.freeze(
    SERVERS_64_BITS.map((server) => server.toLowerCase())
)

const SERVERS_32_BITS: readonly string[] = Object.freeze(
    SERVER_NAMES.filter((server) => !SERVERS_64_BITS.includes(server))
)

const SERVERS_32_BITS_LOWER = Object.freeze(
    SERVERS_32_BITS.map((server) => server.toLowerCase())
)

const getServerIndex = (serverName: string): number => {
    return SERVER_NAMES_LOWER.indexOf(serverName.toLowerCase())
}

export {
    SERVER_NAMES,
    SERVER_NAMES_LOWER,
    VIP_SERVER_NAMES,
    VIP_SERVER_NAMES_LOWER,
    SERVERS_64_BITS,
    SERVERS_64_BITS_LOWER,
    SERVERS_32_BITS,
    SERVERS_32_BITS_LOWER,
    getServerIndex,
}
