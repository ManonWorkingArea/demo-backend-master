<script>
  import pluginRoutes from '@/extensions/loader';
  import { getPluginRoutes,getPluginNames } from '@/plugins/utils';
  import storageManager from '@/plugins/storage';

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

  <header class=" w-full bg-white border-b border-gray-200 z-10">
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