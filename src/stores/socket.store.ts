/**
 * WebSocket Store — Manages Socket.IO connection lifecycle.
 * Shared across scan, consent, and notification features.
 */

import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'
import { secureStorage } from '@/lib/storage'

const WS_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface SocketState {
  socket: Socket | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: async () => {
    if (get().socket?.connected) return

    const token = await secureStorage.getItem(secureStorage.keys.ACCESS_TOKEN)
    if (!token) return

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    })

    socket.on('connect', () => {
      set({ isConnected: true })
    })

    socket.on('disconnect', () => {
      set({ isConnected: false })
    })

    socket.on('connect_error', () => {
      set({ isConnected: false })
    })

    set({ socket })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.removeAllListeners()
      socket.disconnect()
      set({ socket: null, isConnected: false })
    }
  },
}))
