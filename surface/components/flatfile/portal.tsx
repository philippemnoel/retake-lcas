import { useUser } from "@auth0/nextjs-auth0"
import { Flatfile, RecordsChunk } from "@flatfile/sdk"

export default ({
  embedId,
  onBeforeUpload,
  onChunk,
  onSuccess,
  children,
}: {
  embedId: string
  onBeforeUpload?: () => Promise<boolean>
  onChunk: (chunk: RecordsChunk) => void
  onSuccess: () => void
  children: React.ReactNode
}) => {
  // This complicated logic is to avoid Next using SSR,
  // which breaks the flatfile sdk.
  const { user } = useUser()

  const onClick = async () => {
    const shouldContinue =
      onBeforeUpload !== undefined ? await onBeforeUpload() : true

    if (shouldContinue && user !== undefined) {
      Flatfile.requestDataFromUser({
        embedId,
        user: {
          id: user.sub ?? "",
          name: user.name ?? "",
          email: user.email ?? "",
        },
        org: { id: user.org_id ?? "", name: user.organization_name as string },
        async onData(chunk, next) {
          onChunk(chunk)
          next()
        },
        async onComplete() {
          onSuccess()
        },
      })
    }
  }

  return <div onClick={onClick}>{children}</div>
}
