import type { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const { responseId, formId } = req.query

    const response = await fetch(
      `https://api.typeform.com/forms/${formId}/responses?included_response_ids=${responseId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.TYPEFORM_TOKEN}`,
        },
        redirect: "follow",
      }
    )

    const body = await response.json()
    const item = body?.items?.[0]

    res.status(200).json(item)
  } else {
    res.status(404).end()
  }
}
