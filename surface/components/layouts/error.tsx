import { Title, Text } from "@tremor/react"

const LinkError = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="max-w-xl">
        <Title>Woops!</Title>
        <Text marginTop="mt-1">
          It looks like this link is either expired or incorrectly spelled. If
          you believe this is a mistake, please notify a support agent by
          clicking the purple chat button on the bottom right corner of the
          screen.
        </Text>
      </div>
    </div>
  )
}

export { LinkError }
