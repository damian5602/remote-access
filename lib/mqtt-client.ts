import mqtt from "mqtt"

class MqttClient {
  private client: mqtt.MqttClient | null = null
  private static instance: MqttClient
  private subscriptions: Map<string, ((message: string) => void)[]> = new Map()
  private connectionPromise: Promise<mqtt.MqttClient> | null = null

  private constructor() {}

  public static getInstance(): MqttClient {
    if (!MqttClient.instance) {
      MqttClient.instance = new MqttClient()
    }
    return MqttClient.instance
  }

  public async connect(url: string, options: mqtt.IClientOptions): Promise<mqtt.MqttClient> {
    if (this.client && this.client.connected) {
      return this.client
    }

    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const client = mqtt.connect(url, options)

        client.on("connect", () => {
          console.log("MQTT client connected")
          this.client = client
          resolve(client)
        })

        client.on("error", (err) => {
          console.error("MQTT connection error:", err)
          reject(err)
        })

        client.on("message", (topic, message) => {
          const handlers = this.subscriptions.get(topic)
          if (handlers) {
            const messageStr = message.toString()
            handlers.forEach((handler) => handler(messageStr))
          }
        })

        client.on("reconnect", () => {
          console.log("MQTT client reconnecting")
        })

        client.on("close", () => {
          console.log("MQTT client disconnected")
        })
      } catch (error) {
        reject(error)
        this.connectionPromise = null
      }
    })

    return this.connectionPromise
  }

  public async subscribe(topic: string, callback: (message: string) => void): Promise<void> {
    if (!this.client) {
      throw new Error("MQTT client not connected")
    }

    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, [])
      await new Promise<void>((resolve, reject) => {
        this.client!.subscribe(topic, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    }

    const handlers = this.subscriptions.get(topic)!
    handlers.push(callback)
  }

  public async unsubscribe(topic: string, callback?: (message: string) => void): Promise<void> {
    if (!this.client) {
      return
    }

    if (!this.subscriptions.has(topic)) {
      return
    }

    const handlers = this.subscriptions.get(topic)!

    if (callback) {
      // Remove specific callback
      const index = handlers.indexOf(callback)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
    } else {
      // Remove all callbacks
      handlers.length = 0
    }

    // If no more handlers, unsubscribe from topic
    if (handlers.length === 0) {
      this.subscriptions.delete(topic)
      await new Promise<void>((resolve) => {
        this.client!.unsubscribe(topic, () => {
          resolve()
        })
      })
    }
  }

  public async publish(topic: string, message: string | object): Promise<void> {
    if (!this.client) {
      throw new Error("MQTT client not connected")
    }

    const payload = typeof message === "string" ? message : JSON.stringify(message)

    return new Promise<void>((resolve, reject) => {
      this.client!.publish(topic, payload, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  public disconnect(): void {
    if (this.client && this.client.connected) {
      this.client.end()
      this.client = null
    }
    this.connectionPromise = null
    this.subscriptions.clear()
  }
}

export default MqttClient.getInstance()

