<script setup lang="ts">
import { computed, ref } from 'vue'
import { ObjectEvent } from 'ol/Object'
import { formatGeopoint } from '@/utils/geopointUtils'
import { OL_MAX_ZOOM } from '@/config/geocoding'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const center = computed(() => formatGeopoint(props.modelValue, 'array'))

const rotation = ref(0)
const zoom = ref(18)
const projection = ref('EPSG:4326')

// const view = ref(null)

function centerChanged(e: ObjectEvent) {
  const newCenter = e.target.getCenter()
  const sameCoordinates = (a: number[], b: number[]): boolean => a.join() === b.join()

  if (sameCoordinates(center.value as number[], newCenter)) return

  const formattedGeopoint = formatGeopoint(newCenter, 'object')
  emit('update:modelValue', formattedGeopoint)
}

function zoomChanged(e: ObjectEvent) {
  zoom.value = Math.ceil(e.target.getZoom())
}
</script>

<template>
  <ol-map
    ref="map"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
    style="height: 300px"
  >
    <ol-view
      ref="view"
      :center="center"
      :rotation="rotation"
      :zoom="zoom"
      :maxZoom="OL_MAX_ZOOM"
      :projection="projection"
      @change:center="centerChanged"
      @change:resolution="zoomChanged"
    />

    <ol-tile-layer ref="osmLayer">
      <ol-source-osm />
    </ol-tile-layer>

    <ol-vector-layer :zIndex="2">
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
