import { get } from "."
import { SupabaseDownloadSchema } from "./schemas"

const getPublicUrl = (
  bucket: string,
  path: string,
  orgId: string | null | undefined
) => {
  const parsed = SupabaseDownloadSchema.parse({ bucket, path, orgId })

  return get(`/api/storage/${parsed.orgId}/publicUrl`, {
    bucket: parsed.bucket,
    path: parsed.path,
  })
    .json<{ data: { publicUrl: string } }>()
    .then((response) => response?.data?.publicUrl)
}

export { getPublicUrl }
