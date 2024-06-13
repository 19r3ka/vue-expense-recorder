<script setup lang="ts">
import { computed, ref } from 'vue'
import { ObjectEvent } from 'ol/Object'
import { Map } from 'vue3-openlayers'
import { formatGeopoint } from '@/utils/geopointUtils'
import { OL_MAX_ZOOM } from '@/config/geocoding'
import type { GeoPoint } from './MyGeolocationInput.vue'

const props = defineProps({
  modelValue: {
    type: Object as () => GeoPoint,
    required: true
  }
})
const emit = defineEmits(['update:modelValue'])

const center = computed(() => formatGeopoint(props.modelValue, 'xy'))

const rotation = ref(0)
const zoom = ref(18)
const projection = ref('EPSG:4326')
const viewRef = ref<InstanceType<typeof Map.OlView> | null>(null)

const sameCoordinates = (a: number[], b: number[]): boolean => a.join() === b.join()

function centerChanged() {
  // const [long, lat] = e.target.getCenter() as number[]
  const [long, lat] = viewRef.value?.getCenter() as number[]
  const newCenter = [lat, long]

  const isSameCoordinates = sameCoordinates(center.value as number[], newCenter)
  if (isSameCoordinates) return

  // Swap [long, lat] which is the vue-openlayers coordinate to [lat, long]
  const formattedGeopoint = formatGeopoint(newCenter, 'object')
  emit('update:modelValue', formattedGeopoint)
}

function zoomChanged(e: ObjectEvent) {
  // to make sure the center does not change during zoom update
  // save the value to restore it after zoom update
  const center = e.target.getCenter()
  const newZoom = e.target.getZoom()
  zoom.value = zoom.value > newZoom ? Math.floor(newZoom) : Math.ceil(newZoom)
  e.target.setCenter(center)
}
</script>

<template>
  <ol-map
    ref="map"
    :load-tiles-while-animating="true"
    :load-tiles-while-interacting="true"
    @moveend="centerChanged"
    style="height: 300px"
  >
    <ol-view
      ref="viewRef"
      :center="center"
      :rotation="rotation"
      :zoom="zoom"
      :max-zoom="OL_MAX_ZOOM"
      :projection="projection"
      @change:resolution="zoomChanged"
    />

    <ol-tile-layer ref="osmLayer">
      <ol-source-osm />
    </ol-tile-layer>

    <ol-vector-layer :z-index="2">
      <ol-source-vector>
        <ol-feature>
          <ol-geom-point :coordinates="center"></ol-geom-point>
          <ol-style>
            <ol-style-text text="📍" scale="2"></ol-style-text>
          </ol-style>
        </ol-feature>
      </ol-source-vector>
    </ol-vector-layer>
  </ol-map>
</template>
