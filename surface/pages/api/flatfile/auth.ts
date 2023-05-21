import jwt from "jsonwebtoken"
import type { NextApiRequest, NextApiResponse } from "next"

const portalMap = {
  "859495bb-bc33-4f0e-a004-8a68925846fc":
    "5NV2ghc7lk0uXnBpmdzy66DkBYmJA2hXTovbp0LaYDnWuEP0B41YN9W83d0X90UJ",
  "29482030-f079-4a3d-ae6f-2fd10012cfa4":
    "RSFXOHE9oubhwtOTD4Vf7ChdqoDxvZxRaKtdGkrKOVtEQjfnw7yleTlKpdTwAkwI",
  "5e73d8af-ced3-45b3-b963-6ff615a573d0":
    "6WIsoFAzKXrD8jrRmkvVDAiRwQeHTc3VIgczUsMX7HQI1ApcY8QnBC66SWOqyFsD",
  "2e657d9c-65e8-4fdf-825b-5b0edcbcf02a":
    "lE0TlmUXnIK6AtjVN8aPDX0tKQAtBjp35UWC5MtfeBeA0mKzC33l6wnAlFSWLP5Q",
  "4c02da60-8fcc-40a4-81e4-365a9b390541":
    "83mBHJ97WlzKWYeoEoC7Ev6jaCPxJ4QcFzFxYD78PgTv5mKaxxPj1xvovBjXXM9g",
  "91bb2ca3-39ad-4a3e-8447-295f6c0f6a84":
    "yAm7764Zu2tWk76ADs8zEkn47THJMpF8oGO11gndXm9wD9esdCtR8QOdBgVmzAoC",
  "ce38fede-f637-42e8-9af6-857ad5b7afd3":
    "NCbwd0QdcEO0RyFUd80Uih7g3copMveVvpmFqXujOpquKfmlUJZ52aJtqy2TAjhe",
  "82b9eea9-88fa-4d87-adfb-2dbe00bbe881":
    "g9ELflUgRRsPzkwuu9sYDHbDTUNHH5JBRfY0vO7miqELdaAUAgpjthsM7nfMYrjN",
  "b3d7731b-e69c-4fc1-8731-0c10519bed64":
    "FqZ3bNNPmZ6Gggl5bACRDvhfx8ULkqa3ss3R17b3Dgt8FkElcFAoDcOwKCl2qnXE",
  "282d1549-bcc7-4328-b7ff-e452c5924cb3":
    "Cmmml3XkoEu0Tz04CLz5rXBf9wE8ZOjMyywWnmpBvnxLVWsYxnSB9wnqLGwHEsum",
  "84c896a9-929d-43d1-bceb-de77e50bd658":
    "A1VvjoxoOdbCmhkNmmcVzwru7Q7bTyhANUZK7fPXnI7VTqxqftN89WTH1qdZnYC1",
  "bfeb21f5-d411-4be3-9550-9375fea0576c":
    "kaPFRKI29gDARHbrtFKM9TQSsKBUk4ei1N3AA1Hs9P7v99vDiacP1XvDq3qrxuDb",
  "4eb47f72-c8c0-405c-b0a5-eec7580a2554":
    "oiPN4W3Zt7htxX8luLmNxueEieZ2GpOJyYqk85RG30vjizxXrmUQvgZ32RrJKAcb",
} as { [key: string]: string }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = {
    id: req.body.user.sub,
    email: req.body.user.email,
    name: req.body.user.name,
  }

  const org = {
    id: req.body.user.org_id,
    name: req.body.user.organization_name,
  }

  const token = jwt.sign(
    {
      embed: req.body.embedId,
      user,
      org,
    },
    portalMap[req.body.embedId],
    {
      expiresIn: "24h",
    }
  )

  res.status(200).json({ token })
}
