const SERVER_NAMES = [
    "Argonnessen",
    "Cannith",
    "Cormyr",
    "Ghallanda",
    "Khyber",
    "Orien",
    "Sarlona",
    "Thelanis",
    "Wayfinder",
    "Hardcore",
    "Shadowdale",
    "Thrane",
    "Moonsea"
]

const SERVER_NAMES_LOWER = SERVER_NAMES.map((server) => server.toLowerCase())

const VIP_SERVER_NAMES: string[] = []

const VIP_SERVER_NAMES_LOWER = VIP_SERVER_NAMES.map((server) =>
    server.toLowerCase()
)

const SERVERS_64_BITS: string[] = [
    "Cormyr",
    "Shadowdale",
    "Thrane",
    "Moonsea"
]

const SERVERS_64_BITS_LOWER = SERVERS_64_BITS.map((server) =>
    server.toLowerCase()
)

export {
    SERVER_NAMES,
    SERVER_NAMES_LOWER,
    VIP_SERVER_NAMES,
    VIP_SERVER_NAMES_LOWER,
    SERVERS_64_BITS,
    SERVERS_64_BITS_LOWER
}
