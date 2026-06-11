import { useState } from 'react'
import { LocateFixed } from 'lucide-react'
import { Input } from '../../common/Input'
import { Callout } from '../../common/Callout'
import { useLocaleContext } from '../../../hooks/LocaleProvider'
import { parseLatitude, parseLongitude } from '../../../utils/geo'
import type { GeoConfig } from '../../../types/qr'

interface GeoFormProps {
  config: GeoConfig
  onLatitudeChange: (v: string) => void
  onLongitudeChange: (v: string) => void
}

/** Six decimals of a degree is about 0.1m on the ground: precise enough for any map pin, and tidier than the device's raw float. */
const roundCoord = (n: number): string => String(Math.round(n * 1e6) / 1e6)

/**
 * Location (geo:) form: a latitude/longitude pair that encodes an RFC 5870 geo URI, plus a
 * one-tap "use my location" that fills both fields from the Geolocation API. Coordinates are
 * the source of truth; geolocation is a convenience, not a requirement, so a denied permission
 * or an unsupported browser degrades to manual entry rather than a dead end. The live preview
 * mirrors the phone field's confirmation line so people see exactly where the code will open.
 */
export function GeoForm({ config, onLatitudeChange, onLongitudeChange }: GeoFormProps) {
  const { translate } = useLocaleContext()
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | undefined>()

  // A non-empty field that fails to parse is an explicit error; a blank field is merely
  // incomplete and stays quiet until the user commits to a value.
  const lat = parseLatitude(config.latitude)
  const lng = parseLongitude(config.longitude)
  const latError = config.latitude.trim() !== '' && lat === null
  const lngError = config.longitude.trim() !== '' && lng === null

  const showPreview = lat !== null && lng !== null
  const previewCoords = showPreview ? `${lat}, ${lng}` : ''

  const handleUseMyLocation = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setLocationError(translate('controls.geoLocationUnsupported'))
      return
    }
    setLocating(true)
    setLocationError(undefined)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLatitudeChange(roundCoord(position.coords.latitude))
        onLongitudeChange(roundCoord(position.coords.longitude))
        setLocating(false)
      },
      () => {
        setLocationError(translate('controls.geoLocationError'))
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-text-secondary">{translate('controls.geoModeHint')}</p>

      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={locating}
        aria-busy={locating}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface-raised px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-wait disabled:opacity-60"
      >
        {locating ? (
          <span className="h-4 w-4 motion-safe:animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
        ) : (
          <LocateFixed size={16} aria-hidden className="text-text-secondary" />
        )}
        {locating ? translate('controls.geoLocating') : translate('controls.geoUseMyLocation')}
      </button>

      {/* Announce the in-flight state for screen readers without relying on the visual spinner. */}
      <span className="sr-only" role="status" aria-live="polite">
        {locating ? translate('controls.geoLocating') : ''}
      </span>

      {locationError && <Callout>{locationError}</Callout>}

      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <Input
            label={translate('controls.geoLatitudeLabel')}
            placeholder={translate('controls.geoLatitudePlaceholder')}
            value={config.latitude}
            onChange={(e) => onLatitudeChange(e.target.value)}
            error={latError ? translate('controls.geoLatitudeError') : undefined}
            inputMode="decimal"
            autoComplete="off"
            required
          />
        </div>
        <div className="min-w-0 flex-1">
          <Input
            label={translate('controls.geoLongitudeLabel')}
            placeholder={translate('controls.geoLongitudePlaceholder')}
            value={config.longitude}
            onChange={(e) => onLongitudeChange(e.target.value)}
            error={lngError ? translate('controls.geoLongitudeError') : undefined}
            inputMode="decimal"
            autoComplete="off"
            required
          />
        </div>
      </div>

      {showPreview && (
        <p className="text-xs text-text-secondary">
          {translate('controls.geoMapPreview').replace('{coords}', previewCoords)}
        </p>
      )}
    </div>
  )
}
