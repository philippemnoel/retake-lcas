import { NextApiRequest, NextApiResponse } from "next"
import { post } from "lib/api"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { text } = req.body
    const webhookURL = process.env.SLACK_WEBHOOK_URL as string
    const response = await post(webhookURL, { text })

    if (!response.ok) {
      res.status(500).json({ message: "Could not send to Slack" })
    } else {
      res.status(200).json({ message: "Message sent to Slack" })
    }
  } else {
    res.status(405).end("Method Not Allowed")
  }
}
