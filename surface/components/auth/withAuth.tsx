import { useEffect } from "react"
import { Button } from "@tremor/react"

import { useRouter } from "next/router"
import { useUser } from "@auth0/nextjs-auth0"

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  const AuthWrapper: React.FC<P> = (props) => {
    const { user, error, isLoading } = useUser()
    const router = useRouter()

    useEffect(() => {
      if (error) {
        return
      }

      if (!isLoading && !user) {
        router.push("/api/auth/login")
      }
    }, [isLoading, user, error, router])

    if (isLoading || !user) {
      return (
        <div className="flex h-screen items-center justify-center">
          <Button loading={true} color="indigo" size="xl" variant="light" />
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }

  return AuthWrapper
}

export default withAuth
