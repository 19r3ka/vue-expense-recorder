import { type GeoPoint } from '@/components/MyGeolocationInput.vue'

interface InputObject {
  latitude?: number | string
  longitude?: number | string
  lat?: number | string
  lon?: number | string
  lng?: number | string
}

function parseString(geopoint: string): GeoPoint {
  const [latitude, longitude] = geopoint.split(',').map(Number)
  return { latitude, longitude }
}

function parseArray(geopoint: number[]): GeoPoint {
  const [latitude, longitude] = geopoint
  return { latitude, longitude }
}

function parseObject(obj: InputObject): GeoPoint {
  const latitude = obj.latitude !== undefined ? Number(obj.latitude) : Number(obj.lat)
  const longitude = obj.longitude !== undefined ? Number(obj.longitude) : Number(obj.lon || obj.lng)

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid latitude or longitude')
  }

  return { latitude, longitude }
}

function formatToString(geopoint: GeoPoint): string {
  return `${geopoint.latitude},${geopoint.longitude}`
}

// where X is longitude and Y is latitude
// format used by vue-openlayers
function formatToXY(geopoint: GeoPoint): number[] {
  return [geopoint.longitude, geopoint.latitude]
}

function formatToArray(geopoint: GeoPoint): number[] {
  return [geopoint.latitude, geopoint.longitude]
}

function formatToObject(geopoint: GeoPoint): GeoPoint {
  return { ...geopoint }
}

function formatGeopoint(
  geopoint: string | number[] | GeoPoint,
  outputFormat: 'string' | 'array' | 'object' | 'xy'
): GeoPoint | string | number[] {
  let parsedGeopoint: GeoPoint

  if (typeof geopoint === 'string') {
    parsedGeopoint = parseString(geopoint)
  } else if (Array.isArray(geopoint)) {
    parsedGeopoint = parseArray(geopoint)
  } else if (typeof geopoint === 'object') {
    parsedGeopoint = parseObject(geopoint)
  } else {
    throw new Error('Invalid geopoint format')
  }

  switch (outputFormat) {
    case 'string':
      return formatToString(parsedGeopoint)
    case 'array':
      return formatToArray(parsedGeopoint)
    case 'xy':
      return formatToXY(parsedGeopoint)
    case 'object':
      return formatToObject(parsedGeopoint)
    default:
      throw new Error('Invalid output format')
  }
}

export { formatGeopoint }
