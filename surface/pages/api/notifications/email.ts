import { NextApiRequest, NextApiResponse } from "next"
import { ServerClient } from "postmark"

import { templates } from "lib/constants/postmark"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const { fromEmail, toEmail, organizationName, actionUrl, templateId } =
    req.body

  if (
    !fromEmail ||
    !toEmail ||
    !organizationName ||
    !actionUrl ||
    !templateId
  ) {
    res.status(400).json({ error: "Missing required fields" })
    return
  }

  const template = templates.find((t) => t.templateId === templateId)

  if (!template) {
    res.status(400).json({ error: "Invalid template ID" })
    return
  }

  try {
    const client = new ServerClient(process.env.POSTMARK_API_TOKEN as string)

    await client.sendEmailWithTemplate({
      From: fromEmail,
      To: toEmail,
      TemplateId: template.templateId,
      TemplateModel: {
        ...template.model,
        organization_name: organizationName,
        action_url: actionUrl,
      },
    })

    res.status(200).json({ success: "Email sent successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    res.status(500).json({ error: "Failed to send email" })
  }
}
