import { RecordsChunk } from "@flatfile/sdk"
import dynamic from "next/dynamic"

const DynamicComponent = dynamic(() => import("./portal"), { ssr: false })

export default (props: {
  embedId: string
  onBeforeUpload?: () => Promise<boolean>
  onChunk: (chunk: RecordsChunk) => void
  onSuccess: () => void
  children: React.ReactNode
}) => {
  return <DynamicComponent {...props} />
}
