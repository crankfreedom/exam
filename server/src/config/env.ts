import { getIpAddress } from '@/utils/normalized'

export interface Env {
  HOST: string
  PORT: number
}

export const env: Env = {
  HOST: getIpAddress(),
  PORT: 3000
}
