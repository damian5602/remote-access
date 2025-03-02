export interface DashboardWidget {
  id: string
  type: string
  title: string
  deviceId: string
  x: number
  y: number
  w: number
  h: number
  minW: number
  minH: number
  data: any
}

