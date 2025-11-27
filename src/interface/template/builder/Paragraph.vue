<template>
    <component
      :is="data.displayType || 'p'"
      :class="[getHeaderClasses(), styles.classes]"
      :style="styles.style"
      v-html="data && data.text ? data.text : ''"
    ></component>
  </template>
  
  <script>
  import { generateStyles } from '@/plugins/builder.js';
  
  export default {
    props: {
      data: {
        type: Object,
        required: true
      }
    },
    methods: {
      getHeaderClasses() {
        return [
          'text-' + this.data.color,
          'text-' + this.data.fontSize,
          'font-' + this.data.fontWeight,
          'text-' + this.data.align,
        ];
      }
    },
    computed: {
      styles() {
        return generateStyles(this.data);
      }
    }
  };
  </script>
  