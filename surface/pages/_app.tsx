import "./global.css"
import "@tremor/react/dist/esm/tremor.css"

import type { AppProps } from "next/app"

import { UserProvider } from "@auth0/nextjs-auth0"
import { IntercomProvider } from "react-use-intercom"
import AppStateProvider from "@/components/hooks/state"

import { useEffect } from "react"
import { useRouter } from "next/router"

import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
  })
  posthog.debug(false)
}

export default ({ Component, pageProps }: AppProps) => {
  const router = useRouter()

  useEffect(() => {
    // Track page views
    const handleRouteChange = () => posthog?.capture("$pageview")
    router.events.on("routeChangeComplete", handleRouteChange)

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange)
    }
  }, [])

  return (
    <UserProvider>
      <PostHogProvider client={posthog}>
        <IntercomProvider appId="k8wp5os9" autoBoot>
          <AppStateProvider>
            <Component {...pageProps} />
          </AppStateProvider>
        </IntercomProvider>
      </PostHogProvider>
    </UserProvider>
  )
}
