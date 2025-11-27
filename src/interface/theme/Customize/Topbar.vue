<template>
    <div :class="topbar.bg">
      <div class="mx-auto max-w-7xl px-6 lg:px-8 flex justify-between items-center py-1">
        <div v-for="(column, index) in topbar.columns" :key="index" class="inline-flex" :class="{'justify-center': topbar.columns.length === 1}">
          <template v-if="column.url">
            <a :href="column.url" :class="topbar.color + ' text-gray-400 hover:text-gray-500'">{{column.text}}</a>
          </template>
          <template v-else>
            <span :class="topbar.color">{{column.text}}</span>
          </template>
        </div>
      </div>
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
    topbar: {
        type: Object,
        default: () => ({
            show: false,
            text: "",
            bg: "",
            color: ""
        })
    }
  }
}
</script>
