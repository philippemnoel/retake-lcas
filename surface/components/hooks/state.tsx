import { createContext, useContext, useState } from "react"

interface Notification {
  title: string
  description: string
  type: string
  disappear?: boolean
}

interface AppState {
  playgroundOpen: boolean
  setPlaygroundOpen: React.Dispatch<React.SetStateAction<boolean>>
  notification?: Notification
  setNotification: React.Dispatch<
    React.SetStateAction<Notification | undefined>
  >
}

const defaultAppState: AppState = {
  playgroundOpen: false,
  notification: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setPlaygroundOpen: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setNotification: () => {},
}

const AppStateContext = createContext<AppState>(defaultAppState)

const useAppState = () => useContext(AppStateContext)

export default ({ children }: { children: React.ReactNode }) => {
  const [playgroundOpen, setPlaygroundOpen] = useState(false)
  const [notification, setNotification] = useState<Notification | undefined>(
    undefined
  )

  return (
    <AppStateContext.Provider
      value={{
        playgroundOpen,
        setPlaygroundOpen,
        notification,
        setNotification,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export { type Notification, useAppState }
