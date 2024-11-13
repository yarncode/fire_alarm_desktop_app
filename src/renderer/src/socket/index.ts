import { io } from 'socket.io-client'

const env = import.meta.env
const socket = io(
  `ws://${env.VITE_HOST_NAME}:${env.VITE_HOST_SOCKET_PORT}?time_now=${Date.now()}`,
  { autoConnect: false, forceNew: true }
)

export default socket
