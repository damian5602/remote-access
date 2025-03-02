import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import mqttClient from "@/lib/mqtt-client"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { topic, message } = await req.json()

    if (!topic || !message) {
      return NextResponse.json({ error: "Topic and message are required" }, { status: 400 })
    }

    // Connect to MQTT broker if not already connected
    await mqttClient.connect(process.env.MQTT_BROKER_URL || "mqtt://localhost:1883", {
      clientId: `server-${Date.now()}`,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    })

    // Publish message to topic
    await mqttClient.publish(topic, message)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("MQTT publish error:", error)
    return NextResponse.json({ error: "Failed to publish message" }, { status: 500 })
  }
}

