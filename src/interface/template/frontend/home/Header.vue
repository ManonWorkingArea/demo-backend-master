<script>
  import pluginRoutes from '@/extensions/loader';
  import { getPluginRoutes,getPluginNames } from '@/plugins/utils';
  import storageManager from '@/plugins/storage';

  import Render from './template/Render.vue';

  const pluginNames         = getPluginNames(pluginRoutes);
  const routesWithSubmenus  = getPluginRoutes(pluginRoutes);
  const storedConfigData    = storageManager.get('configs');
  const pluginNamesStorage  = {
    data: pluginNames,
    timestamp: new Date().getTime(),
  };

  storageManager.set('plugins',pluginNamesStorage)

  const storedPluginNames = storageManager.get('plugins');
  if (storedPluginNames) {
    const parsedPluginNames = storedPluginNames;
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    const now = new Date().getTime();
    if (now - parsedPluginNames.timestamp < oneHour) {
      //const pluginNames = parsedPluginNames.data;
      //console.log(pluginNames);
    } else {
      const pluginNames = getPluginNames(pluginRoutes);
      const newPluginNamesStorage = {
        data: pluginNames,
        timestamp: new Date().getTime(),
      };
      storageManager.set('plugins',newPluginNamesStorage)
    }
  } else {
    const pluginNames = getPluginNames(pluginRoutes);
    const newPluginNamesStorage = {
      data: pluginNames,
      timestamp: new Date().getTime(),
    };
    storageManager.set('plugins',newPluginNamesStorage)
  }

  function buildMenuItems(routes, parent, showParent) {
    if (!routes) {
      return [];
    }

    return routes.reduce((acc, route) => {
      if (route.meta.inMenu) {
        const menuItem = {
          name: route.meta.title,
          href: `/${parent}/${route.path}`,
          icon: route.meta.icon,
          current: false,
          counter: false,
          submenu: null,
        };
        if (showParent && route.children && route.children.length > 0) {
          menuItem.submenu = buildMenuItems(route.children, `${parent}/${route.path}`, true);
        }
        acc.push(menuItem);
      } else if (showParent && acc.length > 0 && acc[acc.length - 1].submenu) {
        acc[acc.length - 1].submenu.pop();
      }
      return acc;
    }, []);
  }

  export default {
    components: {
      Render
    },
    data() {
      return {
        configData: {},
        isOpen: false,
        navigation: this.navigation,
        config: storageManager.get('configs'),
        token: storageManager.get('session','token'),
        login: storageManager.get('session','login'),
        nav: storageManager.get('session','nav'),
        user:storageManager.get('session','user'),
        role: storageManager.get('session','role'),
        menu: null,
        showMobileMenu: false,
        className: 'bg-indigo-900 border-b border-gray-200',
        logoSrc: 'https://vue-project.sgp1.digitaloceanspaces.com/Logo/white-logopng.png',
        myData: [
        {
          template: '<h1>[[title]]</h1><p>[[body]]</p>',
          placeholders: {
            title: 'Hello World',
            body: 'This is a sample paragraph.',
          },
          style: 'background-color: #eee; padding: 10px; margin-bottom: 10px;',
        },
      ],
      placeholders: {
        title: 'Hello Vue',
        body: 'This is a sample paragraph rendered with Vue.',
      },
      myItems: [
        {
          placeholders: {
            title: 'Item 1',
            body: 'This is the first item in the loop.',
          },
          style: 'background-color: #eee; padding: 10px; margin-bottom: 10px;',
        },
        {
          placeholders: {
            title: 'Item 2',
            body: 'This is the second item in the loop.',
          },
          style: 'background-color: #eee; padding: 10px; margin-bottom: 10px;',
        },
        {
          placeholders: {
            title: 'Item 3',
            body: 'This is the third item in the loop.',
          },
          style: 'background-color: #eee; padding: 10px; margin-bottom: 10px;',
        },
      ],
      };
    },
    created() {
      this.className  = this.config.siteStyle;
      this.logoSrc    = this.config.siteLogo;
    },
    mounted() {
      console.log(this.nav);

      const rowRaw 	      = storageManager.get('session','role')
      const roleDecrypt 	= rowRaw
      const pluginData = storedConfigData && storedConfigData.plugins ? storedConfigData.plugins : [];

    
      const mainRoutes    = [].concat(routesWithSubmenus
      .filter(routeWithSubmenu => {
        const hasValidRole = !routeWithSubmenu.role || routeWithSubmenu.role.includes(roleDecrypt);
        return routeWithSubmenu.meta.inMenu && pluginData.includes(routeWithSubmenu.slug) && hasValidRole;
      })
      .map(routeWithSubmenu => {
        return {
          name: routeWithSubmenu.name,
          href: routeWithSubmenu.path,
          icon: routeWithSubmenu.icon,
          hasSubmenu: routeWithSubmenu.hasSubmenu,
          current: false,
          counter: false,
          submenu: buildMenuItems(routeWithSubmenu.routes, routeWithSubmenu.slug)
        };
      })
      );

      this.navigation = mainRoutes;

      console.log(this.navigation);
      
    },
    methods: {
    },
    updated() {
    },
    computed: {
    },
  };
</script>

<template>
  <div v-if="showMobileMenu" class="relative z-40 lg:hidden" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-black bg-opacity-25"></div>
    <div class="fixed inset-0 z-40 flex">
      <div class="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl">
        <div class="flex px-4 pb-2 pt-5">
          <button type="button" class="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400" @click="showMobileMenu = false">
            <span class="sr-only">Close menu</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="space-y-6 border-t border-gray-200 px-4 py-6">
          <div class="flow-root">
            <router-link :to="'/lesson/home'" class="-m-2 block p-2 font-medium text-gray-900">หลักสูตร</router-link>
          </div>
          <div class="flow-root">
            <a href="#" class="-m-2 block p-2 font-medium text-gray-900">เกี่ยวกับเรา</a>
          </div>
          <div class="flow-root">
            <a href="#" class="-m-2 block p-2 font-medium text-gray-900">วิทยากร</a>
          </div>
          <div class="flow-root">
            <a href="#" class="-m-2 block p-2 font-medium text-gray-900">วิธีเข้าสู่ระบบ</a>
          </div>
          <div class="flow-root">
            <a href="#" class="-m-2 block p-2 font-medium text-gray-900">คำถามที่พบบ่อย</a>
          </div>
          <div class="flow-root">
            <a href="#" class="-m-2 block p-2 font-medium text-gray-900">ติดต่อเรา</a>
          </div>
        </div>
        <div class="space-y-6 border-t border-gray-200 px-4 py-6">
          <div class="flow-root">
            <router-link :to="'/student/login'" class="-m-2 block p-2 font-medium text-gray-900">
            เข้าสู่ระบบ
            </router-link>
          </div>
          <div class="flow-root">
            <router-link :to="'/student/register'" class="-m-2 block p-2 font-medium text-gray-900">
            สมัครสมาชิก
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>

  <header class="fixed w-full bg-white border-b border-gray-200 z-10">
      <p class="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">Get free delivery on orders over $100</p>
      <nav aria-label="Top" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="">
            <div class="flex h-16 items-center">
            <!-- Mobile menu toggle, controls the 'mobileMenuOpen' state. -->
            <button type="button" class="rounded-md bg-white p-2 text-gray-400 lg:hidden" @click="showMobileMenu = true">
                <span class="sr-only">Open menu</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </button>
            <!-- Logo -->
            <div class="ml-auto flex lg:ml-0 main-logo">
                <router-link :to="'/'">
                  <span class="sr-only">{{this.config.siteName}}</span>
                  <img class="h-16 w-auto" :src="this.config.siteLogo" alt="">
                </router-link>
            </div>
            <!-- Flyout menus -->
            <div class="hidden lg:ml-8 lg:block lg:self-stretch">
                <div class="flex h-full space-x-8 frontend">
                  <router-link :to="'/lesson/home'" class="flex items-center text-md font-medium text-gray-700 hover:text-gray-800 hover:text-black">หลักสูตร</router-link>
                  <a href="#" class="flex items-center text-md font-medium text-gray-700 hover:text-gray-800">เกี่ยวกับเรา</a>
                  <a href="#" class="flex items-center text-md font-medium text-gray-700 hover:text-gray-800">วิทยากร</a>
                  <a href="#" class="flex items-center text-md font-medium text-gray-700 hover:text-gray-800">วิธีเข้าสู่ระบบ</a>
                  <a href="#" class="flex items-center text-md font-medium text-gray-700 hover:text-gray-800">คำถามที่พบบ่อย</a>
                  <a href="#" class="flex items-center text-md font-medium text-gray-700 hover:text-gray-800">ติดต่อเรา</a>
                </div>
            </div>

            <template v-if="this.login">

              <div class="hidden md:block ml-auto flex items-center">

                <div class="lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6 profile">

                  <div class="flex lg:ml-6 relative">
                    <router-link :to="'/student/register'" class="p-2 text-gray-400 hover:text-gray-500">
                      <div class="relative">
                        <font-awesome-icon :icon="['fas','envelope']" class="w-6 h-6" />
                        <div class="absolute -top-2 -right-2 rounded-full bg-red-500 text-white w-4 h-4 flex items-center justify-center text-xs">
                          2
                        </div>
                      </div>
                    </router-link>
                  </div>

                  <router-link :to="'/student/profile'" class="text-sm font-medium text-gray-700">
                    <span class="relative inline-block">
                      <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                      <span class="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
                    </span>
                  </router-link>
                </div>

              </div>
              
            </template>
            <template v-else>

              <div class="hidden md:block ml-auto flex items-center">
                <div class="lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6 authen">

                  <router-link :to="'/student/login'" class="text-sm font-medium text-gray-700">
                    <font-awesome-icon :icon="['fas','key']"/> เข้าสู่ระบบ
                  </router-link>
                  
                  <span class="h-6 w-px bg-gray-200" aria-hidden="true"></span>

                  <router-link :to="'/student/register'" class="text-sm font-medium text-gray-700">
                    <font-awesome-icon :icon="['fas','user-plus']"/> สมัครสมาชิก
                  </router-link>

                </div>
              </div>

            </template>
    
            <template v-if="this.login">

              <div class="md:hidden ml-auto flex items-center">
                <div class="lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6 profile">
                  
                  <router-link :to="'/student/profile'" class="text-sm font-medium text-gray-700">
                    <span class="relative inline-block">
                      <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                      <span class="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
                    </span>
                  </router-link>
                </div>
              </div>

            </template>
            <template v-else>

              <div class="md:hidden ml-auto flex items-center">
                <div class="flex lg:ml-6">
                  <router-link :to="'/student/register'" class="p-2 text-gray-400 hover:text-gray-500">
                    <font-awesome-icon :icon="['fas','user-plus']" class="w-6 h-6"/>
                  </router-link>
                </div>

                <span class="h-6 w-px bg-gray-200" aria-hidden="true"></span>
  
                <div class="flex lg:ml-6">
                  <router-link :to="'/student/login'" class="p-2 text-gray-400 hover:text-gray-500">
                    <font-awesome-icon :icon="['fas','user-circle']" class="w-6 h-6"/>
                  </router-link>
                </div>
              </div>

            </template>

          </div>
        </div>
          
      </nav>
  </header>

  <div class="bg-white">
  
    <div class="relative isolate pt-14">
      <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
      </div>
      <div class="py-12 sm:py-16 lg:pb-20">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto max-w-2xl sm:text-center">
            <h2 class="text-base font-semibold leading-7 text-indigo-600">Everything you need</h2>
            <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">No server? No problem.</p>
            <p class="mt-6 text-lg leading-8 text-gray-600">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis.</p>

            

          </div>
        </div>
        <div class="relative overflow-hidden pt-16">
          <div class="mx-auto max-w-7xl px-6 lg:px-8">
            <img src="https://tailwindui.com/img/component-images/project-app-screenshot.png" alt="App screenshot" class="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10" width="2432" height="1442">
            <div class="relative" aria-hidden="true">
              <div class="absolute -inset-x-20 bottom-0 bg-gradient-to-t from-white pt-[7%]"></div>
            </div>
          </div>
        </div>
        <div class="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
          <dl class="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            <div class="relative pl-9">
              <dt class="inline font-semibold text-gray-900">
                <svg class="absolute left-1 top-1 h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clip-rule="evenodd" />
                </svg>
                Push to deploy.
              </dt>
              <dd class="inline">Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.</dd>
            </div>
      
            <div class="relative pl-9">
              <dt class="inline font-semibold text-gray-900">
                <svg class="absolute left-1 top-1 h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
                </svg>
                SSL certificates.
              </dt>
              <dd class="inline">Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.</dd>
            </div>
      
            <div class="relative pl-9">
              <dt class="inline font-semibold text-gray-900">
                <svg class="absolute left-1 top-1 h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd" />
                </svg>
                Simple queues.
              </dt>
              <dd class="inline">Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus.</dd>
            </div>
      
            <div class="relative pl-9">
              <dt class="inline font-semibold text-gray-900">
                <svg class="absolute left-1 top-1 h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 2.5c-1.31 0-2.526.386-3.546 1.051a.75.75 0 01-.82-1.256A8 8 0 0118 9a22.47 22.47 0 01-1.228 7.351.75.75 0 11-1.417-.49A20.97 20.97 0 0016.5 9 6.5 6.5 0 0010 2.5zM4.333 4.416a.75.75 0 01.218 1.038A6.466 6.466 0 003.5 9a7.966 7.966 0 01-1.293 4.362.75.75 0 01-1.257-.819A6.466 6.466 0 002 9c0-1.61.476-3.11 1.295-4.365a.75.75 0 011.038-.219zM10 6.12a3 3 0 00-3.001 3.041 11.455 11.455 0 01-2.697 7.24.75.75 0 01-1.148-.965A9.957 9.957 0 005.5 9c0-.028.002-.055.004-.082a4.5 4.5 0 018.996.084V9.15l-.005.297a.75.75 0 11-1.5-.034c.003-.11.004-.219.005-.328a3 3 0 00-3-2.965zm0 2.13a.75.75 0 01.75.75c0 3.51-1.187 6.745-3.181 9.323a.75.75 0 11-1.186-.918A13.687 13.687 0 009.25 9a.75.75 0 01.75-.75zm3.529 3.698a.75.75 0 01.584.885 18.883 18.883 0 01-2.257 5.84.75.75 0 11-1.29-.764 17.386 17.386 0 002.078-5.377.75.75 0 01.885-.584z" clip-rule="evenodd" />
                </svg>
                Advanced security.
              </dt>
              <dd class="inline">Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.</dd>
            </div>
      
            <div class="relative pl-9">
              <dt class="inline font-semibold text-gray-900">
                <svg class="absolute left-1 top-1 h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                </svg>
                Powerful API.
              </dt>
              <dd class="inline">Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.</dd>
            </div>
      
            <div class="relative pl-9">
              <dt class="inline font-semibold text-gray-900">
                <svg class="absolute left-1 top-1 h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M4.632 3.533A2 2 0 016.577 2h6.846a2 2 0 011.945 1.533l1.976 8.234A3.489 3.489 0 0016 11.5H4c-.476 0-.93.095-1.344.267l1.976-8.234z" />
                  <path fill-rule="evenodd" d="M4 13a2 2 0 100 4h12a2 2 0 100-4H4zm11.24 2a.75.75 0 01.75-.75H16a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75V15zm-2.25-.75a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75H13a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75h-.01z" clip-rule="evenodd" />
                </svg>
                Database backups.
              </dt>
              <dd class="inline">Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus.</dd>
            </div>
          </dl>
        </div>
      </div>
      <div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
      </div>
    </div>


    <!-- Single render example -->

  </div>
  
  
</template>

<style>
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 20%;
}

.middle-header {
  margin-top: 80px;
  text-align: center;
}

.popular-header {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding-top: 80px;
}
</style>