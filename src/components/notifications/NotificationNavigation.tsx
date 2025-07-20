// import React from "react"
// import Stack from "../global/Stack"
// import Button from "../global/Button"

// interface Props {
//     currentPage: number
//     setPage: (page: number) => void
//     isSubscribed: boolean
// }

// const NotificationNavigation = ({
//     currentPage,
//     setPage,
//     isSubscribed,
// }: Props) => {
//     const navItems = [
//         { page: 1, label: "Setup", description: "Enable notifications" },
//         {
//             page: 2,
//             label: "Rules",
//             description: "Create notification rules",
//             requiresSubscription: true,
//         },
//         {
//             page: 3,
//             label: "Preferences",
//             description: "Configure what to receive",
//             requiresSubscription: true,
//         },
//     ]

//     return (
//         <div
//             style={{
//                 marginBottom: "30px",
//                 padding: "20px",
//                 backgroundColor: "#f8f9fa",
//                 borderRadius: "8px",
//                 border: "1px solid #e9ecef",
//             }}
//         >
//             <Stack gap="10px" direction="row" justify="center" wrap>
//                 {navItems.map((item) => {
//                     const isActive = currentPage === item.page
//                     const isDisabled =
//                         item.requiresSubscription && !isSubscribed

//                     return (
//                         <div key={item.page} style={{ textAlign: "center" }}>
//                             <Button
//                                 type={isActive ? "primary" : "secondary"}
//                                 onClick={() => setPage(item.page)}
//                                 disabled={isDisabled}
//                                 style={{
//                                     minWidth: "120px",
//                                     opacity: isDisabled ? 0.6 : 1,
//                                 }}
//                             >
//                                 {item.label}
//                             </Button>
//                             <div
//                                 style={{
//                                     fontSize: "12px",
//                                     color: isDisabled ? "#999" : "#666",
//                                     marginTop: "4px",
//                                     maxWidth: "120px",
//                                 }}
//                             >
//                                 {item.description}
//                             </div>
//                         </div>
//                     )
//                 })}
//             </Stack>

//             {!isSubscribed && (
//                 <div
//                     style={{
//                         textAlign: "center",
//                         marginTop: "15px",
//                         fontSize: "14px",
//                         color: "#856404",
//                         fontStyle: "italic",
//                     }}
//                 >
//                     Enable notifications in Setup to access Rules and
//                     Preferences
//                 </div>
//             )}
//         </div>
//     )
// }

// export default NotificationNavigation
