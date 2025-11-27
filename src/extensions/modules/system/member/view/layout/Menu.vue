<template>
    <div class="hidden md:block" v-if="layout === 'horizontal'">
        <ul class="flex">
            <li v-for="item in menuItems" :key="item.label" class="relative hover:bg-black rounded-md">
              <a v-if="!item.submenu" :href="item.link" class="block py-2 px-3 text-sm">{{ item.label }}</a>
              <div v-else>
                <button @click="toggleSubmenu(item)" class="flex items-center justify-between w-full text-left py-2 px-3 focus:outline-none cursor-pointer">
                  <span class="text-white text-sm">{{ item.label }}</span>
                  <font-awesome-icon :icon="['fas','angle-down']" class="ml-1 text-white"/>
                </button>
                <transition name="slide">
                  <ul v-show="item.showSubmenu" class="absolute w-48 top-full mt-2 left-0 z-10 bg-white rounded-md shadow-lg">
                    <li v-for="subitem in item.submenu" :key="subitem.label">
                      <a :href="subitem.link" class="block px-3 py-2 text-gray-700 text-sm hover:bg-gray-100 hover:rounded-md cursor-pointer">{{ subitem.label }}</a>
                    </li>
                  </ul>
                </transition>
              </div>
            </li>
        </ul>
    </div>
    <div v-else>
        <ul class="mt-6">
            <li v-for="item in menuItems" :key="item.label" class="" :class="{ 'bg-gray-700': item.showSubmenu }">
              <a @click="item.showSubmenu = !item.showSubmenu" class="flex items-center py-3 px-4 hover:bg-gray-700 rounded text-sm cursor-pointer">
                <font-awesome-icon :icon="['fas','globe']" class="text-white text-[18px] mr-2"/>
                <span>{{ item.label }}</span>
              </a>
              <ul v-show="item.showSubmenu" class="bg-white bg-opacity-20">
                <li v-for="subitem in item.submenu" :key="subitem.label" class="hover:bg-gray-600">
                  <a :href="subitem.link" class="pl-6 block py-2 text-sm cursor-pointer">{{ subitem.label }}</a>
                </li>
              </ul>
            </li>
        </ul>
    </div>
  </template>
  
  <script>
export default {
  name: 'Menu',
  props: {
    layout: {
      type: String,
      required: true,
      validator: value => ['horizontal', 'vertical'].includes(value),
    },
  },
  data() {
    return {
      label: 'Administration',
      menuItems: [
        {
          label: 'Menu A',
          submenu: [
            {
              label: 'Item 1',
              link: '',
            },
            {
              label: 'Item 2',
              link: '',
            },
            {
              label: 'Item 3',
              link: '',
            },
          ],
        },
        {
          label: 'Menu B',
          submenu: [
            {
              label: 'Item 1',
              link: '',
            },
            {
              label: 'Item 2',
              link: '',
            },
            {
              label: 'Item 3',
              link: '',
            },
          ],
        },
        {
          label: 'Menu B',
          submenu: [
            {
              label: 'Item 1',
              link: '',
            },
            {
              label: 'Item 2',
              link: '',
            },
            {
              label: 'Item 3',
              link: '',
            },
          ],
        },
        {
          label: 'Menu B',
          submenu: [
            {
              label: 'Item 1',
              link: '',
            },
            {
              label: 'Item 2',
              link: '',
            },
            {
              label: 'Item 3',
              link: '',
            },
          ],
        },
        {
          label: 'Menu B',
          submenu: [
            {
              label: 'Item 1',
              link: '',
            },
            {
              label: 'Item 2',
              link: '',
            },
            {
              label: 'Item 3',
              link: '',
            },
          ],
        },
        {
          label: 'Menu B',
          submenu: [
            {
              label: 'Item 1',
              link: '',
            },
            {
              label: 'Item 2',
              link: '',
            },
            {
              label: 'Item 3',
              link: '',
            },
          ],
        },
        {
          label: 'Menu B',
          submenu: [
            {
              label: 'Item 1',
              link: '',
            },
            {
              label: 'Item 2',
              link: '',
            },
            {
              label: 'Item 3',
              link: '',
            },
          ],
        },
        {
          label: 'Menu B',
          submenu: [
            {
              label: 'Item 1',
              link: '',
            },
            {
              label: 'Item 2',
              link: '',
            },
            {
              label: 'Item 3',
              link: '',
            },
          ],
        },    
      ],
    };
  },
  methods: {
    toggleSubmenu(item) {
      // If this item's submenu is already open, close it
      if (item.showSubmenu) {
        item.showSubmenu = false;
        return;
      }

      // Close all other submenus
      this.menuItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.showSubmenu) {
          otherItem.showSubmenu = false;
        }
      });

      // Open this item's submenu
      item.showSubmenu = true;

      // Hide submenu when clicking outside of it
      document.addEventListener('click', this.hideSubmenuOnClickOutside);
    },
    showSubmenu(item) {
      item.showSubmenu = true;
    },
    hideSubmenu(item) {
      item.showSubmenu = false;
      document.removeEventListener('click', this.hideSubmenuOnClickOutside);
    },
    hideSubmenuOnClickOutside(event) {
      const isClickInside = this.$refs.menu.contains(event.target);
      if (!isClickInside) {
        this.menuItems.forEach(item => {
          item.showSubmenu = false;
        });
        document.removeEventListener('click', this.hideSubmenuOnClickOutside);
      }
    },
  },
  mounted() {
    // Add showSubmenu property to each item with submenu
    this.menuItems.forEach(item => {
      if (item.submenu) {
        item.showSubmenu = false;
      }
    });
  },
};
</script>

  
  <style>
  .slide-enter-active,
.slide-leave-active {
  transition: max-height 0.2s ease-out;
}
.slide-enter,
.slide-leave-to {
  max-height: 0;
  overflow: hidden;
}
.relative > ul {
  position: absolute;
  left: 100%;
  top: 0;
}
  </style>