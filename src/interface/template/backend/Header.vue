<script>

import { setLanguage, translate, getAllLanguages, getCurrentLanguage } from '@/plugins/language.js';
import VueAvatar from "@webzlodimir/vue-avatar";
import "@webzlodimir/vue-avatar/dist/style.css";
import { Disclosure, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';

import pluginRoutes from '@/extensions/loader';
import { getPluginRoutes } from '@/plugins/UtilsLoader';
import storageManager from '@/plugins/storage';

import MarqueeText from './Marquee.vue';

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import debug from '@/plugins/Logger.js';
const storedConfigData = storageManager.get('configs');


export default {
  inject: ['config', 'saltSecret'],
  components: {
    VueAvatar,
    Disclosure,
    DisclosurePanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    MarqueeText
  },
  data() {
    return {
      isMobileMenuOpen: false,
      expandedSubmenuIndex: null,
      // Translate
      current:'',
      languages: [],
      // Translate
      configData: {},
      isOpen: false,
      navigation: [],
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      token: storageManager.get('session', 'token'),
      login: storageManager.get('session', 'login'),
      nav: storageManager.get('session', 'nav'),
      user: storageManager.get('session', 'user'),
      role: storageManager.get('session', 'role'),
      menu: null,
      className: 'bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 border-b border-gray-200 shadow-lg backdrop-blur-sm',
      logoSrc: 'https://vue-project.sgp1.digitaloceanspaces.com/Logo/white-logopng.png',
      count: {
        order: 0,
        message: 0
      },
      selectedLanguage: { code: '', name: '', flag: '' },
      showSubMenu: false,
      isLoading: false,
      userNavigation: [
        { name: this.translate('member-profile'), href: '/user/profile', icon: 'user' },
        { name: this.translate('member-config'), href: 'javascript:void(0);', icon: 'cog' },
        { name: this.translate('member-console'), click: this.openNewWindow, icon: 'terminal' },
        { name: this.translate('member-logout'), href: 'javascript:void(0);', icon: 'sign-out-alt' }
      ]
      };
  },
  created() {
    this.className = this.config.siteStyle || this.className;
    this.logoSrc = this.config.siteLogo;
    this.siteName = this.config.siteName;
    // Translate
    this.languages = getAllLanguages();
    this.current = getCurrentLanguage();
    this.selectedLanguage = this.languages.find(language => language.code === this.current);
    // Load translations
    this.loadTranslations();
    // Translate
  },
  watch: {
    '$route'(to) {
      // Ensure mobile menu is closed and body overflow is reset on route change
      if (this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
        document.body.style.overflow = '';
      }
      this.updateRouteCounters(to);
    }
  },

  async mounted() {
    this.isLoading = true;
    await this.loadTranslations();
    await this.countData();
    
    // โหลดเมนูครั้งแรก
    await this.loadMenuData();
    this.isLoading = false;
  },
  methods: {
    translate,
    
    // โหลดข้อมูลเมนูใหม่ทุกครั้ง (ไม่ใช้ cache)
    async loadMenuData() {
      const rowRaw = storageManager.get('session', 'role');
      const roleDecrypt = rowRaw;
      const pluginData = storedConfigData && storedConfigData.plugins ? storedConfigData.plugins : [];

      const erpData = storageManager.get('erp');
      const useERPPermissions = erpData && erpData.job_assignments && erpData.job_assignments.length > 0;

      // เรียกใช้ UtilsLoader ใหม่ทุกครั้งเพื่อให้ได้การแปลภาษาล่าสุด
      const routesWithSubmenus = getPluginRoutes(pluginRoutes);
      
      // Apply router permissions to original routes structure
      const routesWithPermissions = this.applyRouterPermissionsToRoutes(routesWithSubmenus);

      const mainRoutes = [].concat(
        routesWithPermissions
          .filter(routeWithSubmenu => {
            const hasValidRole = !routeWithSubmenu.role || routeWithSubmenu.role.includes(roleDecrypt);
            const isInPlugins = pluginData.includes(routeWithSubmenu.slug);
            
            // ถ้ามี ERP permissions ให้แสดงเฉพาะโมดูลที่อยู่ใน permissions เท่านั้น
            if (useERPPermissions) {
              // เช็คว่าโมดูลนี้อยู่ใน ERP permissions หรือไม่
              const hasERPAccess = this.hasERPPermission(routeWithSubmenu.slug);
              // ถ้าไม่มีสิทธิ์ = ไม่แสดงโมดูลนี้เลย
              if (!hasERPAccess) {
                return false;
              }
            }
            
            return routeWithSubmenu.meta.inMenu && isInPlugins && hasValidRole;
          })
          .map(routeWithSubmenu => {
            // สร้าง submenu และกรอง role ในระดับ submenu รวมถึง router permissions overrides
            const filteredSubmenu = this.buildMenuItemsWithRoleCheck(routeWithSubmenu.routes, routeWithSubmenu.slug, roleDecrypt);
            
            return {
              slug: routeWithSubmenu.slug,
              name: routeWithSubmenu.translatedTitle || routeWithSubmenu.name,
              language: routeWithSubmenu.translatedTitle || routeWithSubmenu.name,
              subtitle: routeWithSubmenu.subtitle || routeWithSubmenu.meta?.subtitle || 'จัดการข้อมูล', // เพิ่ม subtitle พร้อมตัวอย่าง
              href: routeWithSubmenu.path,
              icon: routeWithSubmenu.icon,
              inApp: routeWithSubmenu.inApp,
              inTop: routeWithSubmenu.inTop,
              counter: routeWithSubmenu.counter,
              hasSubmenu: routeWithSubmenu.hasSubmenu && filteredSubmenu.length > 0, // อัปเดต hasSubmenu ตาม submenu ที่เหลือ
              session: routeWithSubmenu.session,
              fullscreen: routeWithSubmenu.fullscreen,
              current: false,
              submenu: filteredSubmenu,
              meta: routeWithSubmenu.meta // เพิ่ม meta สำหรับการแปลภาษา
            };
          })
          .filter(route => {
            // กรองเมนูที่ไม่มี submenu เหลือ (ถ้าเป็น parent menu ที่ไม่มี direct access)
            if (route.hasSubmenu) {
              return route.submenu.length > 0; // แสดงเฉพาะเมนูที่มี submenu ที่ user เข้าถึงได้
            }
            return true; // แสดงเมนูที่ไม่ใช่ parent menu
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
            //debug.error(`Failed to fetch counter for ${route.name}`, error);
          }
        }
      }
      const filteredRoutes = mainRoutes.filter(Top => Top.inTop === 'yes');
      this.navigation = filteredRoutes;

      // Role checking is now handled in buildMenuItemsWithRoleCheck method
      storageManager.set('navigation', mainRoutes);
    },
    
    // โหลดการแปลภาษาจากระบบ
    async loadTranslations() {
      try {
        // ตรวจสอบว่ามีการแปลภาษาใน storage หรือไม่
        const translations = storageManager.get('translate');
        if (!translations) {
          debug.log('No translations found in storage, loading from API...');
          // ถ้าไม่มี ให้โหลดจาก API (ถ้าจำเป็น)
          // await this.fetchTranslationsFromAPI();
        } else {
          debug.log('Translations loaded from storage:', Object.keys(translations));
          // แสดงตัวอย่างข้อมูลการแปล
          Object.keys(translations).forEach(group => {
            if (translations[group] && typeof translations[group] === 'object') {
              //debug.log(`Translation group "${group}":`, Object.keys(translations[group]));
            }
          });
        }
      } catch (error) {
        debug.error('Error loading translations:', error);
      }
    },
    
    /**
     * เช็คว่า user มีสิทธิ์เข้าถึง module/menu หรือไม่จาก ERP permissions
     * @param {string} moduleName - ชื่อโมดูล (เช่น 'accounting')
     * @param {string} menuKey - menu key (เช่น 'journal-entries'), null = เช็คเฉพาะโมดูล
     * @returns {boolean} - มีสิทธิ์หรือไม่
     */
    hasERPPermission(moduleName, menuKey = null) {
      const erpData = storageManager.get('erp');
      
      // ถ้าไม่มี ERP data หรือเป็น false = ไม่ใช้ระบบ permission นี้
      if (!erpData || erpData === false || !erpData.job_assignments || erpData.job_assignments.length === 0) {
        return true; // ผ่านทุกคน (ไม่มี HR plugin หรือไม่มี ERP user)
      }
      
      // รวม permissions จากทุก job_assignments
      const allPermissions = [];
      erpData.job_assignments.forEach(job => {
        if (job.permissions && Array.isArray(job.permissions)) {
          allPermissions.push(...job.permissions);
        }
      });
      
      // หาโมดูลที่ตรงกัน (ถ้ามีในตำแหน่งใดตำแหน่งหนึ่ง)
      const modulePerms = allPermissions.filter(p => p.module === moduleName);
      if (modulePerms.length === 0) {
        return false; // ไม่พบโมดูลเลย = ไม่มีสิทธิ์
      }
      
      // ถ้าไม่ระบุ menuKey = เช็คเฉพาะโมดูล
      if (!menuKey) {
        return true; // มีสิทธิ์เข้าโมดูล
      }
      
      // รวม menus จากทุกตำแหน่งของ module นี้
      const allMenus = [];
      modulePerms.forEach(modulePerm => {
        if (modulePerm.menus && Array.isArray(modulePerm.menus)) {
          allMenus.push(...modulePerm.menus);
        }
      });
      
      // หา menu item ที่ตรงกัน (ถ้ามี visible: true ในตำแหน่งใดตำแหน่งหนึ่ง)
      const menuPerm = allMenus.find(m => m.menu_key === menuKey && m.visible === true);
      return !!menuPerm; // มีสิทธิ์ถ้า visible = true ในตำแหน่งใดตำแหน่งหนึ่ง
    },

    // สร้าง menu items พร้อมเช็ค role ในระดับ submenu รวมถึง router permissions overrides
    buildMenuItemsWithRoleCheck(routes, parent, userRole) {
      if (!routes) {
        return [];
      }

      const erpData = storageManager.get('erp');
      const useERPPermissions = erpData && erpData !== false && erpData.job_assignments && erpData.job_assignments.length > 0;

      return routes.reduce((acc, route) => {
        // เช็คว่าควรแสดงใน menu หรือไม่ (รวม override)
        const shouldShowInMenu = this.checkMenuVisibility(route, parent);
        
        if (shouldShowInMenu) {
          // เช็ค role ของ submenu item (รวม override)
          const effectiveRole = this.getEffectiveRole(route, parent);
          const hasValidRole = this.checkRoleAccess(effectiveRole, userRole);
          
          if (hasValidRole) {
            // เช็ค ERP permission ถ้าเปิดใช้งาน
            if (useERPPermissions) {
              const hasPermission = this.hasERPPermission(parent, route.path);
              if (!hasPermission) {
                return acc; // Skip menu นี้
              }
            }
            
            // ใช้ translatedTitle เป็นหลัก
            const translatedName = route.translatedTitle || route.meta?.translatedTitle || route.name;
            
            const menuItem = {
              name: translatedName,
              href: `/${parent}/${route.path}`,
              icon: route.meta?.icon || 'file',
              role: effectiveRole,
              language: translatedName,
              current: false,
              counter: false,
              session: route.session || false,
              front: route.meta?.inFront || false,
              submenu: null,
            };
            
            // ถ้ามี children ให้เช็ค role ในระดับลึกลงไปด้วย
            if (route.children && route.children.length > 0) {
              const childParent = parent.includes('/') ? `${parent}/${route.path}` : `${parent}-${route.path}`;
              const filteredChildren = this.buildMenuItemsWithRoleCheck(route.children, childParent, userRole);
              if (filteredChildren.length > 0) {
                menuItem.submenu = filteredChildren;
              }
            }
            
            acc.push(menuItem);
          }
        }
        return acc;
      }, []);
    },

    // ตรวจสอบว่าควรแสดงใน menu หรือไม่ (รวม router permissions overrides)
    checkMenuVisibility(route, parent) {
      // เช็ค override จาก router permissions ก่อน
      const overrideRoute = this.findRouterOverrideForSubmenu(route, parent);
      
      if (overrideRoute && overrideRoute.meta && typeof overrideRoute.meta.inMenu !== 'undefined') {
        return overrideRoute.meta.inMenu;
      }
      
      // ถ้าไม่มี override ใช้ค่าเดิม
      return route.meta?.inMenu !== false; // default เป็น true
    },

    // ดึง role ที่มีผลจริง (รวม router permissions overrides)
    getEffectiveRole(route, parent) {
      // เช็ค override จาก router permissions ก่อน
      const overrideRoute = this.findRouterOverrideForSubmenu(route, parent);
      
      if (overrideRoute && overrideRoute.meta && overrideRoute.meta.role) {
        // ถ้า role เป็น string ให้แปลงเป็น array
        const overrideRole = overrideRoute.meta.role;
        return Array.isArray(overrideRole) ? overrideRole : [overrideRole];
      }
      
      // ถ้าไม่มี override ใช้ค่าเดิม
      const originalRole = route.meta?.role || route.role || [];
      return Array.isArray(originalRole) ? originalRole : [originalRole];
    },

    // ค้นหา router override สำหรับ submenu โดยใช้หลายวิธี
    findRouterOverrideForSubmenu(route, parent) {
      if (!this.$router) return null;
      
      const allRoutes = this.$router.getRoutes();
      
      // วิธีที่ 1: ค้นหาด้วย full path ที่สร้างจาก parent + route.path
      const fullPath1 = `/${parent}/${route.path}`;
      let overrideRoute = allRoutes.find(r => r.path === fullPath1);
      
      if (overrideRoute) {
        return overrideRoute;
      }
      
      // วิธีที่ 2: ค้นหาด้วย route.path โดยตรง (ถ้าเป็น absolute path)
      if (route.path.startsWith('/')) {
        overrideRoute = allRoutes.find(r => r.path === route.path);
        if (overrideRoute) {
          return overrideRoute;
        }
      }
      
      // วิธีที่ 3: ค้นหาด้วย route name
      if (route.name) {
        overrideRoute = allRoutes.find(r => r.name === route.name);
        if (overrideRoute) {
          return overrideRoute;
        }
      }
      
      // วิธีที่ 4: ค้นหาใน child routes ของ parent route
      const parentRoute = allRoutes.find(r => r.path === `/${parent}`);
      if (parentRoute && parentRoute.children) {
        overrideRoute = parentRoute.children.find(child => 
          child.path === route.path || 
          child.name === route.name ||
          child.path === `/${parent}/${route.path}`
        );
        if (overrideRoute) {
          return overrideRoute;
        }
      }
      
      return null;
    },

    // ตรวจสอบสิทธิ์การเข้าถึงตาม role
    checkRoleAccess(effectiveRole, userRole) {
      // ถ้าไม่มี role กำหนด หรือ role เป็น array ว่าง = อนุญาตทุกคน
      if (!effectiveRole || effectiveRole.length === 0) {
        return true;
      }
      
      // ถ้า effectiveRole เป็น string ให้แปลงเป็น array
      const roleArray = Array.isArray(effectiveRole) ? effectiveRole : [effectiveRole];
      
      // ตรวจสอบว่า userRole อยู่ใน roleArray หรือไม่
      return roleArray.includes(userRole);
    },

    // ค้นหา router override สำหรับ route path ที่กำหนด (เก็บไว้สำหรับ backward compatibility)
    findRouterOverride(routePath) {
      if (!this.$router) return null;
      
      const allRoutes = this.$router.getRoutes();
      return allRoutes.find(route => route.path === routePath);
    },
    // Apply router permissions to original routes structure (รวม nested routes)
    applyRouterPermissionsToRoutes(originalRoutes) {
      // Get all routes from router (includes permissions overrides)
      const allRouterRoutes = this.$router.getRoutes();
      
      // Create a map of router routes by path for quick lookup
      const routerRoutesMap = {};
      allRouterRoutes.forEach(route => {
        routerRoutesMap[route.path] = route;
      });
      
      // Apply permissions to original routes structure
      return originalRoutes.map(routeGroup => {
        const updatedRouteGroup = { ...routeGroup };
        
        // Update main route permissions if found in router
        const mainRouterRoute = routerRoutesMap[routeGroup.path];
        if (mainRouterRoute && mainRouterRoute.meta) {
          updatedRouteGroup.role = mainRouterRoute.meta.role || routeGroup.role;
          updatedRouteGroup.meta = { ...routeGroup.meta, ...mainRouterRoute.meta };
        }
        
        // Update sub-routes permissions (รวม nested routes)
        if (routeGroup.routes && routeGroup.routes.length > 0) {
          updatedRouteGroup.routes = this.applyPermissionsToSubRoutes(routeGroup.routes, routeGroup.slug, routerRoutesMap);
        }
        
        return updatedRouteGroup;
      });
    },

    // Apply permissions to sub-routes แบบ recursive
    applyPermissionsToSubRoutes(routes, parentSlug, routerRoutesMap) {
      return routes.map(subRoute => {
        const routePath = `/${parentSlug}/${subRoute.path}`;
        const routerSubRoute = routerRoutesMap[routePath];
        
        let updatedSubRoute = { ...subRoute };
        
        // Apply router permissions override
        if (routerSubRoute && routerSubRoute.meta) {
          updatedSubRoute.role = routerSubRoute.meta.role || subRoute.role;
          updatedSubRoute.meta = { ...subRoute.meta, ...routerSubRoute.meta };
        }
        
        // Apply permissions to nested children
        if (subRoute.children && subRoute.children.length > 0) {
          updatedSubRoute.children = this.applyPermissionsToSubRoutes(
            subRoute.children, 
            `${parentSlug}/${subRoute.path}`, 
            routerRoutesMap
          );
        }
        
        return updatedSubRoute;
      });
    },
    handleMenuNavigation(to) {
      if (this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
      }
      document.body.style.overflow = ''; // Always ensure overflow is cleared
      this.closeSubMenu(); // Close any open desktop submenus

      // If navigating to the current route, do nothing to prevent "NavigationDuplicated" error
      if (this.$route.path === to) {
        return;
      }
      this.$router.push(to);
    },
    toggleSubMenu() {
      this.showSubMenu = !this.showSubMenu;
    },
    closeSubMenu() {
      this.showSubMenu = false;
    },
    async selectLanguage(language) {
      this.selectedLanguage = language;
      this.showSubMenu = false;
      await setLanguage(language.code);
      
      // อัปเดตภาษาปัจจุบัน
      this.current = language.code;
      
      // โหลดเมนูใหม่ด้วยภาษาใหม่
      await this.loadMenuData();
      
      // อัปเดต userNavigation ด้วยภาษาใหม่
      this.userNavigation = [
        { name: this.translate('member-profile'), href: '/user/profile', icon: 'user' },
        { name: this.translate('member-config'), href: 'javascript:void(0);', icon: 'cog' },
        { name: this.translate('member-console'), click: this.openNewWindow, icon: 'terminal' },
        { name: this.translate('member-logout'), href: 'javascript:void(0);', icon: 'sign-out-alt' }
      ];
    },
    async changeLanguage(event) { 
      const selectedLanguageCode = event.target.value;
      await setLanguage(selectedLanguageCode);
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      // Prevent body scroll when mobile menu is open
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
    toggleSubmenu(index) {
      this.expandedSubmenuIndex = this.expandedSubmenuIndex === index ? null : index;
    },
    menuNameTranslate(name, route = null) {
      // ถ้ามี route ให้ลองใช้ระบบแปลภาษาก่อน
      if (route && route.meta?.parent && route.meta?.key) {
        const translationKey = `${route.meta.parent}-${route.meta.key}`;
        const translated = translate(translationKey);
        if (translated !== translationKey) {
          return translated;
        }
      }
      
      // ถ้าไม่มีการแปล ใช้วิธีเดิม
      if (typeof name === 'object' && name[this.current]) {
        return name[this.current];
      } else if (typeof name === 'string') {
        return name;
      } else {
        return 'Undefined';
      }
    },
    

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
        storageManager.delete('navigation'); // ลบเมนู
        window.location.href = '/member/login';
      });
    },
    updateRouteCounters(route) {
      if (!this.navigation || !Array.isArray(this.navigation)) {
        return;
      }
      
      for (const item of this.navigation) {
        if (item.href === route.path && item.counter) {
          const count = item.href === "/message" ? this.count.message : 
                       item.href === "/enroll" ? this.count.order : 0;
          item.counter = count > 99 ? '99+' : count;
        }
      }
    },

  },

  beforeUnmount() {
    // Clean up body overflow when component is destroyed
    document.body.style.overflow = '';
  }
};
</script>

<template>
<div v-if="!$route.meta.fullscreen">
  <!-- Loading Overlay -->
  <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      <span class="text-gray-700">กำลังโหลด...</span>
    </div>
  </div>

  <!-- Marquee Section -->
  <div class="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
    <div class="mx-auto px-4 sm:px-6 lg:px-8">
      <MarqueeText class="text-white text-sm py-2 font-medium" :text="translate('general-marquee')" duration="30" />
    </div>
  </div>

  <Disclosure as="nav" :class="className" v-if="configData">
    <div class="mx-auto px-4 sm:px-6 lg:px-8">
      <div class="relative flex h-16 items-center justify-between">
        
        <div class="flex items-center">
          <!-- Mobile Menu Button -->
          <div class="lg:hidden">
            <button @click="toggleMobileMenu" 
                    class="p-2 rounded-md text-white hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200">
              <font-awesome-icon :icon="['fas', 'bars']" class="text-lg"/>
            </button>
        
            <!-- Enhanced Mobile Menu Panel -->
            <transition
              enter-active-class="transition-transform duration-300 ease-out"
              enter-from-class="-translate-x-full"
              enter-to-class="translate-x-0"
              leave-active-class="transition-transform duration-300 ease-in"
              leave-from-class="translate-x-0"
              leave-to-class="-translate-x-full">
              <div v-if="isMobileMenuOpen" class="mobile-menu-enhanced">
                <div class="header-container-enhanced">
                  <div class="site-info">
                    <h3 class="site-name-enhanced">{{ siteName }}</h3>
                    <p class="site-subtitle">{{ session.current.siteName }}</p>
                  </div>
                  
                  <button @click="toggleMobileMenu" class="close-btn-enhanced">
                    <font-awesome-icon :icon="['fas', 'times']" class="text-lg"/>
                  </button>
                </div>

                <div class="menu-content-enhanced">
                  <div v-for="(item, index) in navigation" :key="item.href" class="menu-group">
                    <button @click="toggleSubmenu(index)" 
                            class="menu-item-enhanced"
                            :class="{ 'active': expandedSubmenuIndex === index }">
                      <div class="menu-item-content">
                        <div class="menu-item-left">
                          <div class="icon-wrapper">
                            <font-awesome-icon :icon="['fas', item.icon]" class="menu-icon" />
                          </div>
                          <span class="menu-text">{{ item.language }}</span>
                          <span v-if="item.counter" class="nav-counter-enhanced">{{ item.counter }}</span>
                        </div>
                        <font-awesome-icon 
                          :icon="['fas', 'chevron-down']" 
                          class="chevron-enhanced" 
                          :class="{'rotate-180': expandedSubmenuIndex === index}" />
                      </div>
                    </button>

                    <transition
                      enter-active-class="transition-all duration-200 ease-out"
                      enter-from-class="opacity-0 max-h-0"
                      enter-to-class="opacity-100 max-h-96"
                      leave-active-class="transition-all duration-200 ease-in"
                      leave-from-class="opacity-100 max-h-96"
                      leave-to-class="opacity-0 max-h-0">
                      <div v-if="item.hasSubmenu && expandedSubmenuIndex === index" class="submenu-enhanced">
                        <button v-for="submenuItem in item.submenu" 
                                :key="submenuItem.href" 
                                @click.prevent="handleMenuNavigation(submenuItem.href); expandedSubmenuIndex = null" 
                                class="submenu-item-enhanced">
                          <font-awesome-icon :icon="['fas', submenuItem.icon]" class="submenu-icon" />
                          {{ submenuItem.language }}
                        </button>
                      </div>
                    </transition>
                  </div>
                </div>

                <div class="language-section-enhanced">
                  <div class="language-header">
                    <font-awesome-icon :icon="['fas', 'globe']" class="text-gray-500 mr-2" />
                    <span class="text-gray-600 text-sm font-medium">ภาษา</span>
                  </div>
                  <div class="language-grid">
                    <button v-for="language in languages" 
                            :key="language.code" 
                            @click="selectLanguage(language)" 
                            class="language-btn-enhanced"
                            :class="{ 'active': language.code === current }">
                      <img :src="language.flag" alt="Language Flag" class="language-flag-enhanced">
                      <span>{{ language.name }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </transition>

            <!-- Mobile Menu Backdrop -->
            <transition
              enter-active-class="transition-opacity duration-300 ease-out"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-300 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0">
              <div v-if="isMobileMenuOpen" 
                   @click="toggleMobileMenu" 
                   class="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
            </transition>
          </div>

          <!-- Logo -->
          <div class="flex-shrink-0 main-logo ml-4 lg:ml-0">
            <button @click.prevent="handleMenuNavigation('/')"
                    class="transition-transform duration-200 hover:scale-105">
              <img class="h-10 w-auto" :src="logoSrc" :alt="siteName" />
            </button>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden lg:ml-8 lg:block">
            <div class="flex space-x-1">
              <template v-for="item in navigation" :key="item.href">
                <!-- Simple Menu Item -->
                <button v-if="!item.hasSubmenu"
                        @click.prevent="handleMenuNavigation(item.href)"
                        class="nav-item-enhanced flex items-center justify-between min-w-0"
                        :class="{ 'active': item.current }">
                  <div class="flex items-center min-w-0">
                    <font-awesome-icon :icon="['fas',item.icon]" class="mr-2 text-lg flex-shrink-0"/>
                    <div class="w-px h-5 bg-white bg-opacity-20 mr-2 flex-shrink-0"></div>
                    <div class="flex flex-col items-start min-w-0">
                      <span class="truncate text-sm">{{ item.language }}</span>
                      <span v-if="item.subtitle" class="menu-subtitle truncate">{{ item.subtitle }}</span>
                    </div>
                  </div>
                  <span v-if="item.counter" class="nav-counter-desktop">{{item.counter}}</span>
                </button>

                <!-- Dropdown Menu Item -->
                <div v-if="item.hasSubmenu" class="relative">
                  <Menu as="div" class="relative">
                    <MenuButton class="nav-item-enhanced group flex items-center justify-between min-w-0">
                      <div class="flex items-center min-w-0">
                        <font-awesome-icon :icon="['fas',item.icon]" class="mr-2 text-lg flex-shrink-0"/>
                        <div class="w-px h-5 bg-white bg-opacity-20 mr-2 flex-shrink-0"></div>
                        <div class="flex flex-col items-start min-w-0">
                          <span class="truncate text-sm">{{ item.language }}</span>
                          <span v-if="item.subtitle" class="menu-subtitle truncate">{{ item.subtitle }}</span>
                        </div>
                      </div>
                      <div class="flex items-center ml-2">
                        <span v-if="item.counter" class="nav-counter-desktop mr-1">{{item.counter}}</span>
                        <font-awesome-icon :icon="['fas','chevron-down']"
                                         class="text-[9px] transition-transform duration-200 group-hover:rotate-180 flex-shrink-0"/>
                      </div>
                    </MenuButton>

                    <transition
                      enter-active-class="transition ease-out duration-200"
                      enter-from-class="opacity-0 scale-95 translate-y-1"
                      enter-to-class="opacity-100 scale-100 translate-y-0"
                      leave-active-class="transition ease-in duration-150"
                      leave-from-class="opacity-100 scale-100 translate-y-0"
                      leave-to-class="opacity-0 scale-95 translate-y-1">
                      <MenuItems class="submenu-desktop-enhanced">
                        <MenuItem v-for="submenuItem in item.submenu"
                                :key="submenuItem.href"
                                v-slot="{ active, close }">
                          <button @click.prevent="handleMenuNavigation(submenuItem.href); close()"
                                  class="submenu-desktop-item"
                                  :class="{ 'active': active }">
                            <font-awesome-icon :icon="['fas',submenuItem.icon]" class="mr-3"/>
                            {{ submenuItem.language }}
                          </button>
                        </MenuItem>
                      </MenuItems>
                    </transition>
                  </Menu>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Right Side Actions -->
        <div class="flex items-center space-x-3">
          <!-- Mobile User Menu -->
          <div class="lg:hidden flex items-center space-x-2">
            <Menu as="div" class="relative">
              <MenuButton class="user-avatar-btn">
                <vue-avatar :img-src="''" img-alt="User Avatar" :size="32" class="rounded-full ring-2 ring-white ring-opacity-20" />
              </MenuButton>
              
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95">
                <MenuItems class="user-menu-enhanced">
                  <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                    <a :href="item.href ? item.href : 'javascript:void(0);'" 
                       @click="item.click && item.click()" 
                       class="user-menu-item"
                       :class="{ 'active': active }">
                      <font-awesome-icon :icon="['fas', item.icon]" class="mr-3"/>
                      {{ item.name }}
                    </a>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>

            <!-- Mobile Language Selector -->
            <div class="relative ml-2 hidden lg:block">
              <button @click="toggleSubMenu" class="language-selector-mobile">
                <img :src="selectedLanguage.flag" alt="Language Flag" class="w-5 h-5 mr-2">
                {{ selectedLanguage.code }}
                <font-awesome-icon :icon="showSubMenu ? ['fas', 'caret-up'] : ['fas', 'caret-down']" 
                                 class="ml-2 transition-transform duration-200" />
              </button>
              
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 scale-95 translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 translate-y-1">
                <ul v-if="showSubMenu" class="language-dropdown-enhanced">
                  <li v-for="language in languages" 
                      :key="language.code" 
                      @click="selectLanguage(language)" 
                      class="language-dropdown-item"
                      :class="{ 'active': language.code === current }">
                    <img :src="language.flag" alt="Language Flag" class="w-4 h-4 mr-2">
                    <span>{{ language.name }}</span>
                  </li>
                </ul>
              </transition>
              
              <div v-if="showSubMenu" @click="closeSubMenu" class="fixed inset-0 z-10"></div>
            </div>
            
            <!-- Mobile Logout Button -->
            <button @click="logout" class="logout-btn-mobile">
              <font-awesome-icon :icon="['fas','power-off']" class="h-5 w-5"/>
            </button>
          </div>

          <!-- Desktop Actions -->
          <div class="hidden lg:flex lg:items-center lg:space-x-4">
            <!-- Desktop User Menu -->
            <Menu as="div" class="relative">
              <MenuButton class="user-avatar-btn">
                <vue-avatar :img-src="''" img-alt="User Avatar" :size="36" class="rounded-full ring-2 ring-white ring-opacity-20" />
              </MenuButton>
              
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95">
                <MenuItems class="user-menu-enhanced">
                  <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                    <a :href="item.href ? item.href : 'javascript:void(0);'" 
                       @click="item.click && item.click()" 
                       class="user-menu-item"
                       :class="{ 'active': active }">
                      <font-awesome-icon :icon="['fas', item.icon]" class="mr-3"/>
                      {{ item.name }}
                    </a>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>

            <!-- Desktop Language Selector -->
            <div class="relative">
              <button @click="toggleSubMenu" class="language-selector-desktop">
                <img :src="selectedLanguage.flag" alt="Language Flag" class="w-5 h-5 mr-2">
                {{ selectedLanguage.code }}
                <font-awesome-icon :icon="showSubMenu ? ['fas', 'caret-up'] : ['fas', 'caret-down']" 
                                 class="ml-2 transition-transform duration-200" />
              </button>
              
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 scale-95 translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 translate-y-1">
                <ul v-if="showSubMenu" class="language-dropdown-enhanced">
                  <li v-for="language in languages" 
                      :key="language.code" 
                      @click="selectLanguage(language)" 
                      class="language-dropdown-item"
                      :class="{ 'active': language.code === current }">
                    <img :src="language.flag" alt="Language Flag" class="w-4 h-4 mr-2">
                    <span>{{ language.name }}</span>
                  </li>
                </ul>
              </transition>
              
              <div v-if="showSubMenu" @click="closeSubMenu" class="fixed inset-0 z-10"></div>
            </div>

            <!-- Desktop Logout Button -->
            <button @click="logout" class="logout-btn-desktop">
              <font-awesome-icon :icon="['fas','power-off']" class="h-5 w-5"/>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Disclosure Panel (Fallback) -->
    <DisclosurePanel class="lg:hidden bg-white border-t border-gray-200">
      <div class="space-y-1 px-4 pt-2 pb-3">
        <template v-for="item in navigation" :key="item.href">
          <button v-if="!item.submenu"
                  @click.prevent="handleMenuNavigation(item.href)"
                  class="mobile-nav-item"
                  :class="{ 'active': item.current }">
            <font-awesome-icon :icon="['fas', item.icon]" class="mr-3"/>
            {{ item.language }}
            <span v-if="item.counter" class="nav-counter-mobile">{{item.counter}}</span>
          </button>

          <div v-if="item.submenu">
            <button @click="item.expanded = !item.expanded"
                    class="mobile-nav-item-expandable">
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center">
                  <font-awesome-icon :icon="['fas', item.icon]" class="mr-3"/>
                  <span>{{ item.language }}</span>
                </div>
                <font-awesome-icon :icon="['fas', item.expanded ? 'chevron-up' : 'chevron-down']"
                                 class="transition-transform duration-200"/>
              </div>
            </button>

            <transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-96"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 max-h-96"
              leave-to-class="opacity-0 max-h-0">
              <div v-if="item.expanded" class="overflow-hidden">
                <div class="space-y-1 px-4 pt-2 pb-3">
                  <button v-for="submenuItem in item.submenu"
                          :key="submenuItem.href"
                          @click.prevent="handleMenuNavigation(submenuItem.href); item.expanded = false"
                          class="mobile-submenu-item">
                    <font-awesome-icon :icon="['fas', submenuItem.icon]" class="mr-3"/>
                    {{ submenuItem.language }}
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </template>
      </div>
    </DisclosurePanel>
  </Disclosure>
</div>
</template>

<style scoped>
/* Enhanced Navigation Styles */
.nav-item-enhanced {
  @apply relative px-4 py-2 rounded-lg text-xs font-medium text-white transition-all duration-200 ease-in-out;
  @apply hover:bg-white hover:bg-opacity-10 hover:shadow-lg hover:scale-105;
  @apply focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50;
  @apply min-w-0 max-w-none;
}

.nav-item-enhanced.active {
  @apply bg-white bg-opacity-20 shadow-lg;
}

.menu-subtitle {
  @apply text-[10px] text-white text-opacity-60 leading-tight -mt-0.5;
  @apply font-light;
}

.nav-counter-desktop {
  @apply relative min-w-[18px] h-4 px-1.5 text-xs font-bold;
  @apply bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full;
  @apply flex items-center justify-center shadow-sm;
  @apply flex-shrink-0;
}

/* Enhanced Submenu Styles */
.submenu-desktop-enhanced {
  @apply absolute right-0 z-50 mt-2 w-56 origin-top-right;
  @apply bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5;
  @apply border border-gray-100 backdrop-blur-sm;
  @apply overflow-hidden;
}

.submenu-desktop-item {
  @apply w-full text-left px-4 py-3 text-sm text-gray-700 transition-all duration-150;
  @apply hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50;
  @apply hover:text-indigo-900 flex items-center;
  @apply focus:outline-none focus:bg-indigo-50;
  @apply border-b border-gray-100 last:border-b-0;
}

.submenu-desktop-item:first-child {
  @apply rounded-t-xl;
}

.submenu-desktop-item:last-child {
  @apply rounded-b-xl;
}

.submenu-desktop-item.active {
  @apply bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900;
}

.submenu-desktop-item.active:first-child {
  @apply rounded-t-xl;
}

.submenu-desktop-item.active:last-child {
  @apply rounded-b-xl;
}

/* Enhanced Mobile Menu */
.mobile-menu-enhanced {
  @apply fixed top-0 left-0 bottom-0 w-80 max-w-sm bg-white z-50;
  @apply shadow-lg border-r border-gray-200;
  @apply flex flex-col overflow-hidden;
}

.header-container-enhanced {
  @apply flex items-center justify-between p-4 bg-gray-800;
  @apply border-b border-gray-300;
}

.site-info {
  @apply flex-1;
}

.site-name-enhanced {
  @apply text-lg font-semibold text-white mb-1;
}

.site-subtitle {
  @apply text-sm text-gray-200;
}

.close-btn-enhanced {
  @apply p-2 rounded-md text-white hover:bg-gray-700;
  @apply transition-colors duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-gray-500;
}

.menu-content-enhanced {
  @apply flex-1 overflow-y-auto p-3 space-y-1;
}

.menu-group {
  @apply border-b border-gray-100 last:border-b-0 pb-2 last:pb-0 mb-2;
}

.menu-item-enhanced {
  @apply w-full text-left p-3 rounded-md transition-colors duration-200;
  @apply hover:bg-gray-100;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50;
}

.menu-item-enhanced.active {
  @apply bg-blue-50;
}

.menu-item-content {
  @apply flex items-center justify-between;
}

.menu-item-left {
  @apply flex items-center space-x-3;
}

.icon-wrapper {
  @apply w-8 h-8 rounded-md bg-gray-600;
  @apply flex items-center justify-center;
}

.menu-icon {
  @apply text-white text-sm;
}

.menu-text {
  @apply font-medium text-gray-800 text-sm;
}

.nav-counter-enhanced {
  @apply ml-2 min-w-[18px] h-5 px-1.5 text-xs font-bold;
  @apply bg-red-500 text-white rounded-full;
  @apply flex items-center justify-center;
}

.chevron-enhanced {
  @apply text-gray-400 transition-transform duration-200 text-sm;
}

.submenu-enhanced {
  @apply mt-2 ml-6 space-y-1 overflow-hidden;
}

.submenu-item-enhanced {
  @apply w-full text-left p-3 pl-4 rounded-md text-sm text-gray-600;
  @apply hover:bg-gray-100 hover:text-gray-800 transition-colors duration-150;
  @apply flex items-center;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50;
}

.submenu-icon {
  @apply text-gray-400 text-sm w-4 flex-shrink-0 mr-6;
}

/* Enhanced Language Section */
.language-section-enhanced {
  @apply border-t border-gray-200 p-3 bg-gray-50;
}

.language-header {
  @apply flex items-center mb-2;
}

.language-grid {
  @apply grid grid-cols-3 gap-1;
}

.language-btn-enhanced {
  @apply flex flex-col items-center justify-center p-2 rounded-md text-xs;
  @apply border border-gray-200 hover:border-gray-300;
  @apply hover:bg-gray-100 transition-colors duration-200;
  @apply focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50;
  @apply min-h-[48px];
}

.language-btn-enhanced.active {
  @apply bg-blue-50 border-blue-300 text-blue-800 font-medium;
}

.language-flag-enhanced {
  @apply w-4 h-4 rounded-sm;
}

/* User Menu Styles */
.user-avatar-btn {
  @apply flex rounded-full transition-all duration-200 transform hover:scale-110;
  @apply focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50;
}

.user-menu-enhanced {
  @apply absolute right-0 z-50 mt-2 w-56 origin-top-right;
  @apply bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5;
  @apply border border-gray-100 backdrop-blur-sm;
  @apply overflow-hidden;
}

.user-menu-item {
  @apply block px-4 py-3 text-sm text-gray-700 transition-all duration-150;
  @apply hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50;
  @apply hover:text-indigo-900 flex items-center;
  @apply focus:outline-none focus:bg-indigo-50;
  @apply border-b border-gray-100 last:border-b-0;
}

.user-menu-item > .fa-solid {
  @apply mr-4;
}

.user-menu-item:first-child {
  @apply rounded-t-xl;
}

.user-menu-item:last-child {
  @apply rounded-b-xl;
}

.user-menu-item.active {
  @apply bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900;
}

.user-menu-item.active:first-child {
  @apply rounded-t-xl;
}

.user-menu-item.active:last-child {
  @apply rounded-b-xl;
}

/* Language Selector Styles */
.language-selector-mobile,
.language-selector-desktop {
  @apply px-3 py-2 rounded-lg text-sm font-medium text-white;
  @apply bg-white bg-opacity-10 hover:bg-opacity-20;
  @apply flex items-center transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50;
}

.language-dropdown-enhanced {
  @apply absolute top-full right-0 z-50 mt-2 w-48 origin-top-right;
  @apply bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5;
  @apply border border-gray-100 backdrop-blur-sm;
  @apply overflow-hidden;
}

.language-dropdown-item {
  @apply px-4 py-3 flex items-center cursor-pointer text-sm text-gray-700;
  @apply hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50;
  @apply hover:text-indigo-900 transition-all duration-150;
  @apply border-b border-gray-100 last:border-b-0;
}

.language-dropdown-item:first-child {
  @apply rounded-t-xl;
}

.language-dropdown-item:last-child {
  @apply rounded-b-xl;
}

.language-dropdown-item.active {
  @apply bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 font-medium;
}

.language-dropdown-item.active:first-child {
  @apply rounded-t-xl;
}

.language-dropdown-item.active:last-child {
  @apply rounded-b-xl;
}

/* Logout Button Styles */
.logout-btn-mobile,
.logout-btn-desktop {
  @apply p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20;
  @apply transition-all duration-200 transform hover:scale-110;
  @apply focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50;
}

/* Mobile Navigation Fallback */
.mobile-nav-item {
  @apply w-full text-left block px-4 py-3 rounded-md font-medium text-gray-800;
  @apply hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200;
  @apply flex items-center relative text-sm;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50;
}

.mobile-nav-item > .fa-solid {
  @apply mr-3;
}

.mobile-nav-item.active {
  @apply bg-blue-50 text-blue-800;
}

.mobile-nav-item-expandable {
  @apply w-full text-left px-4 py-3 font-medium text-gray-800;
  @apply bg-gray-50 hover:bg-gray-100 transition-colors duration-200 text-sm;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50;
}

.mobile-nav-item-expandable > div > div > .fa-solid {
  @apply mr-3;
}

.mobile-submenu-item {
  @apply w-full text-left block px-6 py-3 rounded-md font-medium text-gray-600;
  @apply hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200;
  @apply flex items-center text-sm;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50;
}

.mobile-submenu-item > .fa-solid {
  @apply mr-6 w-4 flex-shrink-0;
}

.nav-counter-mobile {
  @apply absolute top-1 right-1 min-w-[16px] h-4 px-1 text-xs font-bold;
  @apply bg-red-500 text-white rounded-full;
  @apply flex items-center justify-center;
}

/* Legacy Counter Styles (for backward compatibility) */
.nav-counter {
  @apply absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 text-xs font-bold;
  @apply bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full;
  @apply flex items-center justify-center shadow-lg animate-pulse;
}

.nav-counter:hover {
  @apply text-white;
}

/* Animation Classes */
.rotate-180 {
  transform: rotate(180deg);
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .mobile-menu-enhanced {
    @apply w-full max-w-none;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .mobile-menu-enhanced {
    @apply bg-gray-900 border-gray-700;
  }
  
  .submenu-desktop-enhanced,
  .user-menu-enhanced,
  .language-dropdown-enhanced {
    @apply bg-gray-800 border-gray-700;
  }
  
  .submenu-desktop-item,
  .user-menu-item,
  .language-dropdown-item {
    @apply text-gray-300 hover:text-white border-gray-700;
    @apply hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600;
  }

  .submenu-desktop-item:first-child,
  .user-menu-item:first-child,
  .language-dropdown-item:first-child {
    @apply rounded-t-xl;
  }

  .submenu-desktop-item:last-child,
  .user-menu-item:last-child,
  .language-dropdown-item:last-child {
    @apply rounded-b-xl;
  }

  .submenu-desktop-item.active,
  .user-menu-item.active,
  .language-dropdown-item.active {
    @apply bg-gradient-to-r from-gray-700 to-gray-600 text-white;
  }

  .submenu-desktop-item.active:first-child,
  .user-menu-item.active:first-child,
  .language-dropdown-item.active:first-child {
    @apply rounded-t-xl;
  }

  .submenu-desktop-item.active:last-child,
  .user-menu-item.active:last-child,
  .language-dropdown-item.active:last-child {
    @apply rounded-b-xl;
  }
}

/* Smooth Scrolling */
.menu-content-enhanced {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.menu-content-enhanced::-webkit-scrollbar {
  width: 4px;
}

.menu-content-enhanced::-webkit-scrollbar-track {
  background: transparent;
}

.menu-content-enhanced::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.menu-content-enhanced::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}
</style>
