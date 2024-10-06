export interface SensorBaseValue {
  value: number
  update_at: string
  _id: string
}

export interface InfoSensor {
  humidity: number
  temperature: number
  smoke: number
}

export interface SocketPayloadSensor {
  smoke: {
    time_at: string
    value: number
  }
  env: {
    temperature: {
      time_at: string
      value: number
    }
    humidity: {
      time_at: string
      value: number
    }
  }
}

export interface SensorInfoSummary {
  humidity: SensorBaseValue[]
  temperature: SensorBaseValue[]
  smoke: SensorBaseValue[]
}
