import OS from 'os'

export function getIpAddress(): string {
  const interfaces = OS.networkInterfaces()
  const IPv4 = interfaces.WLAN?.find((addr: any) => addr.family == 'IPv4')?.address
  return IPv4 || ''
}
