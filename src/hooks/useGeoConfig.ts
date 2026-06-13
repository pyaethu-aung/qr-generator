import { useMemo } from 'react'
import type { GeoConfig } from '../types/qr'
import { buildGeoString } from '../utils/geo'
import { usePersistedConfig } from './usePersistedConfig'

const DEFAULT_GEO_CONFIG: GeoConfig = {
  latitude: '',
  longitude: '',
}

export interface UseGeoConfigReturn {
  geoConfig: GeoConfig
  geoString: string
  setLatitude: (v: string) => void
  setLongitude: (v: string) => void
}

export function useGeoConfig(): UseGeoConfigReturn {
  const [geoConfig, setGeoConfig] = usePersistedConfig<GeoConfig>(
    'qr-generator:draft:geo',
    DEFAULT_GEO_CONFIG,
  )

  const setLatitude = (latitude: string) => setGeoConfig(prev => ({ ...prev, latitude }))
  const setLongitude = (longitude: string) => setGeoConfig(prev => ({ ...prev, longitude }))

  const geoString = useMemo(() => buildGeoString(geoConfig), [geoConfig])

  return { geoConfig, geoString, setLatitude, setLongitude }
}
