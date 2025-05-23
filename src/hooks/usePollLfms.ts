// import { useState, useEffect, useCallback } from "react"
// import { LoadingState, ApiState } from "../models/Api.ts"
// import { LfmApiDataModel, LfmApiServerModel } from "../models/Lfm.ts"
// import { getAllLfms, getLfmsByServerName } from "../services/lfmService.ts"

// interface UsePollLfmsParams {
//     refreshInterval: number
//     serverName: string
// }

// const usePollLfms = ({
//     serverName = "",
//     refreshInterval = 5000,
// }: UsePollLfmsParams) => {
//     const [pageLoadedAt] = useState<Date>(new Date())
//     const [lfmData, setLfmData] = useState<ApiState<LfmApiDataModel>>({
//         data: null,
//         loadingState: LoadingState.Initial,
//         error: null,
//     })

//     const mustReload =
//         new Date().getTime() - pageLoadedAt.getTime() > 1000 * 60 * 60 * 12

//     const fetchLfms = useCallback(() => {
//         if (mustReload) return

//         if (serverName) {
//             getLfmsByServerName(serverName)
//                 .then((response) => {
//                     const responseData = response.data
//                     const lfmData: LfmApiServerModel = responseData.data
//                     const lfmDataModel: LfmApiDataModel = {
//                         data: {
//                             [serverName]: lfmData,
//                         },
//                     }
//                     setLfmData({
//                         data: lfmDataModel,
//                         loadingState: LoadingState.Loaded,
//                         error: null,
//                     })
//                 })
//                 .catch((error: { message: string }) => {
//                     setLfmData({
//                         data: null,
//                         loadingState: LoadingState.Error,
//                         error: error.message,
//                     })
//                 })
//         } else {
//             getAllLfms()
//                 .then((response) => {
//                     const responseData = response.data
//                     const lfmData: LfmApiDataModel = responseData
//                     setLfmData({
//                         data: lfmData,
//                         loadingState: LoadingState.Loaded,
//                         error: null,
//                     })
//                 })
//                 .catch((error: { message: string }) => {
//                     setLfmData({
//                         data: null,
//                         loadingState: LoadingState.Error,
//                         error: error.message,
//                     })
//                 })
//         }
//     }, [mustReload, serverName])

//     useEffect(() => {
//         fetchLfms()
//         const interval = setInterval(fetchLfms, refreshInterval)
//         return () => clearInterval(interval)
//     }, [fetchLfms, refreshInterval])

//     return {
//         mustReload,
//         lfmData,
//         reload: fetchLfms,
//     }
// }

// export default usePollLfms
