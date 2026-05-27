import { useState, useMemo } from 'react'
import type { WiFiConfig, WiFiSecurity } from '../types/qr'
import { buildWifiString } from '../utils/wifi'

const DEFAULT_WIFI_CONFIG: WiFiConfig = {
  ssid: '',
  password: '',
  security: 'WPA',
  hidden: false,
}

export interface UseWiFiConfigReturn {
  wifiConfig: WiFiConfig
  wifiString: string
  setSsid: (ssid: string) => void
  setPassword: (password: string) => void
  setSecurity: (security: WiFiSecurity) => void
  setHidden: (hidden: boolean) => void
}

export function useWiFiConfig(): UseWiFiConfigReturn {
  const [wifiConfig, setWifiConfig] = useState<WiFiConfig>(DEFAULT_WIFI_CONFIG)

  const setSsid = (ssid: string) => setWifiConfig(prev => ({ ...prev, ssid }))
  const setPassword = (password: string) => setWifiConfig(prev => ({ ...prev, password }))
  const setSecurity = (security: WiFiSecurity) => setWifiConfig(prev => ({ ...prev, security }))
  const setHidden = (hidden: boolean) => setWifiConfig(prev => ({ ...prev, hidden }))

  const wifiString = useMemo(() => buildWifiString(wifiConfig), [wifiConfig])

  return { wifiConfig, wifiString, setSsid, setPassword, setSecurity, setHidden }
}
