import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

const geocode = async (location: string) => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      location
    )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  )

  if (response.data.status === "OK") {
    const { lat, lng } = response.data.results[0].geometry.location
    return { lat, lng }
  }

  throw new Error(`Failed to geocode location: ${location}`)
}

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const toRadians = (degree: number) => (degree * Math.PI) / 180
  const R = 6371 // Earth radius in km

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" })
    return
  }

  const { location1, location2 } = req.body

  try {
    const coords1 = await geocode(location1)
    const coords2 = await geocode(location2)

    const distance = haversineDistance(
      coords1.lat,
      coords1.lng,
      coords2.lat,
      coords2.lng
    )

    res.status(200).json({ distance })
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
}
