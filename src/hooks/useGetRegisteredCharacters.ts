import { useRegisteredCharactersContext } from "../contexts/RegisteredCharactersContext.tsx"

interface Props {
    enabled?: boolean
}

const useGetRegisteredCharacters = (_props: Props = {}) => {
    return useRegisteredCharactersContext()
}

export default useGetRegisteredCharacters
