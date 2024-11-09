export interface DeviceResponse {
  code: DeviceCode
  message: string
}
export type DeviceCode =
  | '107000'
  | '107001'
  | '107002'
  | '107003'
  | '107004'
  | '107005'
  | '107006'
  | '107007'
  | '107008'
  | '107009'
  | '107010'
  | '107011'
  | '107012'
  | '107013'
  | '107014'
  | '107017'
export const DEVICE_MESSAGE: { [key in DeviceCode]: string } = {
  '107000': 'None',
  '107001': 'Device not found',
  '107002': 'Device already exists',
  '107003': 'Unknown error',
  '107004': 'Token is not valid',
  '107005': 'Token is not found',
  '107006': 'User is not found',
  '107007': 'MAC is not found',
  '107008': 'Node type is not found',
  '107009': 'Node type is not valid',
  '107010': 'Device created successfully',
  '107011': 'Device get successfully',
  '107012': 'Device update successfully',
  '107013': 'Device remove successfully',
  '107014': 'Device not owned by user',
  '107017': 'Setting saved successfully'
}

export type NodeType = 'GATEWAY' | 'NODE' | 'UNKNOWN'
export type NodeState = 'removed' | 'active' | 'disable'
export type NodeStateType = 'ONLINE' | 'OFFLINE'

export const NodeTypeList = ['GATEWAY', 'NODE', 'UNKNOWN']
export const NodeStateList = ['ONLINE', 'OFFLINE']

export interface InfoDevice {
  child_mac: string[]
  createdAt: string
  updatedAt: string
  desc: string
  name: string
  ram_size: string
  state: NodeState
  status: NodeStateType
  type: NodeType
  layer: number
  mac: string
  id: string
}
