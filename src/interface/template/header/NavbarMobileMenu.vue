<template>
    <DisclosureButton class="inline-flex items-center justify-center rounded-md bg-gray-50 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
      <span class="sr-only">Open main menu</span>
      <Bars3Icon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
      <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
    </DisclosureButton>
  </template>
  
  <script>
  import { Bars3Icon, XMarkIcon } from '@heroicons/vue/solid'
  
  export default {
    components: {
      Bars3Icon,
      XMarkIcon,
    },
    props: {
      open: {
        type: Boolean,
        required: true,
      },
    },
  }
  </script>
  