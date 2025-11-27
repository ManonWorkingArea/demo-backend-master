<script>
import feather from 'feather-icons';
import VueAvatar from "@webzlodimir/vue-avatar";
import "@webzlodimir/vue-avatar/dist/style.css";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';

import pluginRoutes from '@/extensions/loader';
import { getPluginRoutes, getPluginNames } from '@/plugins/UtilsLoader';
import storageManager from '@/plugins/storage';

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import debug from '@/plugins/Logger.js';

const pluginNames = getPluginNames(pluginRoutes);
const routesWithSubmenus = getPluginRoutes(pluginRoutes);
const storedConfigData = storageManager.get('configs');
const pluginNamesStorage = {
  data: pluginNames,
  timestamp: new Date().getTime(),
};

storageManager.set('plugins', pluginNamesStorage);

const storedPluginNames = storageManager.get('plugins');
if (storedPluginNames) {
  const parsedPluginNames = storedPluginNames;
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  const now = new Date().getTime();
  if (now - parsedPluginNames.timestamp < oneHour) {
    //const pluginNames = parsedPluginNames.data;
    //debug.log("pluginNames",pluginNames);
  } else {
    const pluginNames = getPluginNames(pluginRoutes);
    const newPluginNamesStorage = {
      data: pluginNames,
      timestamp: new Date().getTime(),
    };
    storageManager.set('plugins', newPluginNamesStorage);
  }
} else {
  const pluginNames = getPluginNames(pluginRoutes);
  const newPluginNamesStorage = {
    data: pluginNames,
    timestamp: new Date().getTime(),
  };
  storageManager.set('plugins', newPluginNamesStorage);
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
        role: route.meta.role,
        current: false,
        counter: false,
        session: route.session || false,
        front: route.meta.inFront || false,
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
  inject: ['config', 'saltSecret'],
  components: {
    VueAvatar,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
  },
  data() {
    return {
      configData: {},
      isOpen: false,
      navigation: this.navigation,
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      token: storageManager.get('session', 'token'),
      login: storageManager.get('session', 'login'),
      nav: storageManager.get('session', 'nav'),
      user: storageManager.get('session', 'user'),
      role: storageManager.get('session', 'role'),
      menu: null,
      className: 'bg-indigo-900 border-b border-gray-200',
      logoSrc: 'https://vue-project.sgp1.digitaloceanspaces.com/Logo/white-logopng.png',
      count: {
        order: 0,
        message: 0
      },
      userNavigation: [
        { name: 'ข้อมูลบัญชี', href: '/user/profile' },
        { name: 'ตั้งค่า', href: 'javascript:void(0);' },
        { name: 'Console', click: this.openNewWindow },
        { name: 'ออกจากระบบ', href: 'javascript:void(0);' }
      ]
      };
  },
  created() {
    this.className = this.config.siteStyle;
    this.logoSrc = this.config.siteLogo;
    this.siteName = this.config.siteName;
  },
  async mounted() {
    await this.countData();
    feather.replace();
    const rowRaw = storageManager.get('session', 'role');
    const roleDecrypt = rowRaw;
    const pluginData = storedConfigData && storedConfigData.plugins ? storedConfigData.plugins : [];

    const mainRoutes = [].concat(
      routesWithSubmenus
        .filter(routeWithSubmenu => {
          const hasValidRole = !routeWithSubmenu.role || routeWithSubmenu.role.includes(roleDecrypt);
          return routeWithSubmenu.meta.inMenu && pluginData.includes(routeWithSubmenu.slug) && hasValidRole;
        })
        .map(routeWithSubmenu => {
          return {
            slug: routeWithSubmenu.slug,
            name: routeWithSubmenu.name,
            href: routeWithSubmenu.path,
            icon: routeWithSubmenu.icon,
            inApp: routeWithSubmenu.inApp,
            inTop: routeWithSubmenu.inTop,
            counter: routeWithSubmenu.counter,
            hasSubmenu: routeWithSubmenu.hasSubmenu,
            session: routeWithSubmenu.session,
            fullscreen: routeWithSubmenu.fullscreen,
            current: false,
            submenu: buildMenuItems(routeWithSubmenu.routes, routeWithSubmenu.slug),
          };
        })
    );

    for (const route of mainRoutes) {
      if (route.counter) {
        try {
          let routerCount = 0; 
          if (route.href === "/message") {
            routerCount = this.count.message
            //debug.log("href", route.href);
          } else if (route.href === "/enroll") {
            routerCount = this.count.order
            //debug.log("href", route.href);
          }
          route.counter = routerCount > 99 ? '99+' : routerCount;
        } catch (error) {
          debug.error(`Failed to fetch counter for ${route.name}`, error);
        }
      }
    }
    const filteredRoutes = mainRoutes.filter(Top => Top.inTop === 'yes');
    this.navigation = filteredRoutes;

    const userRole = storageManager.get('session', 'role'); // Replace this with the actual user's role
    if(userRole==='manager') {
      this.navigation.forEach((item) => {
        if (item.submenu) {
          item.submenu = item.submenu.filter((submenuItem) =>
            submenuItem.role.includes(userRole)
          );
        }
      });
      this.navigation = this.navigation.filter((item) =>
        item.submenu ? item.submenu.length > 0 : true
      );
    }
    storageManager.set('navigation', mainRoutes);
  },
  methods: {
    openNewWindow() {
      window.open('debug/display', '_blank', 'width=500,height=600,location=no,status=no');
    },
    async countData() {
      
      try {
        const pipeline = [
          {
            $match: {
              unit: this.session.current._id,
              status: 'ลงทะเบียนคอร์ส'
            }
          },
          {
            $group: {
              _id: null,
              orderCount: { $sum: 1 },
            }
          },
          {
            $project: {
              _id: 0,
              orderCount: 1,
            }
          },
          {
            $unionWith: {
              coll: 'message',
              pipeline: [
                {
                  $match: {
                    parent: this.session.current._id,
                    status: 'submit'
                  }
                },
                {
                  $group: {
                    _id: null,
                    messageCount: { $sum: 1 },
                  }
                },
                {
                  $project: {
                    _id: 0,
                    messageCount: 1,
                  }
                }
              ],
            }
          }
        ];
        const { status, data } = await Request.POST('order/aggregate', { pipeline }, this.configs.key);
        if (status === 200) {
          const resultArray = Array.isArray(data) ? data : [data];
          const result0 = resultArray.find(item => item.orderCount !== undefined);
          const result1 = resultArray.find(item => item.messageCount !== undefined);
          this.count = {
            order: result0?.orderCount || 0,
            message: result1?.messageCount || 0,
          };
          debug.log(this.count);
        }
      } catch (error) {
        debug.log(error);
      }
    },
    logout() {
      this.$swal({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 500,
        icon: 'success',
        title: 'แจ้งเตือน',
        text: 'ออกจากระบบเรียบร้อยแล้ว',
      }).then(() => {
        storageManager.delete('session');
        storageManager.delete('hostname');
        storageManager.delete('erp'); // ลบ ERP mode
        window.location.href = '/member/login';
      });
    },
    updateRouteCounters(route) {
      debug.log("Update Router")
      for (const item of this.navigation) {
        if (item.href === route.path && item.counter) {
          this.countRouter(item.href)
            .then(routerCount => {
              item.counter = routerCount > 99 ? '99+' : routerCount;
            })
            .catch(error => {
              debug.error(`Failed to fetch counter for ${item.name}`, error);
            });
        }
      }
    },
  },
  beforeRouteUpdate(to, from, next) {
    this.updateRouteCounters(to);
    next();
  },
};
</script>

<template>

<div v-if="!$route.meta.fullscreen">
  <Disclosure as="nav" :class="className" v-slot="{  }" v-if="configData">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="relative flex h-16 items-center justify-between">
        
        <div class="flex items-center">
          <div class="flex-shrink-0 main-logo">
            <router-link :to="'/'">
              <img class="h-10 w-auto" :src="logoSrc" :alt="siteName" />
            </router-link>
          </div>

          <div class="hidden lg:ml-10 lg:block">
            <div class="flex space-x-1">
              <template v-for="item in navigation">
                <router-link v-if="!item.hasSubmenu" :key="item.href" :to="item.href" :class="[item.current ? 'bg-gray-100' : 'hover:bg-gray-100 hover:text-indigo-900', 'relative px-3 py-2 rounded-md text-sm font-medium text-white']" :aria-current="item.current ? 'page' : undefined">
                  <font-awesome-icon :icon="['fas',item.icon]"/> {{item.name}}
                  <span v-if="item.counter" class="nav-counter">{{item.counter}}</span>
                </router-link>
          
                <div v-if="item.hasSubmenu" :key="item.href">
                  <Menu as="div" class="relative">
                    <MenuButton class="ml-2 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-100 hover:text-indigo-900">
                      <font-awesome-icon :icon="['fas',item.icon]"/> {{ item.name }}
                      <span v-if="item.counter" class="nav-counter">{{item.counter}}</span>
                      <font-awesome-icon :icon="['fas','angle-down']" class="ml-1"/>
                    </MenuButton>
                    <MenuItems class="pt-2 pl-2 pr-2 pb-2 absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <MenuItem v-for="submenuItem in item.submenu" :key="submenuItem.href">
                        <router-link :to="submenuItem.href" :style="{ 'padding-left': '0.75rem' }" class="block py-2 px-4 text-sm text-gray-700 hover:rounded-md hover:bg-indigo-100 hover:text-indigo-900"><font-awesome-icon :icon="['fas',submenuItem.icon]"/> {{ submenuItem.name }}</router-link>
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </div>
              </template>
            </div>
          </div>
          
        </div>

        <!-- <div class="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
          <div class="w-full max-w-lg lg:max-w-xs">
            <label for="search" class="sr-only">ค้นหา</label>
            <div class="relative text-gray-400 focus-within:text-gray-500">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <font-awesome-icon :icon="['fas','search']" class="h-5 w-5" aria-hidden="true"/>
              </div>
              <input id="search" class="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm" placeholder="ค้นหา" type="search" name="search" />
            </div>
          </div>
        </div> -->
        <div class="flex lg:hidden">
          <Menu as="div" class="relative mt-1 flex-shrink-0">
            <div>
              <MenuButton class="flex rounded-full bg-gray-50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                <span class="sr-only">Open user menu</span>
                <vue-avatar 
                :img-src="''" 
                img-alt="Some image alt" 
                :size="33" class="h-8 w-8 rounded-full" />
              </MenuButton>
            </div>
            <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
              <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                  <a 
                    :href="item.href ? item.href : 'javascript:void(0);'" 
                    @click="item.click && item.click()" 
                    :class="[active ? 'bg-gray-100' : '', 'block py-2 px-4 text-sm text-gray-700']">
                    {{ item.name }}
                  </a>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
          <DisclosureButton class="inline-flex items-center justify-center rounded-md text-gray-white">
            <span class="sr-only">Open main menu</span>
            <button @click="logout" type="button" class="pt-2 ml-5 flex-shrink-0 rounded-full bg-transparent p-1 text-white hover:text-gray-500">
              <font-awesome-icon class="h-6 w-6" aria-hidden="true" :icon="['fas','power-off']"/>
            </button>
          </DisclosureButton>
        </div>

        <!-- Actions section -->
        <div class="hidden lg:ml-4 lg:block">
          <div class="flex items-center">
            
            <!-- Profile dropdown -->
            <Menu as="div" class="relative ml-3 flex-shrink-0">
              <div>
                <MenuButton class="flex rounded-full bg-gray-50 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                  <span class="sr-only">Open user menu</span>
                  <vue-avatar 
                  :img-src="''" 
                  img-alt="Some image alt" 
                  :size="33" class="h-10 w-10 rounded-full" />
                </MenuButton>
              </div>
              <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                    <a 
                      :href="item.href ? item.href : 'javascript:void(0);'" 
                      @click="item.click && item.click()" 
                      :class="[active ? 'bg-gray-100' : '', 'block py-2 px-4 text-sm text-gray-700']">
                      {{ item.name }}
                    </a>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>

            <button @click="logout" type="button" class="pt-2 ml-5 flex-shrink-0 rounded-full bg-transparent p-1 text-white hover:text-gray-500">
              <span class="sr-only">ออกจากระบบ</span>
              <font-awesome-icon class="h-6 w-6" aria-hidden="true" :icon="['fas','power-off']"/>
            </button>

          </div>
        </div>

      </div>
    </div>

    <DisclosurePanel class="border-b border-gray-200 bg-gray-50 lg:hidden">

      <div class="space-y-1 px-2 pt-2 pb-3">
        <template v-for="item in navigation">
          <router-link v-if="!item.submenu" :key="item.href" :to="item.href" :class="[item.current ? 'bg-gray-100' : 'hover:bg-gray-100', 'block relative px-3 py-2 rounded-md font-medium text-gray-900']" :aria-current="item.current ? 'page' : undefined">
            {{item.name}} <span v-if="item.counter" class="nav-counter">{{item.counter}}</span>
          </router-link>
      
          <div v-if="item.submenu" :key="item.href">
            <div class="flex items-center justify-between px-3 py-2 font-medium text-gray-900 bg-gray-100 cursor-pointer" @click="item.expanded = !item.expanded">
              <span>{{ item.name }}</span>
              <font-awesome-icon :icon="['fas', item.expanded ? 'angle-up' : 'angle-down']" class="w-4 h-4"></font-awesome-icon>
            </div>
      
            <div v-if="item.expanded" class="space-y-1 px-2 pt-2 pb-3">
              <router-link v-for="submenuItem in item.submenu" :key="submenuItem.href" :to="submenuItem.href" class="block px-3 py-2 rounded-md font-medium text-gray-900 hover:bg-gray-100">
                {{submenuItem.name}}
              </router-link>
            </div>
          </div>
        </template>
      </div>
      
      <div class="border-t border-gray-200 pt-4 pb-3">
        <div class="flex items-center px-5">
          <div class="flex-shrink-0">
            <vue-avatar :username="storageManager.get('session','token')" :size="50" class="h-10 w-10 rounded-full" />
          </div>
          <div class="ml-3">
            <div class="text-base font-medium text-gray-800">{{ user.name }}</div>
            <div class="text-sm font-medium text-gray-500">{{ user.email }}</div>
          </div>
          <button @click="logout" type="button" class="ml-auto flex-shrink-0 rounded-full bg-gray-50 p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
            <span class="sr-only">ออกจากระบบ</span>
            <font-awesome-icon class="h-6 w-6" aria-hidden="true" :icon="['fas','power-off']"/>
          </button>
        </div>
        <div class="mt-3 space-y-1 px-2">
          <DisclosureButton v-for="item in userNavigation" :key="item.name" as="a" :href="item.href" class="block rounded-md py-2 px-3 text-base font-medium text-gray-900 hover:bg-gray-100">{{ item.name }}</DisclosureButton>
        </div>
      </div>
    </DisclosurePanel>
  </Disclosure>
</div>
</template>

<style scoped>
.nav-counter
{
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  text-align: center;
  font-size: 10px;
  background: #ff0000;
  border-radius: 50%;
  color: #fff;
}
.nav-counter:hover
{
  color: #fff;
}
</style>