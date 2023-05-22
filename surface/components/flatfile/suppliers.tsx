import { Button } from "@tremor/react"
import { useRouter } from "next/router"
import { PlusIcon } from "@heroicons/react/20/solid"
import { useUser } from "@auth0/nextjs-auth0"

import Flatfile from "../flatfile"
import { upsertSupplier } from "lib/api/upsert"

export default () => {
  const { user } = useUser()
  const router = useRouter()

  return (
    <Flatfile
      embedId={process.env.SUPPLIER_EMBED_ID ?? ""}
      onChunk={async (chunk) => {
        const rows = chunk.records.map((row) => row.data)
        const suppliers = rows.map((row) => ({
          id: `${row.name}-${user?.org_id}`,
          name: row.name?.toString(),
          website: row.website?.toString() ?? null,
          contacts: row.email ? [row.email.toString()] : [],
          org_id: user?.org_id,
        }))

        await upsertSupplier(suppliers, user?.org_id)
      }}
      onSuccess={() => {
        setTimeout(() => {
          router.reload()
        }, 1500)
      }}
    >
      <Button
        text="Upload From File"
        icon={PlusIcon}
        color="indigo"
        variant="light"
      />{" "}
    </Flatfile>
  )
}
