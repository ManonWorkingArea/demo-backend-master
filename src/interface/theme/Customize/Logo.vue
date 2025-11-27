<template>
  <div class="flex-shrink-0 flex items-center main-logo">
    <router-link :to="'/'" :class="logo.size">
      <img v-if="logo.type === 'image'" :src="config.siteLogo" :class="logo.size" :alt="config.siteName">
      <span v-else class="text-gray-800 font-medium text-lg">{{ config.siteName }}</span>
    </router-link>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
export default {
  data() {
    return {
      config: storageManager.get('configs'),
    }
  },
  props: {
    logo: {
        type: Object,
        default: () => ({ type: 'text', size: 'h-1' })
    },
  }
}
</script>
