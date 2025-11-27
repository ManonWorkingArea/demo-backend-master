<template>
    <div class="fixed top-0 left-0 right-0 bg-blue-900 py-2 px-4">
      <div class="flex items-center justify-between mx-auto max-w-7xl">
        <div class="flex items-center">
            <span class="ml-2">
                <img class="h-10 w-auto" src="https://backend-storage.sgp1.digitaloceanspaces.com/Graphic/Logo/white-logopng-1png.png" alt="Your Company">
            </span>
        </div>
        <Menu layout="horizontal" />
        <Search />
        <div class="flex items-center justify-end">
        <Avatar/>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Menu from './Menu.vue';
  import Search from './Search.vue';
  import Avatar from './Avatar.vue';
  
  export default {
    name: 'Topbar',
    components: {
      Menu,
      Avatar,
      Search
    },
  };
  </script>
  