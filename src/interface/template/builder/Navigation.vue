<template>
  <ul 
    class="flex z-10" 
    :class="[data.display === 'vertical' ? 'flex-col' : 'flex-row', getAlignmentClass(), 'space-x-' + data.itemSpace]"
  >
    <li
      class="relative custom-menu"
      v-for="(item, index) in menu"
      :key="index"
      @mouseenter="item.hovered = true; item.showSubMenu = true"
      @mouseleave="item.hovered = false; item.showSubMenu = false"
      :class="[
        'text-' + data.fontSize + 'px',
        'text-' + data.alignment,
        'space-x-' + data.itemSpace + 'px'
      ]"
    >
      <a
        :href="item.target"
        :class="getLinkClasses(item)"
      >
        {{ item.title }}
        <font-awesome-icon
          v-if="item.subMenu && item.subMenu.length > 0"
          :icon="['fas', 'chevron-down']"
          class="ml-1 w-3 h-3"
        />
      </a>
      <ul
        v-if="item.showSubMenu && item.subMenu && item.subMenu.length > 0"
        :class="data.display === 'vertical' 
          ? 'mt-2' 
          : 'absolute top-full left-0 mt-0 w-[150px] p-2 bg-white border border-gray-100 shadow-lg'"
      >
        <li
          v-for="(subitem, subindex) in item.subMenu"
          :key="subindex"
        >
          <a
            :href="subitem.target"
            class="block text-md text-gray-500 p-1 hover:text-indigo-800 hover:bg-gray-200"
            :class="getLinkClasses(subitem)"
          >
            {{ subitem.title }}
          </a>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script>
import { generateStyles } from '@/plugins/builder.js';
import storageManager from '@/plugins/storage';
import debug from '@/plugins/Logger.js';
export default {
  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({
        display: 'horizontal',
        fontSize: 14,
        alignment: 'left',
        itemSpace: 2,
        fontColor: 'text-gray-700',
        hoverColor: 'text-indigo-800',
        menu: [],
      }),
    },
  },

  data() {
    return {
      config: storageManager.get('configs'),
      menu: [],
    };
  },
  async mounted() {
    try {
      await this.getPostData();
    } catch (error) {
      debug.log(error);
    }
  },
  methods: {
    async getPostData() {
      try {
        const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/post/${this.data.menu}`, {
          method: 'GET',
          headers: {'Content-Type': 'application/json', 'client-token-key': this.config.key},
        });

        const RestReturn = await resAPI.json();
        const savedLayout = RestReturn;

        if (savedLayout) {
          this.menu = savedLayout.builder;
        }
      } catch (error) {
        debug.log(error);
      }
    },
    getAlignmentClass() {
      if (this.data.alignment === 'left') {
        return 'justify-start';
      } else if (this.data.alignment === 'center') {
        return 'justify-center';
      } else if (this.data.alignment === 'right') {
        return 'justify-end';
      } else {
        return ''; // Default case or when alignment is not provided
      }
    },
    getLinkClasses(item) {
      const classes = [
        'font-medium',
        'text-[' + (item.fontSize || this.data.fontSize) + 'px]',
        'ml-[' + (item.itemSpace || this.data.itemSpace) + 'px]',
      ];

      if (item.hovered) {
        classes.push(this.data.hoverColor);
      } else {
        classes.push(item.fontColor || this.data.fontColor);
      }

      return classes.filter(Boolean).join(' ');
    },
  },
  computed: {
    styles() {
      return generateStyles(this.data);
    },
  },
};
</script>

<style scoped>
.flex-row {
  display: flex;
  flex-direction: row;
}
.flex-col {
  display: flex;
  flex-direction: column;
}
</style>
