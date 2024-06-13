<script setup lang="ts">
const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
})
</script>

<template>
  <v-empty-state :icon="props.icon" :text="props.text" :title="props.title"> </v-empty-state>
</template>
