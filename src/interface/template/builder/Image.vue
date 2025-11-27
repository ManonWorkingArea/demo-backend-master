<template>
  <div class="relative imageShowhome flex items-center"
       :class="{
         'justify-start': data.alignment === 'left',
         'justify-center': data.alignment === 'center',
         'justify-end': data.alignment === 'right'
       }">
    <template v-if="data.canLink">
      <component :is="isExternalLink(data.link) ? 'a' : 'router-link'" 
                 :href="isExternalLink(data.link) ? data.link : undefined" 
                 :to="!isExternalLink(data.link) ? data.link : undefined" 
                 :target="data.target" 
                 rel="noopener noreferrer" 
                 class="hover:bg-black hover:bg-opacity-20 hover:text-white">
        <img :src="data.url" :alt="data.alt" :class="[getHeaderClasses(), styles.classes]" :style="getImageStyle()" />
        <div class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100">
          <div class="absolute inset-0 bg-black bg-opacity-20"></div>
          <span class="text-white text-lg bg-black p-3">Click to open Link</span>
        </div>
      </component>
    </template>
    <template v-else-if="data.showHome">
      <router-link to="/" class="hover:bg-black hover:bg-opacity-20 hover:text-white">
        <img :src="data.url" :alt="data.alt" :class="[getHeaderClasses(), styles.classes]" :style="getImageStyle()" />
      </router-link>
    </template>
    <template v-else>
      <img :src="data.url" :alt="data.alt" class="w-full" :class="[getHeaderClasses(), styles.classes]" :style="getImageStyle()" />
    </template>
  </div>
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
    },
    getImageStyle() {
      const style = {};
      
      if (this.data.width) {
        style.width = this.data.width + 'px';
      }
      
      if (this.data.borderRadiusBottomLeft) {
        style.borderBottomLeftRadius = this.data.borderRadiusBottomLeft + 'px';
      }

      if (this.data.borderRadiusBottomRight) {
        style.borderBottomRightRadius = this.data.borderRadiusBottomRight + 'px';
      }

      if (this.data.borderRadiusTopLeft) {
        style.borderTopLeftRadius = this.data.borderRadiusTopLeft + 'px';
      }

      if (this.data.borderRadiusTopRight) {
        style.borderTopRightRadius = this.data.borderRadiusTopRight + 'px';
      }

      return style;
    },
    isExternalLink(link) {
      return /^(http|https):/.test(link);
    }
  },
  computed: {
    styles() {
      return generateStyles(this.data);
    },
  },
};
</script>
