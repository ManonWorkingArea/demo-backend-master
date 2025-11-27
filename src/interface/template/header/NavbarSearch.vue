<template>
    <div class="w-full max-w-lg lg:max-w-xs">
      <label for="search" class="sr-only">ค้นหา</label>
      <div class="relative text-gray-400 focus-within:text-gray-500">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon class="h-5 w-5" aria-hidden="true" />
        </div>
        <input
          id="search"
          class="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm"
          placeholder="ค้นหา"
          type="search"
          name="search"
        />
      </div>
    </div>
  </template>
  
  <script>
  import { MagnifyingGlassIcon } from '@heroicons/vue/solid'
  
  export default {
    components: {
      MagnifyingGlassIcon,
    },
  }
  </script>
  