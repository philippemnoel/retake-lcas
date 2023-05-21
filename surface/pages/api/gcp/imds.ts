import type { NextApiRequest, NextApiResponse } from "next"
import { withApiAuthRequired } from "@auth0/nextjs-auth0"
import { GoogleAuth } from "google-auth-library"
import { supabase } from "lib/api/supabase"

const parserFunctionUrl = process.env.MDS_PARSER_FUNCTION_URL ?? ""

async function request(auth: GoogleAuth, body: any): Promise<any> {
  console.info(
    `request ${parserFunctionUrl} with target audience ${parserFunctionUrl}`
  )
  const client = await auth.getIdTokenClient(parserFunctionUrl)
  return await client.request({
    method: "POST",
    url: parserFunctionUrl,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

export default withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "POST") {
      try {
        const lcaId = req.body.lca_id
        const docs = req.body.docs
        const orgId = req.body.org_id

        if (docs === undefined || orgId === undefined) {
          res.status(400).end()
          return
        }

        const auth = new GoogleAuth({
          credentials: {
            client_email: process.env.IMDS_CLIENT_EMAIL,
            private_key: process.env.IMDS_PRIVATE_KEY,
          },
        })

        console.log(
          `Processing documents for orgId ${orgId}, invoking mds parser`
        )

        for (const doc of docs) {
          // TODO: get signed url instead of public url, make buckets private
          const { data } = supabase.storage
            .from(doc.bucket)
            .getPublicUrl(doc.path)

          const mdsParserResponse = await request(auth, {
            org_id: orgId,
            lca_id: lcaId,
            file_url: data.publicUrl,
          })

          if (mdsParserResponse.status !== 200) {
            res
              .status(mdsParserResponse.status)
              .send(mdsParserResponse.statusText)
          }
        }

        console.log(`Successfully parsed mds document`)

        res.status(200).end()
      } catch (err) {
        console.error(err)
        res.status(500).end()
      }
    } else {
      res.status(404).end()
    }
  }
)
