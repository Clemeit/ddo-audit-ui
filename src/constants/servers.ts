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
]

const SERVER_NAMES_LOWER = SERVER_NAMES.map((server) => server.toLowerCase())

const VIP_SERVER_NAMES = ["Cormyr"]

const VIP_SERVER_NAMES_LOWER = VIP_SERVER_NAMES.map((server) =>
    server.toLowerCase()
)

export {
    SERVER_NAMES,
    SERVER_NAMES_LOWER,
    VIP_SERVER_NAMES,
    VIP_SERVER_NAMES_LOWER,
}
