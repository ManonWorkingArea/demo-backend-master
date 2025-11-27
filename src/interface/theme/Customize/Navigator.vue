<template>

  <ul class="flex-col submenu">
    <li v-for="(item, index) in this.menu" :key="index" class="bg-white border-b border-gray-100">
      <template v-if="!item.subMenu || item.subMenu.length === 0">
        <a href="#" class="block px-4 py-3 text-gray-500 hover:text-indigo-800 font-medium" @click.prevent="handleMenuItemClick(item.target)">
          {{ item.title }}
        </a>
      </template>
      <template v-else>
        <a href="#" class="flex justify-between px-4 py-3 text-gray-600 hover:text-indigo-800 font-medium" @click.prevent="item.isActive = !item.isActive">
          <span>{{ item.title }}</span>
          <font-awesome-icon :icon="['fas', 'chevron-down']" class="text-gray-300" :class="{ 'transform rotate-180': item.isActive }" />
        </a>
        <ul class="" v-if="item.subMenu && item.isActive">
          <li v-for="(subitem, subindex) in item.subMenu" :key="subindex" class="bg-white border-b border-gray-100">
            <a href="#" class="ml-4 block px-4 py-3 text-gray-600 hover:text-indigo-800 font-medium" @click.prevent="handleMenuItemClick(subitem.target)">
              {{ item.title }}
            </a>
          </li>
        </ul>
      </template>
    </li>
  </ul>

</template>

<script>
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import debug from '@/plugins/Logger.js';

export default {
  data() {
    return {
      configs: storageManager.get('configs'),
      menu: []
    }
  },
  async mounted() {
    try {
      await this.getPostData();
    } catch (error) {
      debug.log(error);
    }
  },
  methods: {
    handleMenuItemClick(item) {
      this.$router.push(item);
      this.$emit('menu-item-close');
    },
    async getPostData() {
			try {
        const responsePost = await Request.GET(`post/${this.configs.navigator}`, this.configs.key);
          if (responsePost.status !== 200) {
            throw new Error(`Failed to fetch course data from API`);
          }
          const savedLayout       = responsePost.data;
				if (savedLayout) {
					this.menu  = savedLayout.builder;
				}
			} catch (error) {
			debug.log(error);
			}
		},
  },
  props: {
    nav: {
      navigator: String,
      default: () => ({ navigator: 'desktop' })
    }
  }
}
</script>

<style scoped>
nav ul ul {
  display: none;
}

nav ul li:hover > ul {
  display: block;
}

</style>
