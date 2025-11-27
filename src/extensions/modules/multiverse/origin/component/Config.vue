<script>
import feather from 'feather-icons';
import Subhead from '@/interface/template/outline/Subhead.vue';
import RouteCard from './RouteCard.vue';
import UserRolePermissionManagement from './UserRolePermissionManagement.vue';
import { createRouterHelper } from '@/plugins/router-helper';
import pluginRoutes from '@/extensions/loader';
import requestClient from '@/plugins/requestClient';

export default {
    name: 'Blank',
  
  components: {
    Subhead,
    RouteCard,
    UserRolePermissionManagement
  },
  
    data() {
    return {
      // Router Data
      availableRoutes: pluginRoutes,
      routerHelper: null,
      searchRouterTerm: '',
      selectedModuleFilter: 'all',
      
      // Expansion States
      expandedModules: {},
      expandedRoutes: {}, // สำหรับขยาย/ย่อการตั้งค่าของแต่ละ route
      expandedChildRoutes: {}, // สำหรับขยาย/ย่อการตั้งค่าของ child routes
      
      // Router Configuration
      routerConfig: {},
      
      // Router Permission Management
      originalRouterConfig: {}, // เก็บ config เดิมจาก router
      routerPermissionOverrides: {}, // เก็บการเปลี่ยนแปลงที่แตกต่างจาก default
      hasLoadedRouterPermissions: false, // flag สำหรับตรวจสอบว่าเคยโหลดข้อมูลจาก API แล้วหรือไม่
      isLoadingPermissions: false,
      isSavingPermissions: false,
      isPermissionDataReady: false, // flag สำหรับตรวจสอบว่าข้อมูล permission พร้อมแล้วหรือไม่
      
      // Language System
      configs:  this.$Key,
      Request: new requestClient(false),
      languages: [],
      currentLanguage: 'th',
      translations: {},
      isLoadingTranslations: false,
      
      // Master Role Configuration
      masterRoles: [
        {
          id: 'root',
          name: 'Root',
          description: 'ผู้ดูแลระบบสูงสุด มีสิทธิ์เต็มทุกอย่าง',
          level: 1,
          color: 'red',
          icon: 'crown',
          permissions: ['*'], // สิทธิ์ทั้งหมด
          isSystem: true, // ไม่สามารถแก้ไขหรือลบได้
          isActive: true
        },
        {
          id: 'superadmin',
          name: 'Super Admin',
          description: 'ผู้ดูแลระบบระดับสูง มีสิทธิ์จัดการเกือบทุกอย่าง',
          level: 2,
          color: 'purple',
          icon: 'user-shield',
          permissions: ['admin.*', 'manage.*', 'config.*'],
          isSystem: true,
          isActive: true
        },
        {
          id: 'admin',
          name: 'Admin',
          description: 'ผู้ดูแลระบบ มีสิทธิ์จัดการข้อมูลและผู้ใช้',
          level: 3,
          color: 'blue',
          icon: 'user-tie',
          permissions: ['manage.*', 'read.*', 'write.*'],
          isSystem: true,
          isActive: true
        },
        {
          id: 'manager',
          name: 'Manager',
          description: 'ผู้จัดการ มีสิทธิ์จัดการในขอบเขตที่กำหนด',
          level: 4,
          color: 'green',
          icon: 'user-cog',
          permissions: ['read.*', 'write.*', 'manage.own'],
          isSystem: true,
          isActive: true
        },
        {
          id: 'member',
          name: 'Member',
          description: 'สมาชิก มีสิทธิ์ใช้งานพื้นฐาน',
          level: 5,
          color: 'yellow',
          icon: 'user',
          permissions: ['read.own', 'write.own'],
          isSystem: true,
          isActive: true
        },
        {
          id: 'guest',
          name: 'Guest',
          description: 'ผู้เยี่ยมชม มีสิทธิ์จำกัด',
          level: 6,
          color: 'gray',
          icon: 'user-circle',
          permissions: ['read.public'],
          isSystem: true,
          isActive: true
        },
        {
          id: 'public',
          name: 'Public',
          description: 'สาธารณะ เข้าถึงได้โดยไม่ต้องล็อกอิน',
          level: 7,
          color: 'green',
          icon: 'globe',
          permissions: ['read.public'],
          isSystem: true,
          isActive: true
        }
      ],
      
      // Custom Roles (จะโหลดจาก API)
      customRoles: [],
      customRolesData: null, // เก็บข้อมูลทั้งหมดรวม _id สำหรับ PUT method
      hasLoadedCustomRoles: false, // flag สำหรับตรวจสอบว่าเคยโหลดข้อมูลจาก API แล้วหรือไม่
      
      // Role Management State
      isLoadingRoles: false,
      isSavingRoles: false,
      showRoleModal: false,
      editingRole: null,
      roleForm: {
        id: '',
        name: '',
        description: '',
        color: 'blue',
        icon: 'user',
        permissions: [],
        isActive: true
      },
      roleFormErrors: {},
      
      // Available permissions for custom roles
      availablePermissions: [
        { id: 'read.own', name: 'อ่านข้อมูลของตนเอง', category: 'read' },
        { id: 'read.public', name: 'อ่านข้อมูลสาธารณะ', category: 'read' },
        { id: 'read.*', name: 'อ่านข้อมูลทั้งหมด', category: 'read' },
        { id: 'write.own', name: 'เขียนข้อมูลของตนเอง', category: 'write' },
        { id: 'write.*', name: 'เขียนข้อมูลทั้งหมด', category: 'write' },
        { id: 'manage.own', name: 'จัดการข้อมูลของตนเอง', category: 'manage' },
        { id: 'manage.*', name: 'จัดการข้อมูลทั้งหมด', category: 'manage' },
        { id: 'admin.*', name: 'สิทธิ์ผู้ดูแลระบบ', category: 'admin' },
        { id: 'config.*', name: 'ตั้งค่าระบบ', category: 'config' }
      ],
      
      // Available colors and icons for custom roles
      availableColors: [
        { id: 'red', name: 'แดง', class: 'bg-red-100 text-red-800' },
        { id: 'yellow', name: 'เหลือง', class: 'bg-yellow-100 text-yellow-800' },
        { id: 'green', name: 'เขียว', class: 'bg-green-100 text-green-800' },
        { id: 'blue', name: 'น้ำเงิน', class: 'bg-blue-100 text-blue-800' },
        { id: 'indigo', name: 'คราม', class: 'bg-indigo-100 text-indigo-800' },
        { id: 'purple', name: 'ม่วง', class: 'bg-purple-100 text-purple-800' },
        { id: 'pink', name: 'ชมพู', class: 'bg-pink-100 text-pink-800' },
        { id: 'gray', name: 'เทา', class: 'bg-gray-100 text-gray-800' }
      ],
      
      availableIcons: [
        'user', 'user-tie', 'user-cog', 'user-shield', 'user-circle',
        'users', 'crown', 'star', 'badge', 'certificate',
        'key', 'lock', 'unlock', 'shield', 'eye'
      ]
    };
  },
  methods: {
    // ==========================================
    // Search & Filter Methods
    // ==========================================
    clearSearch() {
      this.searchRouterTerm = '';
      this.selectedModuleFilter = 'all';
    },

    // ==========================================
    // Route Display & Helper Methods
    // ==========================================
    getRouteDetailBadge(route) {
      if (!this.routerHelper) return [];
      const badges = this.routerHelper.getRouteDetailBadges(route);
      
      // เพิ่ม badge สำหรับ virtual parent
      if (this.isVirtualParent(route)) {
        badges.unshift(this.getVirtualParentBadge());
      }
      
      return badges;
    },
    getIndentationClass(level) {
      const indents = {
        0: 'ml-0',
        1: 'ml-4',
        2: 'ml-8',
        3: 'ml-12',
        4: 'ml-16'
      };
      return indents[level] || 'ml-20';
    },
    getRouteIcon(route) {
      if (route.isParent) return ['fas', 'folder'];
      if (route.redirect) return ['fas', 'arrow-right'];
      if (route.meta?.virtual) return ['fas', 'folder-plus'];
      return ['fas', 'file'];
    },
    isVirtualParent(route) {
      return route.meta?.virtual === true;
    },
    getVirtualParentBadge() {
      return { text: 'Virtual Parent', color: 'bg-indigo-100 text-indigo-800' };
    },
    getTotalChildrenCount(route) {
      if (!route.children) return 0;
      
      let count = 0;
      route.children.forEach(child => {
        count++; // นับ child level 2
        if (child.children && child.children.length > 0) {
          count += child.children.length; // นับ child level 3 (grand children)
        }
      });
      
      return count;
    },
    isVirtualSubParent(child) {
      return child.meta?.virtual === true && child.meta?.parent;
    },

    // ==========================================
    // Expansion/Collapse Methods
    // ==========================================
    toggleModule(module) {
      // ถ้ายังไม่เคยกำหนดค่าให้กำหนดเป็น false ก่อน แล้วค่อย toggle
      if (this.expandedModules[module] === undefined) {
        this.expandedModules[module] = false;
      }
      this.expandedModules[module] = !this.expandedModules[module];
    },
    isModuleExpanded(module) {
      // default เป็น false ถ้ายังไม่เคยกำหนดค่า (ย่อทั้งหมด)
      return this.expandedModules[module] === true;
    },
    toggleRouteConfig(routeKey) {
      // Toggle การแสดงการตั้งค่าของ route
      if (this.expandedRoutes[routeKey] === undefined) {
        this.expandedRoutes[routeKey] = false;
      }
      this.expandedRoutes[routeKey] = !this.expandedRoutes[routeKey];
    },
    isRouteConfigExpanded(routeKey) {
      // default เป็น false (ย่อทั้งหมด)
      return this.expandedRoutes[routeKey] === true;
    },
    toggleChildRouteConfig(childRouteKey) {
      // Toggle การแสดงการตั้งค่าของ child route
      if (this.expandedChildRoutes[childRouteKey] === undefined) {
        this.expandedChildRoutes[childRouteKey] = false;
      }
      this.expandedChildRoutes[childRouteKey] = !this.expandedChildRoutes[childRouteKey];
    },
    isChildRouteConfigExpanded(childRouteKey) {
      // default เป็น false (ย่อทั้งหมด)
      return this.expandedChildRoutes[childRouteKey] === true;
    },
    toggleGrandChildRouteConfig(grandChildRouteKey) {
      // Toggle การแสดงการตั้งค่าของ grand child route
      if (this.expandedChildRoutes[grandChildRouteKey] === undefined) {
        this.expandedChildRoutes[grandChildRouteKey] = false;
      }
      this.expandedChildRoutes[grandChildRouteKey] = !this.expandedChildRoutes[grandChildRouteKey];
    },
    isGrandChildRouteConfigExpanded(grandChildRouteKey) {
      // default เป็น false (ย่อทั้งหมด)
      return this.expandedChildRoutes[grandChildRouteKey] === true;
    },
    toggleSubRoutesList(subRoutesListKey) {
      // Toggle การแสดงรายการ sub routes
      if (this.expandedChildRoutes[subRoutesListKey] === undefined) {
        this.expandedChildRoutes[subRoutesListKey] = false;
      }
      this.expandedChildRoutes[subRoutesListKey] = !this.expandedChildRoutes[subRoutesListKey];
    },
    isSubRoutesListExpanded(subRoutesListKey) {
      // default เป็น false (ย่อทั้งหมด)
      return this.expandedChildRoutes[subRoutesListKey] === true;
    },
    toggleSubRouteConfig(subRouteKey) {
      // Toggle การแสดงการตั้งค่าของ sub route
      if (this.expandedChildRoutes[subRouteKey] === undefined) {
        this.expandedChildRoutes[subRouteKey] = false;
      }
      this.expandedChildRoutes[subRouteKey] = !this.expandedChildRoutes[subRouteKey];
    },
    isSubRouteConfigExpanded(subRouteKey) {
      // default เป็น false (ย่อทั้งหมด)
      return this.expandedChildRoutes[subRouteKey] === true;
    },
    getRouteKey(group, subModule, routePath) {
      // สร้าง unique key สำหรับ route
      return `${group}-${subModule}-${routePath}`;
    },
    getChildRouteKey(group, subModule, parentPath, childPath) {
      // สร้าง unique key สำหรับ child route
      return `${group}-${subModule}-${parentPath}-${childPath}`;
    },
    getGrandChildRouteKey(group, subModule, parentPath, childPath, grandChildPath) {
      // สร้าง unique key สำหรับ grand child route
      return `${group}-${subModule}-${parentPath}-${childPath}-${grandChildPath}`;
    },
    getSubRouteKey(group, subModule, parentPath, childPath, subChildPath) {
      // สร้าง unique key สำหรับ sub child route
      return `${group}-${subModule}-${parentPath}-${childPath}-${subChildPath}`;
    },

    // ==========================================
    // Bulk Operations Methods
    // ==========================================
    expandAllRoutes() {
      // ขยายการตั้งค่าของ route ทั้งหมด
      Object.keys(this.routesByModule).forEach(group => {
        Object.keys(this.routesByModule[group]).forEach(subModule => {
          this.routesByModule[group][subModule].forEach(route => {
            const routeKey = this.getRouteKey(group, subModule, route.path);
            this.expandedRoutes[routeKey] = true;
            
            // ขยาย child routes ด้วย
            if (route.children && route.children.length > 0) {
              this.expandedChildRoutes[routeKey + '-children'] = true;
              route.children.forEach(child => {
                const childKey = this.getChildRouteKey(group, subModule, route.path, child.path);
                this.expandedChildRoutes[childKey] = true;
                
                // ขยาย sub routes ด้วย
                if (child.children && child.children.length > 0) {
                  this.expandedChildRoutes[childKey + '-subroutes'] = true;
                  child.children.forEach(subChild => {
                    const subChildKey = this.getSubRouteKey(group, subModule, route.path, child.path, subChild.path);
                    this.expandedChildRoutes[subChildKey] = true;
                  });
                }
              });
            }
          });
        });
      });
      
      console.log('Expanded all route configurations');
    },
    collapseAllRoutes() {
      // ย่อการตั้งค่าของ route ทั้งหมด
      this.expandedRoutes = {};
      this.expandedChildRoutes = {};
      
      console.log('Collapsed all route configurations');
    },
    exportRouterData() {
      if (!this.routerHelper) return;
      
      const data = this.routerHelper.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `router-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    // เพิ่ม method สำหรับจัดการ virtual parent routes
    updateVirtualParentMeta(group, subModule, routePath, property, value) {
      // สำหรับ virtual parent ให้อัปเดต children แทน
      const routes = this.routesByModule[group]?.[subModule];
      if (!routes) return;
      
      const route = routes.find(r => r.path === routePath);
      if (!route || !route.meta?.virtual) return;
      
      // อัปเดตทุก child routes
      if (route.children && route.children.length > 0) {
        route.children.forEach(child => {
          if (!child.meta) child.meta = {};
          child.meta[property] = value;
        });
      }
      
      console.log(`Updated virtual parent ${routePath} children meta.${property} to:`, value);
    },
    updateVirtualParentProperty(group, subModule, routePath, property, value) {
      // สำหรับ virtual parent ให้อัปเดต children แทน
      const routes = this.routesByModule[group]?.[subModule];
      if (!routes) return;
      
      const route = routes.find(r => r.path === routePath);
      if (!route || !route.meta?.virtual) return;
      
      // อัปเดตทุก child routes
      if (route.children && route.children.length > 0) {
        route.children.forEach(child => {
          child[property] = value;
        });
      }
      
      console.log(`Updated virtual parent ${routePath} children ${property} to:`, value);
    },
    // Router Configuration Methods
    updateRouterConfig(group, property, value) {
      if (!this.routerConfig[group]) {
        this.routerConfig[group] = {};
      }
      this.routerConfig[group][property] = value;
      console.log(`Updated ${group}.${property} to:`, value);
    },
    updateSubModuleConfig(group, subModule, property, value) {
      if (!this.routerConfig[group]) {
        this.routerConfig[group] = {};
      }
      if (!this.routerConfig[group].subModules) {
        this.routerConfig[group].subModules = {};
      }
      if (!this.routerConfig[group].subModules[subModule]) {
        this.routerConfig[group].subModules[subModule] = {};
      }
      this.routerConfig[group].subModules[subModule][property] = value;
      console.log(`Updated ${group}.${subModule}.${property} to:`, value);
    },
    updateRouteRole(group, subModule, routePath, role, checked) {
      // ค้นหา route ที่ต้องการอัปเดต
      const routes = this.routesByModule[group]?.[subModule];
      if (!routes) return;
      
      const route = routes.find(r => r.path === routePath);
      if (!route) return;
      
      if (!route.meta) route.meta = {};
      if (!route.meta.role) route.meta.role = [];
      
      if (checked) {
        if (!route.meta.role.includes(role)) {
          route.meta.role.push(role);
        }
      } else {
        const index = route.meta.role.indexOf(role);
        if (index > -1) {
          route.meta.role.splice(index, 1);
        }
      }
      
      console.log(`Updated role ${role} for route ${routePath}:`, checked);
    },
    saveRouterConfiguration() {
      // บันทึกการตั้งค่า router configuration
      const configData = {
        routerConfig: this.routerConfig,
        routesByModule: this.routesByModule,
        timestamp: new Date().toISOString()
      };
      
      // ส่งข้อมูลไปยัง API หรือ localStorage
      localStorage.setItem('router-configuration', JSON.stringify(configData));
      
      console.log('Router configuration saved:', configData);
      
      // แสดงข้อความสำเร็จ
      alert('บันทึกการตั้งค่า Router เรียบร้อยแล้ว');
    },
    resetRouterConfiguration() {
      // รีเซ็ตการตั้งค่า
      this.routerConfig = {};
      this.activeConfigTab = 'router';
      
      // ลบข้อมูลจาก localStorage
      localStorage.removeItem('router-configuration');
      
      console.log('Router configuration reset');
      
      // แสดงข้อความยืนยัน
      alert('รีเซ็ตการตั้งค่า Router เรียบร้อยแล้ว');
    },
    loadRouterConfiguration() {
      // โหลดการตั้งค่าจาก localStorage
      const savedConfig = localStorage.getItem('router-configuration');
      if (savedConfig) {
        try {
          const configData = JSON.parse(savedConfig);
          this.routerConfig = configData.routerConfig || {};
          console.log('Router configuration loaded:', configData);
        } catch (error) {
          console.error('Error loading router configuration:', error);
        }
      }
    },
    // Permission Management Methods
    isGroupRoleEnabled(group, role) {
      // ตรวจสอบว่า role นี้เปิดใช้งานในกลุ่มนี้หรือไม่
      const subModules = this.routesByModule[group];
      if (!subModules) return false;
      
      let hasRole = false;
      Object.keys(subModules).forEach(subModule => {
        subModules[subModule].forEach(route => {
          if (route.meta?.role?.includes(role)) {
            hasRole = true;
          }
        });
      });
      return hasRole;
    },
    toggleGroupRole(group, role, enabled) {
      // เปิด/ปิด role สำหรับทั้งกลุ่ม
      const subModules = this.routesByModule[group];
      if (!subModules) return;
      
      Object.keys(subModules).forEach(subModule => {
        subModules[subModule].forEach(route => {
          this.updateRouteRole(group, subModule, route.path, role, enabled);
          
          // อัปเดต child routes ด้วย
          if (route.children && route.children.length > 0) {
            route.children.forEach(child => {
              this.updateChildRouteRole(group, subModule, route.path, child.path, role, enabled);
            });
          }
        });
      });
      
      console.log(`Toggled ${role} for group ${group}:`, enabled);
    },
    updateChildRouteRole(group, subModule, parentPath, childPath, role, checked) {
      // อัปเดต role สำหรับ child route
      const routes = this.routesByModule[group]?.[subModule];
      if (!routes) return;
      
      const parentRoute = routes.find(r => r.path === parentPath);
      if (!parentRoute || !parentRoute.children) return;
      
      const childRoute = parentRoute.children.find(c => c.path === childPath);
      if (!childRoute) return;
      
      if (!childRoute.meta) childRoute.meta = {};
      if (!childRoute.meta.role) childRoute.meta.role = [];
      
      if (checked) {
        if (!childRoute.meta.role.includes(role)) {
          childRoute.meta.role.push(role);
        }
      } else {
        const index = childRoute.meta.role.indexOf(role);
        if (index > -1) {
          childRoute.meta.role.splice(index, 1);
        }
      }
      
      console.log(`Updated child route ${childPath} role ${role}:`, checked);
    },
    updateGrandChildRouteRole(group, subModule, parentPath, childPath, grandChildPath, role, checked) {
      // อัปเดต role สำหรับ grand child route (level 3)
      const routes = this.routesByModule[group]?.[subModule];
      if (!routes) return;
      
      const parentRoute = routes.find(r => r.path === parentPath);
      if (!parentRoute || !parentRoute.children) return;
      
      const childRoute = parentRoute.children.find(c => c.path === childPath);
      if (!childRoute || !childRoute.children) return;
      
      const grandChildRoute = childRoute.children.find(gc => gc.path === grandChildPath);
      if (!grandChildRoute) return;
      
      if (!grandChildRoute.meta) grandChildRoute.meta = {};
      if (!grandChildRoute.meta.role) grandChildRoute.meta.role = [];
      
      if (checked) {
        if (!grandChildRoute.meta.role.includes(role)) {
          grandChildRoute.meta.role.push(role);
        }
      } else {
        const index = grandChildRoute.meta.role.indexOf(role);
        if (index > -1) {
          grandChildRoute.meta.role.splice(index, 1);
        }
      }
      
      console.log(`Updated grand child route ${grandChildPath} role ${role}:`, checked);
    },
    updateGrandChildRouteMeta(group, subModule, parentPath, childPath, grandChildPath, property, value) {
      // อัปเดต meta property ของ grand child route
      const routes = this.routesByModule[group]?.[subModule];
      if (!routes) return;
      
      const parentRoute = routes.find(r => r.path === parentPath);
      if (!parentRoute || !parentRoute.children) return;
      
      const childRoute = parentRoute.children.find(c => c.path === childPath);
      if (!childRoute || !childRoute.children) return;
      
      const grandChildRoute = childRoute.children.find(gc => gc.path === grandChildPath);
      if (!grandChildRoute) return;
      
      if (!grandChildRoute.meta) grandChildRoute.meta = {};
      grandChildRoute.meta[property] = value;
      
      console.log(`Updated grand child route ${grandChildPath} meta.${property} to:`, value);
    },
    updateGrandChildRouteProperty(group, subModule, parentPath, childPath, grandChildPath, property, value) {
      // อัปเดต property ของ grand child route (ไม่ใช่ meta)
      const routes = this.routesByModule[group]?.[subModule];
      if (!routes) return;
      
      const parentRoute = routes.find(r => r.path === parentPath);
      if (!parentRoute || !parentRoute.children) return;
      
      const childRoute = parentRoute.children.find(c => c.path === childPath);
      if (!childRoute || !childRoute.children) return;
      
      const grandChildRoute = childRoute.children.find(gc => gc.path === grandChildPath);
      if (!grandChildRoute) return;
      
      grandChildRoute[property] = value;
      
      console.log(`Updated grand child route ${grandChildPath} ${property} to:`, value);
    },
    updateSubChildRouteMeta(group, subModule, parentPath, childPath, subChildPath, property, value) {
      // อัปเดต meta property ของ sub child route (ใน inline config)
      const routes = this.routesByModule[group]?.[subModule];
      if (!routes) return;
      
      const parentRoute = routes.find(r => r.path === parentPath);
      if (!parentRoute || !parentRoute.children) return;
      
      const childRoute = parentRoute.children.find(c => c.path === childPath);
      if (!childRoute || !childRoute.children) return;
      
      const subChildRoute = childRoute.children.find(sc => sc.path === subChildPath);
      if (!subChildRoute) return;
      
      if (!subChildRoute.meta) subChildRoute.meta = {};
      subChildRoute.meta[property] = value;
      
      console.log(`Updated sub child route ${subChildPath} meta.${property} to:`, value);
    },
    updateSubChildRouteRole(group, subModule, parentPath, childPath, subChildPath, role, checked) {
      // อัปเดต role สำหรับ sub child route (ใน inline config)
      const routes = this.routesByModule[group]?.[subModule];
      if (!routes) return;
      
      const parentRoute = routes.find(r => r.path === parentPath);
      if (!parentRoute || !parentRoute.children) return;
      
      const childRoute = parentRoute.children.find(c => c.path === childPath);
      if (!childRoute || !childRoute.children) return;
      
      const subChildRoute = childRoute.children.find(sc => sc.path === subChildPath);
      if (!subChildRoute) return;
      
      if (!subChildRoute.meta) subChildRoute.meta = {};
      if (!subChildRoute.meta.role) subChildRoute.meta.role = [];
      
      if (checked) {
        if (!subChildRoute.meta.role.includes(role)) {
          subChildRoute.meta.role.push(role);
        }
      } else {
        const index = subChildRoute.meta.role.indexOf(role);
        if (index > -1) {
          subChildRoute.meta.role.splice(index, 1);
        }
      }
      
      console.log(`Updated sub child route ${subChildPath} role ${role}:`, checked);
    },
    getPermissionCount(role) {
      // นับจำนวน routes ที่มี role นี้ (รวม grand child routes)
      let count = 0;
      Object.keys(this.routesByModule).forEach(group => {
        Object.keys(this.routesByModule[group]).forEach(subModule => {
          this.routesByModule[group][subModule].forEach(route => {
            if (route.meta?.role?.includes(role)) {
              count++;
            }
            // นับ child routes ด้วย
            if (route.children && route.children.length > 0) {
              route.children.forEach(child => {
                if (child.meta?.role?.includes(role)) {
                  count++;
                }
                // นับ grand child routes ด้วย
                if (child.children && child.children.length > 0) {
                  child.children.forEach(grandChild => {
                    if (grandChild.meta?.role?.includes(role)) {
                      count++;
                    }
                    // นับ sub child routes ด้วย (level 4)
                    if (grandChild.children && grandChild.children.length > 0) {
                      grandChild.children.forEach(subChild => {
                        if (subChild.meta?.role?.includes(role)) {
                          count++;
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        });
      });
      return count;
    },
    applyBulkPermissions(target, enabled) {
      // ใช้สิทธิ์แบบ bulk
      const roles = ['root', 'superadmin', 'admin', 'manager', 'public'];
      
      if (target === 'all') {
        // ใช้กับทุกกลุ่ม
        Object.keys(this.routesByModule).forEach(group => {
          roles.forEach(role => {
            this.toggleGroupRole(group, role, enabled);
          });
        });
      }
      
      console.log(`Applied bulk permissions (${enabled ? 'enabled' : 'disabled'}) to ${target}`);
      
      // แสดงข้อความยืนยัน
      const action = enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน';
      alert(`${action}สิทธิ์ทั้งหมดเรียบร้อยแล้ว`);
    },
    exportPermissionMatrix() {
      // Export permission matrix เป็น JSON
      const permissionMatrix = {};
      
      Object.keys(this.routesByModule).forEach(group => {
        permissionMatrix[group] = {};
        Object.keys(this.routesByModule[group]).forEach(subModule => {
          permissionMatrix[group][subModule] = [];
          this.routesByModule[group][subModule].forEach(route => {
            const routePermission = {
              name: route.name,
              path: route.path,
              roles: route.meta?.role || [],
              children: []
            };
            
            if (route.children && route.children.length > 0) {
              route.children.forEach(child => {
                routePermission.children.push({
                  name: child.name,
                  path: child.path,
                  roles: child.meta?.role || []
                });
              });
            }
            
            permissionMatrix[group][subModule].push(routePermission);
          });
        });
      });
      
      const exportData = {
        permissionMatrix: permissionMatrix,
                  summary: {
            root: this.getPermissionCount('root'),
            superadmin: this.getPermissionCount('superadmin'),
            admin: this.getPermissionCount('admin'),
            manager: this.getPermissionCount('manager'),
            public: this.getPermissionCount('public')
          },
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `permission-matrix-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Permission matrix exported:', exportData);
    },
    // Inline Configuration Methods
    updateRouteMeta(group, subModule, routePath, property, value) {
      // อัปเดต meta property ของ route
      const routes = this.routesByModule[group]?.[subModule];
      if (!routes) return;
      
      const route = routes.find(r => r.path === routePath);
      if (!route) return;
      
      // ถ้าเป็น virtual parent ให้อัปเดต children แทน
      if (route.meta?.virtual) {
        this.updateVirtualParentMeta(group, subModule, routePath, property, value);
        return;
      }
      
      if (!route.meta) route.meta = {};
      route.meta[property] = value;
      
      console.log(`Updated route ${routePath} meta.${property} to:`, value);
    },
    updateRouteProperty(group, subModule, routePath, property, value) {
      // อัปเดต property ของ route (ไม่ใช่ meta)
      const routes = this.routesByModule[group]?.[subModule];
      if (!routes) return;
      
      const route = routes.find(r => r.path === routePath);
      if (!route) return;
      
      // ถ้าเป็น virtual parent ให้อัปเดต children แทน
      if (route.meta?.virtual) {
        this.updateVirtualParentProperty(group, subModule, routePath, property, value);
        return;
      }
      
      route[property] = value;
      
      console.log(`Updated route ${routePath} ${property} to:`, value);
    },
    updateChildRouteMeta(group, subModule, parentPath, childPath, property, value) {
      // อัปเดต meta property ของ child route
      const routes = this.routesByModule[group]?.[subModule];
      if (!routes) return;
      
      const parentRoute = routes.find(r => r.path === parentPath);
      if (!parentRoute || !parentRoute.children) return;
      
      const childRoute = parentRoute.children.find(c => c.path === childPath);
      if (!childRoute) return;
      
      if (!childRoute.meta) childRoute.meta = {};
      childRoute.meta[property] = value;
      
      console.log(`Updated child route ${childPath} meta.${property} to:`, value);
    },
    updateChildRouteProperty(group, subModule, parentPath, childPath, property, value) {
      // อัปเดต property ของ child route (ไม่ใช่ meta)
      const routes = this.routesByModule[group]?.[subModule];
      if (!routes) return;
      
      const parentRoute = routes.find(r => r.path === parentPath);
      if (!parentRoute || !parentRoute.children) return;
      
      const childRoute = parentRoute.children.find(c => c.path === childPath);
      if (!childRoute) return;
      
      childRoute[property] = value;
      
      console.log(`Updated child route ${childPath} ${property} to:`, value);
    },
    bulkUpdateRoutes(group, property, value) {
      // อัปเดต property ทุก routes ในกลุ่ม
      const subModules = this.routesByModule[group];
      if (!subModules) return;
      
      Object.keys(subModules).forEach(subModule => {
        subModules[subModule].forEach(route => {
          if (property.startsWith('meta.')) {
            const metaProperty = property.replace('meta.', '');
            this.updateRouteMeta(group, subModule, route.path, metaProperty, value);
          } else {
            this.updateRouteProperty(group, subModule, route.path, property, value);
          }
          
          // อัปเดต child routes ด้วย
          if (route.children && route.children.length > 0) {
            route.children.forEach(child => {
              if (property.startsWith('meta.')) {
                const metaProperty = property.replace('meta.', '');
                this.updateChildRouteMeta(group, subModule, route.path, child.path, metaProperty, value);
              } else {
                this.updateChildRouteProperty(group, subModule, route.path, child.path, property, value);
              }
            });
          }
        });
      });
      
      console.log(`Bulk updated ${property} to ${value} for group ${group}`);
    },
    validateRouteConfiguration() {
      // ตรวจสอบความถูกต้องของการตั้งค่า
      const errors = [];
      
      Object.keys(this.routesByModule).forEach(group => {
        Object.keys(this.routesByModule[group]).forEach(subModule => {
          this.routesByModule[group][subModule].forEach(route => {
            // ตรวจสอบ required fields
            if (!route.name) {
              errors.push(`Route ${route.path} in ${group}/${subModule} missing name`);
            }
            
            // ตรวจสอบ roles
            if (route.meta?.role && !Array.isArray(route.meta.role)) {
              errors.push(`Route ${route.path} roles should be array`);
            }
            
            // ตรวจสอบ child routes
            if (route.children && route.children.length > 0) {
              route.children.forEach(child => {
                if (!child.name) {
                  errors.push(`Child route ${child.path} missing name`);
                }
              });
            }
          });
        });
      });
      
      if (errors.length > 0) {
        console.warn('Route configuration errors:', errors);
        alert(`พบข้อผิดพลาด ${errors.length} รายการ:\n${errors.slice(0, 5).join('\n')}`);
      } else {
        console.log('Route configuration is valid');
        alert('การตั้งค่า Router ถูกต้องทั้งหมด');
      }
      
      return errors.length === 0;
    },
    // Language System Methods
    async loadLanguages() {
      try {
        this.isLoadingTranslations = true;
        const { data } = await this.Request.GET('translate', this.configs);
        
        this.languages = data.map(translationData => {
          if (!translationData.translations || Object.keys(translationData.translations).length === 0) {
            translationData.translations = {};
          }
          return translationData;
        });
        
        // ตรวจสอบว่าภาษาที่เลือกมีอยู่จริงหรือไม่
        if (this.languages.length > 0) {
          const currentLangExists = this.languages.some(lang => lang.code === this.currentLanguage);
          if (!currentLangExists) {
            // ถ้าภาษาที่เลือกไม่มี ให้เลือกภาษาแรกที่มี
            this.currentLanguage = this.languages[0].code;
          }
        }
        
        // Load translations for current language
        await this.loadTranslations();
        
      } catch (error) {
        console.error('Error loading languages from API:', error);
        // ถ้าไม่สามารถโหลดได้ ให้ใช้ภาษาเริ่มต้น
        this.languages = [];
        this.translations = {};
      } finally {
        this.isLoadingTranslations = false;
      }
    },
    async loadTranslations() {
      const currentLang = this.languages.find(lang => lang.code === this.currentLanguage);
      if (currentLang && currentLang.translations) {
        this.translations = currentLang.translations;
      } else {
        this.translations = {};
      }
    },
    async changeLanguage(langCode) {
      this.currentLanguage = langCode;
      await this.loadTranslations();
      
      // บันทึกภาษาที่เลือกไว้ใน localStorage
      localStorage.setItem('router-config-language', langCode);
    },
    loadSavedLanguage() {
      // โหลดภาษาที่บันทึกไว้จาก localStorage
      const savedLanguage = localStorage.getItem('router-config-language');
      if (savedLanguage) {
        this.currentLanguage = savedLanguage;
      }
    },
    translate(key, fallback = null) {
      if (!key) return fallback || key;
      
      // ถ้าไม่มีข้อมูลการแปล ให้ใช้ fallback
      if (!this.translations || Object.keys(this.translations).length === 0) {
        return fallback || key;
      }
      
      // Split key into group and actual key (e.g., 'config-router-title' -> group: 'config', key: 'router-title')
      const parts = key.split('-');
      if (parts.length < 2) return fallback || key;
      
      const group = parts[0];
      const translationKey = parts.slice(1).join('-');
      
      // ตรวจสอบว่ามีการแปลในกลุ่มนั้นหรือไม่
      if (this.translations[group] && this.translations[group][translationKey]) {
        return this.translations[group][translationKey];
      }
      
      // ถ้าไม่พบการแปล ให้ใช้ fallback หรือ key เดิม
      return fallback || key;
    },
    getRouteDisplayName(route) {
      if (!route || !route.name) return 'Unknown Route';
      
      // ลองหาการแปลจาก meta.title ก่อน
      if (route.meta && route.meta.title) {
        const translatedTitle = this.translate(`router-${route.name}`, route.meta.title);
        if (translatedTitle && translatedTitle !== `router-${route.name}`) {
          return translatedTitle;
        }
        return route.meta.title;
      }
      
      // ลองหาการแปลจากชื่อ route
      const translatedName = this.translate(`router-${route.name}`, null);
      if (translatedName && translatedName !== `router-${route.name}`) {
        return translatedName;
      }
      
      // ถ้าไม่มีการแปล ให้แสดงชื่อ route เดิม แต่ปรับให้อ่านง่ายขึ้น
      return this.formatRouteName(route.name);
    },
    getGroupDisplayName(groupName) {
      if (!groupName) return 'Unknown Group';
      
      const translatedGroup = this.translate(`group-${groupName}`, null);
      if (translatedGroup && translatedGroup !== `group-${groupName}`) {
        return translatedGroup;
      }
      
      // ถ้าไม่มีการแปล ให้ปรับชื่อให้อ่านง่ายขึ้น
      return this.formatRouteName(groupName);
    },
    formatRouteName(name) {
      if (!name) return '';
      
      // แปลง camelCase หรือ kebab-case เป็นชื่อที่อ่านง่าย
      return name
        .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase -> camel Case
        .replace(/[-_]/g, ' ') // kebab-case หรือ snake_case -> space
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },
    getAvailableLanguages() {
      return this.languages.filter(lang => lang.code && lang.name);
    },
    getCurrentLanguageFlag() {
      const currentLang = this.languages.find(lang => lang.code === this.currentLanguage);
      return currentLang ? currentLang.flag : '🌐';
    },
    isValidEmoji(text) {
      if (!text) return false;
      const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u;
             return emojiRegex.test(text.trim()) && !text.includes('http') && !text.includes('www') && text.length <= 10;
     },
    
    // Handler methods for RouteCard component events
    handleChildUpdateMeta(event) {
      this.updateChildRouteMeta(event.group, event.subModule, event.parentPath, event.routePath, event.property, event.value);
    },
    handleChildUpdateProperty(event) {
      this.updateChildRouteProperty(event.group, event.subModule, event.parentPath, event.routePath, event.property, event.value);
    },
    handleChildUpdateRole(event) {
      this.updateChildRouteRole(event.group, event.subModule, event.parentPath, event.routePath, event.role, event.checked);
    },

    // ==========================================
    // Permission Management Methods
    // ==========================================
    
    // สร้าง master configuration จาก router เดิม
    createMasterRouterConfig() {
      const masterConfig = {};
      
      Object.keys(this.routesByModule).forEach(group => {
        masterConfig[group] = {};
        Object.keys(this.routesByModule[group]).forEach(subModule => {
          masterConfig[group][subModule] = [];
          this.routesByModule[group][subModule].forEach(route => {
            const routeConfig = {
              path: route.path,
              name: route.name,
              originalRoles: route.meta?.role ? [...route.meta.role] : [],
              originalAuth: route.meta?.auth || false,
              originalInMenu: route.meta?.inMenu || false,
              originalIcon: route.meta?.icon || '',
              originalOrder: route.meta?.order || 0,
              originalType: route.meta?.type || 'page',
              originalCollection: route.meta?.collection || '',
              originalKey: route.meta?.key || '',
              originalInApp: route.inApp || '',
              originalInTop: route.inTop || '',
              originalHasSubmenu: route.hasSubmenu || false,
              originalHasDashboard: route.hasDashboard || false,
              originalFullscreen: route.meta?.fullscreen || false,
              children: []
            };
            
            // จัดการ child routes
            if (route.children && route.children.length > 0) {
              route.children.forEach(child => {
                routeConfig.children.push({
                  path: child.path,
                  name: child.name,
                  originalRoles: child.meta?.role ? [...child.meta.role] : [],
                  originalAuth: child.meta?.auth || false,
                  originalInMenu: child.meta?.inMenu || false,
                  originalIcon: child.meta?.icon || '',
                  originalOrder: child.meta?.order || 0,
                  originalType: child.meta?.type || 'page',
                  originalCollection: child.meta?.collection || '',
                  originalKey: child.meta?.key || '',
                  originalInApp: child.inApp || '',
                  originalInTop: child.inTop || '',
                  originalHasSubmenu: child.hasSubmenu || false,
                  originalHasDashboard: child.hasDashboard || false,
                  originalFullscreen: child.meta?.fullscreen || false
                });
              });
            }
            
            masterConfig[group][subModule].push(routeConfig);
          });
        });
      });
      
      this.originalRouterConfig = masterConfig;
      console.log('Master router configuration created:', masterConfig);
    },
    
    // ตรวจสอบว่า route มีการเปลี่ยนแปลงจาก default หรือไม่
    hasRouteChanged(group, subModule, routePath, property, currentValue) {
      const masterRoute = this.findMasterRoute(group, subModule, routePath);
      if (!masterRoute) return false;
      
      const originalProperty = `original${property.charAt(0).toUpperCase() + property.slice(1)}`;
      const originalValue = masterRoute[originalProperty];
      
      // เปรียบเทียบค่า
      if (Array.isArray(originalValue) && Array.isArray(currentValue)) {
        return JSON.stringify(originalValue.sort()) !== JSON.stringify(currentValue.sort());
      }
      
      return originalValue !== currentValue;
    },
    
    // หา master route configuration
    findMasterRoute(group, subModule, routePath, childPath = null) {
      const groupConfig = this.originalRouterConfig[group];
      if (!groupConfig) return null;
      
      const subModuleConfig = groupConfig[subModule];
      if (!subModuleConfig) return null;
      
      const route = subModuleConfig.find(r => r.path === routePath);
      if (!route) return null;
      
      if (childPath) {
        return route.children.find(c => c.path === childPath);
      }
      
      return route;
    },
    
    // สร้าง override object สำหรับ route ที่เปลี่ยนแปลง (เก็บไว้สำหรับ backward compatibility)
    createRouteOverride(group, subModule, routePath, childPath = null) {
      const routes = this.routesByModule[group]?.[subModule];
      if (!routes) return null;
      
      const route = routes.find(r => r.path === routePath);
      if (!route) return null;
      
      let targetRoute = route;
      if (childPath && route.children) {
        targetRoute = route.children.find(c => c.path === childPath);
        if (!targetRoute) return null;
      }
      
      const masterRoute = this.findMasterRoute(group, subModule, routePath, childPath);
      if (!masterRoute) return null;
      
      const override = {
        group: group,
        subModule: subModule,
        routePath: routePath,
        childPath: childPath,
        overrides: {}
      };
      
      // ตรวจสอบการเปลี่ยนแปลงแต่ละ property
      const properties = [
        'roles', 'auth', 'inMenu', 'icon', 'order', 'type', 
        'collection', 'key', 'inApp', 'inTop', 'hasSubmenu', 
        'hasDashboard', 'fullscreen'
      ];
      
      properties.forEach(property => {
        let currentValue;
        let originalProperty = `original${property.charAt(0).toUpperCase() + property.slice(1)}`;
        
        // ดึงค่าปัจจุบัน
        if (property === 'roles') {
          currentValue = targetRoute.meta?.role || [];
          originalProperty = 'originalRoles';
        } else if (['auth', 'inMenu', 'icon', 'order', 'type', 'collection', 'key', 'fullscreen'].includes(property)) {
          currentValue = targetRoute.meta?.[property];
          if (currentValue === undefined) {
            currentValue = property === 'type' ? 'page' : (property === 'order' ? 0 : (typeof masterRoute[originalProperty] === 'boolean' ? false : ''));
          }
        } else {
          currentValue = targetRoute[property];
          if (currentValue === undefined) {
            currentValue = typeof masterRoute[originalProperty] === 'boolean' ? false : '';
          }
        }
        
        // เปรียบเทียบกับค่าเดิม
        const originalValue = masterRoute[originalProperty];
        let hasChanged = false;
        
        if (Array.isArray(originalValue) && Array.isArray(currentValue)) {
          hasChanged = JSON.stringify(originalValue.sort()) !== JSON.stringify(currentValue.sort());
        } else {
          hasChanged = originalValue !== currentValue;
        }
        
        if (hasChanged) {
          override.overrides[property] = currentValue;
        }
      });
      
      return Object.keys(override.overrides).length > 0 ? override : null;
    },

    // สร้าง override object ที่บันทึกทุกอย่างที่มีการตั้งค่า (ไม่ใช่แค่การเปลี่ยนแปลง)
    createCompleteRouteOverride(group, subModule, routePath, childPath = null) {
      const routes = this.routesByModule[group]?.[subModule];
      if (!routes) return null;
      
      const route = routes.find(r => r.path === routePath);
      if (!route) return null;
      
      let targetRoute = route;
      if (childPath && route.children) {
        targetRoute = route.children.find(c => c.path === childPath);
        if (!targetRoute) return null;
      }
      
      const override = {
        group: group,
        subModule: subModule,
        routePath: routePath,
        childPath: childPath,
        overrides: {}
      };
      
      // บันทึกทุก property ที่มีการตั้งค่า
      const properties = [
        'roles', 'auth', 'inMenu', 'icon', 'order', 'type', 
        'collection', 'key', 'inApp', 'inTop', 'hasSubmenu', 
        'hasDashboard', 'fullscreen'
      ];
      
      properties.forEach(property => {
        let currentValue;
        let hasValue = false;
        
        // ดึงค่าปัจจุบัน
        if (property === 'roles') {
          currentValue = targetRoute.meta?.role || [];
          hasValue = currentValue.length > 0; // มี roles ที่ตั้งค่าไว้
        } else if (['auth', 'inMenu', 'icon', 'order', 'type', 'collection', 'key', 'fullscreen'].includes(property)) {
          currentValue = targetRoute.meta?.[property];
          
          // ตรวจสอบว่ามีการตั้งค่าหรือไม่
          if (property === 'auth' || property === 'inMenu' || property === 'fullscreen') {
            hasValue = currentValue === true; // บันทึกเฉพาะเมื่อเป็น true
          } else if (property === 'order') {
            hasValue = currentValue !== undefined && currentValue !== 0; // บันทึกเฉพาะเมื่อไม่ใช่ 0
          } else if (property === 'type') {
            hasValue = currentValue !== undefined && currentValue !== 'page'; // บันทึกเฉพาะเมื่อไม่ใช่ 'page'
          } else {
            hasValue = currentValue !== undefined && currentValue !== ''; // บันทึกเฉพาะเมื่อมีค่า
          }
        } else {
          currentValue = targetRoute[property];
          
          // ตรวจสอบว่ามีการตั้งค่าหรือไม่
          if (property === 'hasSubmenu' || property === 'hasDashboard') {
            hasValue = currentValue === true; // บันทึกเฉพาะเมื่อเป็น true
          } else if (property === 'inApp' || property === 'inTop') {
            hasValue = currentValue === 'yes'; // บันทึกเฉพาะเมื่อเป็น 'yes'
          } else {
            hasValue = currentValue !== undefined && currentValue !== ''; // บันทึกเฉพาะเมื่อมีค่า
          }
        }
        
        // บันทึกค่าที่มีการตั้งค่า
        if (hasValue) {
          override.overrides[property] = currentValue;
        }
      });
      
      return Object.keys(override.overrides).length > 0 ? override : null;
    },
    
    // รวบรวม overrides ทั้งหมด (บันทึกทุกอย่างที่มีการตั้งค่า ไม่ใช่แค่การเปลี่ยนแปลง)
    collectAllOverrides() {
      const allOverrides = [];
      
      Object.keys(this.routesByModule).forEach(group => {
        Object.keys(this.routesByModule[group]).forEach(subModule => {
          this.routesByModule[group][subModule].forEach(route => {
            // ตรวจสอบ parent route - บันทึกทุกอย่างที่มีการตั้งค่า
            const parentOverride = this.createCompleteRouteOverride(group, subModule, route.path);
            if (parentOverride) {
              allOverrides.push(parentOverride);
            }
            
            // ตรวจสอบ child routes - บันทึกทุกอย่างที่มีการตั้งค่า
            if (route.children && route.children.length > 0) {
              route.children.forEach(child => {
                const childOverride = this.createCompleteRouteOverride(group, subModule, route.path, child.path);
                if (childOverride) {
                  allOverrides.push(childOverride);
                }
              });
            }
          });
        });
      });
      
      return allOverrides;
    },
    
    // บันทึก router permissions ไปยัง API (ใช้ PUT ถ้ามีข้อมูล, POST ถ้าไม่มี)
    async saveRouterPermissions() {
      try {
        this.isSavingPermissions = true;
        
        // รวบรวม overrides ทั้งหมด
        const overrides = this.collectAllOverrides();
        
        if (overrides.length === 0) {
          this.$swal({
            icon: 'info',
            title: 'ไม่มีการตั้งค่า',
            text: 'ไม่พบการตั้งค่าสิทธิ์ที่ต้องบันทึก',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          return;
        }
        
        // เตรียมข้อมูลสำหรับบันทึก (Global Configuration)
        const permissionData = {
          overrides: overrides,
          masterConfigChecksum: this.generateConfigChecksum(),
          updatedAt: new Date().toISOString(),
          updatedBy: 'system' // หรือ user ID
        };
        
        // ตรวจสอบว่ามีข้อมูล router permissions ที่บันทึกไว้ใน API อยู่แล้วหรือไม่
        // โดยดูจากการที่เคยโหลดข้อมูลมาจาก API แล้ว
        const hasExistingData = this.hasLoadedRouterPermissions;
        
        const method = hasExistingData ? 'PUT' : 'POST';
        const actionText = hasExistingData ? 'อัปเดต' : 'สร้าง';
        
        // เก็บ _id ไว้สำหรับใช้ใน URL (ถ้าเป็น PUT)
        let recordId = null;
        if (hasExistingData && this.routerPermissionOverrides._id) {
          recordId = this.routerPermissionOverrides._id;
        }
        
        console.log('hasExistingData', hasExistingData);
        console.log('recordId', recordId);
        console.log(`Using ${method} method for ${actionText} router permissions`);
        
        // สร้าง URL สำหรับ API
        let apiUrl = "https://gateway.cloudrestfulapi.com/api/router_permission";
        if (method === 'PUT' && recordId) {
          // เติม ID ไปหลัง URL สำหรับ PUT method
          apiUrl += "/" + recordId;
        }
        
        // ส่งข้อมูลไปยัง API
        const response = await fetch(apiUrl, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'client-token-key': this.configs
          },
          body: JSON.stringify({
            data: permissionData
          })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          this.$swal({
            icon: 'success',
            title: `${actionText}สำเร็จ`,
            text: `${actionText}การตั้งค่าสิทธิ์ส่วนกลาง ${overrides.length} รายการเรียบร้อยแล้ว`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          
          // อัปเดต local state และเก็บ _id จาก response (สำหรับ POST ครั้งแรก)
          if (result && result._id) {
            // เก็บ _id ไว้ใน local state แต่ไม่ส่งไปใน API body
            this.routerPermissionOverrides = { ...permissionData, _id: result._id };
          } else {
            this.routerPermissionOverrides = permissionData;
          }
          this.hasLoadedRouterPermissions = true; // ตั้ง flag ว่ามีข้อมูลแล้ว
          
          console.log(`Global router permissions ${actionText.toLowerCase()}d successfully:`, result);
        } else {
          throw new Error(result.message || `Failed to ${actionText.toLowerCase()} router permissions`);
        }
        
      } catch (error) {
        console.error('Error saving router permissions:', error);
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถบันทึกการตั้งค่าสิทธิ์ได้: ' + error.message,
          confirmButtonText: 'ตกลง'
        });
      } finally {
        this.isSavingPermissions = false;
      }
    },
    
    // โหลด router permissions จาก API และ verify สิทธิ์
    async loadRouterPermissions() {
      try {
        this.isLoadingPermissions = true;
        
        const response = await fetch("https://gateway.cloudrestfulapi.com/api/router_permission", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'client-token-key': this.configs
          }
        });
        
        const result = await response.json();
        
        // ตรวจสอบว่าข้อมูลเป็น array หรือ object
        let permissionData = null;
        if (Array.isArray(result) && result.length > 0) {
          // ถ้าเป็น array ให้เอาตัวแรก
          permissionData = result[0];
        } else if (result && typeof result === 'object' && !Array.isArray(result)) {
          // ถ้าเป็น object ให้ใช้โดยตรง
          permissionData = result;
        }
        
        if (response.ok && permissionData && permissionData.overrides && permissionData.overrides.length > 0) {
          this.routerPermissionOverrides = permissionData;
          this.hasLoadedRouterPermissions = true; // ตั้ง flag ว่ามีข้อมูลจริงๆ
          this.applyOverridesToRoutes();
          
          // Verify และ apply สิทธิ์ที่บันทึกไว้
          this.verifyAndApplyStoredPermissions(permissionData);
          
          console.log('Global router permissions loaded and verified:', permissionData);
          
          this.$swal({
            icon: 'success',
            title: 'โหลดการตั้งค่าสำเร็จ',
            text: `พบการตั้งค่าสิทธิ์ที่บันทึกไว้ ${permissionData.overrides.length} รายการ`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
        } else {
          console.log('No existing global router permissions found, using defaults');
          this.routerPermissionOverrides = {};
          this.hasLoadedRouterPermissions = false; // ไม่มีข้อมูล ให้ใช้ POST ตอนบันทึก
          
          this.$swal({
            icon: 'info',
            title: 'ไม่พบการตั้งค่า',
            text: 'ไม่พบการตั้งค่าสิทธิ์ที่บันทึกไว้ จะใช้ค่าเริ่มต้นจากระบบ',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
        }
        
        // ตั้ง flag ว่าข้อมูล permission พร้อมแล้ว (ไม่ว่าจะมีข้อมูลหรือไม่)
        this.isPermissionDataReady = true;
        
      } catch (error) {
        console.error('Error loading global router permissions:', error);
        this.routerPermissionOverrides = {};
        
        // แม้เกิดข้อผิดพลาดก็ตั้ง flag ว่าพร้อมแล้ว เพื่อให้ component แสดงผล
        this.isPermissionDataReady = true;
        
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดการตั้งค่าสิทธิ์ได้: ' + error.message,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 5000
        });
      } finally {
        this.isLoadingPermissions = false;
      }
    },
    
    // นำ overrides มาใช้กับ routes
    applyOverridesToRoutes() {
      if (!this.routerPermissionOverrides.overrides) return;
      
      this.routerPermissionOverrides.overrides.forEach(override => {
        const routes = this.routesByModule[override.group]?.[override.subModule];
        if (!routes) return;
        
        const route = routes.find(r => r.path === override.routePath);
        if (!route) return;
        
        let targetRoute = route;
        if (override.childPath && route.children) {
          targetRoute = route.children.find(c => c.path === override.childPath);
          if (!targetRoute) return;
        }
        
        // นำ overrides มาใช้
        Object.keys(override.overrides).forEach(property => {
          const value = override.overrides[property];
          
          if (property === 'roles') {
            if (!targetRoute.meta) targetRoute.meta = {};
            targetRoute.meta.role = value;
          } else if (['auth', 'inMenu', 'icon', 'order', 'type', 'collection', 'key', 'fullscreen'].includes(property)) {
            if (!targetRoute.meta) targetRoute.meta = {};
            targetRoute.meta[property] = value;
          } else {
            targetRoute[property] = value;
          }
        });
      });
    },
    
    // สร้าง checksum สำหรับ master config
    generateConfigChecksum() {
      const configString = JSON.stringify(this.originalRouterConfig);
      let hash = 0;
      for (let i = 0; i < configString.length; i++) {
        const char = configString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash.toString();
    },
    
    // รีเซ็ต permissions กลับเป็น default
    async resetToDefaultPermissions() {
      try {
        const result = await this.$swal({
          icon: 'warning',
          title: 'ยืนยันการรีเซ็ต',
          text: 'คุณต้องการรีเซ็ตสิทธิ์ทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?',
          showCancelButton: true,
          confirmButtonText: 'รีเซ็ต',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#d33'
        });
        
        if (result.isConfirmed) {
          // ลบ overrides จาก API โดยใช้ DELETE โดยตรง (Global)
          await fetch("https://gateway.cloudrestfulapi.com/api/router_permission", {
            method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
              'client-token-key': this.configs
            }
          });
          
          // รีเซ็ต local state
          this.routerPermissionOverrides = {};
          
          // โหลด routes ใหม่จาก original config
          this.routerHelper = createRouterHelper(this.availableRoutes);
          
          this.$swal({
            icon: 'success',
            title: 'รีเซ็ตสำเร็จ',
            text: 'รีเซ็ตสิทธิ์กลับเป็นค่าเริ่มต้นเรียบร้อยแล้ว',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
        }
        
      } catch (error) {
        console.error('Error resetting permissions:', error);
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถรีเซ็ตสิทธิ์ได้: ' + error.message,
          confirmButtonText: 'ตกลง'
        });
      }
    },
    
    // ดูการตั้งค่าทั้งหมด
    previewChanges() {
      const overrides = this.collectAllOverrides();
      
      if (overrides.length === 0) {
        this.$swal({
          icon: 'info',
          title: 'ไม่มีการตั้งค่า',
          text: 'ไม่พบการตั้งค่าสิทธิ์ที่ต้องบันทึก',
          confirmButtonText: 'ตกลง'
        });
        return;
      }
      
      let changesList = '<div class="text-left"><h4 class="font-bold mb-2">การตั้งค่าที่จะบันทึก:</h4><ul class="list-disc pl-5 space-y-1">';
      
      overrides.forEach(override => {
        const routeName = override.childPath ? 
          `${override.routePath} → ${override.childPath}` : 
          override.routePath;
        changesList += `<li><strong>${override.group}/${override.subModule}</strong>: ${routeName}`;
        changesList += `<ul class="list-disc pl-5 mt-1">`;
        Object.keys(override.overrides).forEach(property => {
          const value = override.overrides[property];
          const displayValue = Array.isArray(value) ? value.join(', ') : value.toString();
          changesList += `<li class="text-sm">${property}: ${displayValue}</li>`;
        });
        changesList += `</ul></li>`;
      });
      
      changesList += '</ul></div>';
      
      this.$swal({
        icon: 'info',
        title: `พบการตั้งค่า ${overrides.length} รายการ`,
        html: changesList,
        confirmButtonText: 'ตกลง',
        width: '600px'
      });
    },
    
    // ==================== Role Management Methods ====================
    
    // โหลด custom roles จาก API
    async loadCustomRoles() {
      try {
        this.isLoadingRoles = true;
        
        const response = await fetch("https://gateway.cloudrestfulapi.com/api/custom_roles", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'client-token-key': this.configs
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          
          // ตรวจสอบว่าข้อมูลเป็น array หรือ object
          let rolesData = null;
          if (Array.isArray(result) && result.length > 0) {
            // ถ้าเป็น array ให้เอาตัวแรก
            rolesData = result[0];
          } else if (result && typeof result === 'object' && !Array.isArray(result)) {
            // ถ้าเป็น object ให้ใช้โดยตรง
            rolesData = result;
          }
          
          if (rolesData && rolesData.roles) {
            this.customRoles = rolesData.roles;
            this.customRolesData = rolesData; // เก็บข้อมูลทั้งหมดรวม _id
            this.hasLoadedCustomRoles = true; // มีข้อมูลจริงๆ
            console.log('Custom roles loaded:', this.customRoles);
          } else {
            this.customRoles = [];
            this.customRolesData = null;
            this.hasLoadedCustomRoles = false; // ไม่มีข้อมูล ให้ใช้ POST
            console.log('No custom roles found, using empty array');
          }
        } else {
          console.log('No custom roles found, using empty array');
          this.customRoles = [];
          this.customRolesData = null;
          this.hasLoadedCustomRoles = false; // ไม่มีข้อมูล ให้ใช้ POST
        }
        
      } catch (error) {
        console.error('Error loading custom roles:', error);
        this.customRoles = [];
      } finally {
        this.isLoadingRoles = false;
      }
    },
    
    // บันทึก custom roles ไปยัง API (ใช้ PUT ถ้ามีข้อมูล, POST ถ้าไม่มี)
    async saveCustomRoles() {
      try {
        this.isSavingRoles = true;
        
        const rolesData = {
          roles: this.customRoles,
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        };
        
        // ตรวจสอบว่ามีข้อมูล custom roles ที่บันทึกไว้ใน API อยู่แล้วหรือไม่
        // โดยดูจากการที่เคยโหลดข้อมูลมาจาก API แล้ว
        const hasExistingRoles = this.hasLoadedCustomRoles;
        
        const method = hasExistingRoles ? 'PUT' : 'POST';
        const actionText = hasExistingRoles ? 'อัปเดต' : 'สร้าง';
        
        // เก็บ _id ไว้สำหรับใช้ใน URL (ถ้าเป็น PUT)
        let recordId = null;
        if (hasExistingRoles && this.customRolesData && this.customRolesData._id) {
          recordId = this.customRolesData._id;
        }
        
        console.log('hasExistingRoles', hasExistingRoles);
        console.log('recordId', recordId);
        console.log(`Using ${method} method for ${actionText} custom roles`);
        
        // สร้าง URL สำหรับ API
        let apiUrl = "https://gateway.cloudrestfulapi.com/api/custom_roles";
        if (method === 'PUT' && recordId) {
          // เติม ID ไปหลัง URL สำหรับ PUT method
          apiUrl += "/" + recordId;
        }
        
        // ส่งข้อมูลไปยัง API
        const response = await fetch(apiUrl, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'client-token-key': this.configs
          },
          body: JSON.stringify({
            data: rolesData
          })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          // อัปเดต local state และเก็บ _id จาก response (สำหรับ POST ครั้งแรก)
          if (result && result._id) {
            // เก็บ _id ไว้ใน local state แต่ไม่ส่งไปใน API body
            this.customRolesData = { ...rolesData, _id: result._id };
          } else {
            this.customRolesData = rolesData;
          }
          this.hasLoadedCustomRoles = true; // ตั้ง flag ว่ามีข้อมูลแล้ว
          
          this.$swal({
            icon: 'success',
            title: `${actionText}สำเร็จ`,
            text: `${actionText} Custom Roles ${this.customRoles.length} รายการเรียบร้อยแล้ว`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          
          console.log(`Custom roles ${actionText.toLowerCase()}d successfully:`, result);
        } else {
          throw new Error(result.message || `Failed to ${actionText.toLowerCase()} custom roles`);
        }
        
      } catch (error) {
        console.error('Error saving custom roles:', error);
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถบันทึก Custom Roles ได้: ' + error.message,
          confirmButtonText: 'ตกลง'
        });
      } finally {
        this.isSavingRoles = false;
      }
    },
    
    // เปิด modal สำหรับสร้าง role ใหม่
    openCreateRoleModal() {
      this.editingRole = null;
      this.roleForm = {
        id: '',
        name: '',
        description: '',
        color: 'blue',
        icon: 'user',
        permissions: [],
        isActive: true
      };
      this.roleFormErrors = {};
      this.showRoleModal = true;
    },
    
    // เปิด modal สำหรับแก้ไข role
    openEditRoleModal(role) {
      this.editingRole = role;
      this.roleForm = {
        id: role.id,
        name: role.name,
        description: role.description,
        color: role.color,
        icon: role.icon,
        permissions: [...role.permissions],
        isActive: role.isActive
      };
      this.roleFormErrors = {};
      this.showRoleModal = true;
    },
    
    // ปิด modal
    closeRoleModal() {
      this.showRoleModal = false;
      this.editingRole = null;
      this.roleForm = {
        id: '',
        name: '',
        description: '',
        color: 'blue',
        icon: 'user',
        permissions: [],
        isActive: true
      };
      this.roleFormErrors = {};
    },
    
    // ตรวจสอบความถูกต้องของฟอร์ม role
    validateRoleForm() {
      this.roleFormErrors = {};
      
      if (!this.roleForm.name.trim()) {
        this.roleFormErrors.name = 'กรุณากรอกชื่อ Role';
      }
      
      if (!this.roleForm.id.trim()) {
        this.roleFormErrors.id = 'กรุณากรอก Role ID';
      } else if (!/^[a-z0-9_]+$/.test(this.roleForm.id)) {
        this.roleFormErrors.id = 'Role ID ต้องเป็นตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และ _ เท่านั้น';
      } else {
        // ตรวจสอบว่า ID ซ้ำกับ master roles หรือไม่
        const existingMasterRole = this.masterRoles.find(r => r.id === this.roleForm.id);
        if (existingMasterRole) {
          this.roleFormErrors.id = 'Role ID นี้ถูกใช้โดย Master Role แล้ว';
        }
        
        // ตรวจสอบว่า ID ซ้ำกับ custom roles อื่นหรือไม่ (ยกเว้นตัวที่กำลังแก้ไข)
        const existingCustomRole = this.customRoles.find(r => 
          r.id === this.roleForm.id && (!this.editingRole || r.id !== this.editingRole.id)
        );
        if (existingCustomRole) {
          this.roleFormErrors.id = 'Role ID นี้ถูกใช้แล้ว';
        }
      }
      
      if (!this.roleForm.description.trim()) {
        this.roleFormErrors.description = 'กรุณากรอกคำอธิบาย';
      }
      
      if (this.roleForm.permissions.length === 0) {
        this.roleFormErrors.permissions = 'กรุณาเลือกสิทธิ์อย่างน้อย 1 รายการ';
      }
      
      return Object.keys(this.roleFormErrors).length === 0;
    },
    
    // บันทึก role (สร้างใหม่หรือแก้ไข)
    async saveRole() {
      if (!this.validateRoleForm()) {
        return;
      }
      
      try {
        const roleData = {
          id: this.roleForm.id,
          name: this.roleForm.name,
          description: this.roleForm.description,
          color: this.roleForm.color,
          icon: this.roleForm.icon,
          permissions: [...this.roleForm.permissions],
          isActive: this.roleForm.isActive,
          isSystem: false,
          level: 100 + this.customRoles.length, // กำหนด level สำหรับ custom roles
          createdAt: this.editingRole ? this.editingRole.createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        if (this.editingRole) {
          // แก้ไข role ที่มีอยู่
          const index = this.customRoles.findIndex(r => r.id === this.editingRole.id);
          if (index !== -1) {
            this.customRoles.splice(index, 1, roleData);
          }
        } else {
          // เพิ่ม role ใหม่
          this.customRoles.push(roleData);
        }
        
        // บันทึกไปยัง API
        await this.saveCustomRoles();
        
        this.closeRoleModal();
        
        } catch (error) {
        console.error('Error saving role:', error);
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถบันทึก Role ได้: ' + error.message,
          confirmButtonText: 'ตกลง'
        });
      }
    },
    
    // ลบ custom role
    async deleteCustomRole(role) {
      try {
        const result = await this.$swal({
          icon: 'warning',
          title: 'ยืนยันการลบ',
          text: `คุณต้องการลบ Role "${role.name}" หรือไม่?`,
          showCancelButton: true,
          confirmButtonText: 'ลบ',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#d33'
        });
        
        if (result.isConfirmed) {
          // ลบจาก array
          const index = this.customRoles.findIndex(r => r.id === role.id);
          if (index !== -1) {
            this.customRoles.splice(index, 1);
          }
          
          // บันทึกไปยัง API
          await this.saveCustomRoles();
          
          this.$swal({
            icon: 'success',
            title: 'ลบสำเร็จ',
            text: `ลบ Role "${role.name}" เรียบร้อยแล้ว`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
        }
        
      } catch (error) {
        console.error('Error deleting role:', error);
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบ Role ได้: ' + error.message,
          confirmButtonText: 'ตกลง'
        });
      }
    },
    
    // สลับสถานะ active/inactive ของ custom role
    async toggleRoleStatus(role) {
      try {
        role.isActive = !role.isActive;
        role.updatedAt = new Date().toISOString();
        
        await this.saveCustomRoles();
        
        this.$swal({
          icon: 'success',
          title: role.isActive ? 'เปิดใช้งานแล้ว' : 'ปิดใช้งานแล้ว',
          text: `Role "${role.name}" ${role.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}เรียบร้อยแล้ว`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        
      } catch (error) {
        console.error('Error toggling role status:', error);
        // Revert the change
        role.isActive = !role.isActive;
        
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถเปลี่ยนสถานะ Role ได้: ' + error.message,
          confirmButtonText: 'ตกลง'
        });
      }
    },
    
    // ดึงรายการ roles ทั้งหมด (master + custom)
    getAllRoles() {
      const activeCustomRoles = this.customRoles.filter(role => role.isActive);
      return [...this.masterRoles, ...activeCustomRoles].sort((a, b) => a.level - b.level);
    },
    
    // ดึงข้อมูล role ตาม ID
    getRoleById(roleId) {
      const allRoles = this.getAllRoles();
      return allRoles.find(role => role.id === roleId);
    },
    
    // ดึงสีของ role
    getRoleColorClass(role) {
      const colorConfig = this.availableColors.find(c => c.id === role.color);
      return colorConfig ? colorConfig.class : 'bg-gray-100 text-gray-800';
    },
    
    // ตรวจสอบว่า permission ถูกเลือกหรือไม่
    isPermissionSelected(permissionId) {
      return this.roleForm.permissions.includes(permissionId);
    },
    
    // สลับการเลือก permission
    togglePermission(permissionId) {
      const index = this.roleForm.permissions.indexOf(permissionId);
      if (index === -1) {
        this.roleForm.permissions.push(permissionId);
      } else {
        this.roleForm.permissions.splice(index, 1);
      }
    },
    
    // จัดกลุ่ม permissions ตาม category
    getPermissionsByCategory() {
      const categories = {};
      this.availablePermissions.forEach(permission => {
        if (!categories[permission.category]) {
          categories[permission.category] = [];
        }
        categories[permission.category].push(permission);
      });
      return categories;
    },
    
    // Verify และ apply สิทธิ์ที่บันทึกไว้
    verifyAndApplyStoredPermissions(storedPermissions) {
      if (!storedPermissions || !storedPermissions.overrides) {
        console.log('No stored permissions to verify');
        return;
      }
      
      let appliedCount = 0;
      let skippedCount = 0;
      const verificationLog = [];
      
      storedPermissions.overrides.forEach(override => {
        const routes = this.routesByModule[override.group]?.[override.subModule];
        if (!routes) {
          skippedCount++;
          verificationLog.push({
            type: 'skip',
            reason: 'Module not found',
            override: override
          });
          return;
        }
        
        const route = routes.find(r => r.path === override.routePath);
        if (!route) {
          skippedCount++;
          verificationLog.push({
            type: 'skip',
            reason: 'Route not found',
            override: override
          });
          return;
        }
        
        let targetRoute = route;
        if (override.childPath && route.children) {
          targetRoute = route.children.find(c => c.path === override.childPath);
          if (!targetRoute) {
            skippedCount++;
            verificationLog.push({
              type: 'skip',
              reason: 'Child route not found',
              override: override
            });
            return;
          }
        }
        
        // Apply stored permissions
        let hasChanges = false;
        Object.keys(override.overrides).forEach(property => {
          const value = override.overrides[property];
          
          if (property === 'roles') {
            if (!targetRoute.meta) targetRoute.meta = {};
            
            // Verify ว่า roles ที่บันทึกไว้ยังมีอยู่ในระบบหรือไม่
            const validRoles = value.filter(roleId => {
              const role = this.getRoleById(roleId);
              return role !== undefined;
            });
            
            if (validRoles.length !== value.length) {
              verificationLog.push({
                type: 'warning',
                reason: 'Some roles no longer exist',
                override: override,
                invalidRoles: value.filter(roleId => !this.getRoleById(roleId))
              });
            }
            
            targetRoute.meta.role = validRoles;
            hasChanges = true;
          } else if (['auth', 'inMenu', 'icon', 'order', 'type', 'collection', 'key', 'fullscreen'].includes(property)) {
            if (!targetRoute.meta) targetRoute.meta = {};
            targetRoute.meta[property] = value;
            hasChanges = true;
      } else {
            targetRoute[property] = value;
            hasChanges = true;
          }
        });
        
        if (hasChanges) {
          appliedCount++;
          verificationLog.push({
            type: 'applied',
            override: override
          });
        }
      });
      
      // แสดงผลการ verify
      console.log('Permission verification completed:', {
        total: storedPermissions.overrides.length,
        applied: appliedCount,
        skipped: skippedCount,
        log: verificationLog
      });
      
      // แสดง notification ถ้ามีปัญหา
      if (skippedCount > 0) {
        const warnings = verificationLog.filter(log => log.type === 'warning');
        if (warnings.length > 0) {
          this.$swal({
            icon: 'warning',
            title: 'พบปัญหาในการ Verify สิทธิ์',
            html: `
              <div class="text-left">
                <p class="mb-2">ใช้งานได้: ${appliedCount} รายการ</p>
                <p class="mb-2">ข้ามไป: ${skippedCount} รายการ</p>
                <p class="text-sm text-gray-600">กรุณาตรวจสอบการตั้งค่าสิทธิ์ในหน้า Permission Management</p>
              </div>
            `,
            confirmButtonText: 'ตกลง'
          });
        }
      }
    },
    
    // แสดงสถานะการ verification ของสิทธิ์
    showPermissionVerificationStatus() {
      if (!this.routerPermissionOverrides || !this.routerPermissionOverrides.overrides) {
        this.$swal({
          icon: 'info',
          title: 'ไม่มีการตั้งค่าสิทธิ์',
          text: 'ยังไม่มีการตั้งค่าสิทธิ์ที่บันทึกไว้ในระบบ',
          confirmButtonText: 'ตกลง'
        });
        return;
      }
      
      const overrides = this.routerPermissionOverrides.overrides;
      let validCount = 0;
      let invalidCount = 0;
      const statusDetails = [];
      
      overrides.forEach(override => {
        const routes = this.routesByModule[override.group]?.[override.subModule];
        if (!routes) {
          invalidCount++;
          statusDetails.push({
            status: 'invalid',
            reason: 'Module not found',
            path: `${override.group}/${override.subModule}`,
            route: override.routePath
          });
          return;
        }
        
        const route = routes.find(r => r.path === override.routePath);
        if (!route) {
          invalidCount++;
          statusDetails.push({
            status: 'invalid',
            reason: 'Route not found',
            path: `${override.group}/${override.subModule}`,
            route: override.routePath
          });
          return;
        }
        
        // ตรวจสอบ roles ที่ไม่ถูกต้อง
        if (override.overrides.roles) {
          const invalidRoles = override.overrides.roles.filter(roleId => !this.getRoleById(roleId));
          if (invalidRoles.length > 0) {
            invalidCount++;
            statusDetails.push({
              status: 'warning',
              reason: 'Invalid roles found',
              path: `${override.group}/${override.subModule}`,
              route: override.routePath,
              invalidRoles: invalidRoles
            });
            return;
          }
        }
        
        validCount++;
        statusDetails.push({
          status: 'valid',
          path: `${override.group}/${override.subModule}`,
          route: override.routePath
        });
      });
      
      // สร้าง HTML สำหรับแสดงผล
      let statusHtml = `
        <div class="text-left">
          <div class="mb-4">
            <h4 class="font-bold mb-2">สถานะการ Verification</h4>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="bg-green-100 p-3 rounded">
                <div class="text-green-800 font-medium">ใช้งานได้</div>
                <div class="text-2xl font-bold text-green-600">${validCount}</div>
              </div>
              <div class="bg-red-100 p-3 rounded">
                <div class="text-red-800 font-medium">มีปัญหา</div>
                <div class="text-2xl font-bold text-red-600">${invalidCount}</div>
              </div>
            </div>
          </div>
      `;
      
      if (invalidCount > 0) {
        statusHtml += `
          <div class="mb-4">
            <h5 class="font-medium mb-2 text-red-800">รายการที่มีปัญหา:</h5>
            <div class="max-h-40 overflow-y-auto">
        `;
        
        statusDetails.filter(item => item.status !== 'valid').forEach(item => {
          statusHtml += `
            <div class="mb-2 p-2 bg-red-50 rounded text-sm">
              <div class="font-medium">${item.path} → ${item.route}</div>
              <div class="text-red-600">${item.reason}</div>
              ${item.invalidRoles ? `<div class="text-xs text-gray-600">Invalid roles: ${item.invalidRoles.join(', ')}</div>` : ''}
            </div>
          `;
        });
        
        statusHtml += `
            </div>
          </div>
        `;
      }
      
      statusHtml += `
          <div class="text-sm text-gray-600">
            <p>อัปเดตล่าสุด: ${new Date(this.routerPermissionOverrides.updatedAt).toLocaleString('th-TH')}</p>
          </div>
        </div>
      `;
      
      this.$swal({
        icon: invalidCount > 0 ? 'warning' : 'success',
        title: 'สถานะการ Verification สิทธิ์',
        html: statusHtml,
        confirmButtonText: 'ตกลง',
        width: '600px'
      });
    },
  },
  mounted() {
    this.routerHelper = createRouterHelper(this.availableRoutes);
    this.loadRouterConfiguration();
    this.loadSavedLanguage(); // โหลดภาษาที่บันทึกไว้ก่อน
    this.loadLanguages();
    
    // สร้าง master configuration และโหลด custom roles ก่อน แล้วค่อย permissions
    this.$nextTick(async () => {
      this.createMasterRouterConfig();
      
      // โหลด custom roles ก่อนเพื่อให้ verification ทำงานได้
      await this.loadCustomRoles();
      
      // จากนั้นโหลด router permissions และ verify
      await this.loadRouterPermissions();
    });
  },
  updated() {
    feather.replace();
  },
  computed: {
    routesByModule() {
      if (!this.routerHelper) return {};
      return this.routerHelper.processRoutes();
    },
    moduleStats() {
      if (!this.routerHelper) return {};
      return this.routerHelper.calculateStats();
    },
    filteredRoutes() {
      if (!this.routerHelper) return {};
      
      let filtered = this.routerHelper.processRoutes();
      
      // กรองตามคำค้นหา
      if (this.searchRouterTerm) {
        filtered = this.routerHelper.filterRoutes(this.searchRouterTerm, filtered);
      }
      
      // กรองตามกลุ่ม
      if (this.selectedModuleFilter !== 'all') {
        filtered = this.routerHelper.filterByGroup(this.selectedModuleFilter, filtered);
      }
      
      return filtered;
    },
    availableModules() {
      if (!this.routerHelper) return [];
      return this.routerHelper.getAvailableGroups();
    },
    totalActiveRoutes() {
      if (!this.routerHelper) return 0;
      return this.routerHelper.getTotalRoutesCount();
    },
    
    // จำนวนการตั้งค่าที่ยังไม่ได้บันทึก
    pendingChangesCount() {
      return this.collectAllOverrides().length;
    },
    
    // สถานะการตั้งค่า
    hasUnsavedChanges() {
      return this.pendingChangesCount > 0;
    }
  },

};
</script>


<template>
  <Subhead 
    :button="true" 
    :name="'ย้อนกลับ'" 
    :style="'chevron-left'" 
    :link="'/origin/index'" 
  />

  <main class="flex-1 pb-8">
    <div class="mt-8">
        <div class="flex-1 bg-gray-100">
            <div class="mt-8">
                <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
                    <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">

              <section aria-labelledby="router-configuration-heading" class="relative">
                          <div class="shadow sm:overflow-hidden sm:rounded-md">
                              <div class="bg-white py-6 px-4 sm:p-6">

                    <!-- Router Configuration Interface -->
                    <div class="mt-6">
                      <div class="flex items-center justify-between mb-6">
                                <div>
                          <h2 class="text-lg font-bold leading-6 text-gray-900">
                            {{ translate('config-router-title', 'ตั้งค่า Router Configuration') }}
                          </h2>
                          <p class="mt-1 text-sm text-gray-500">
                            {{ translate('config-router-description', 'กำหนดค่าการทำงานของ router สำหรับ collection และระบบต่างๆ') }}
                          </p>
                                </div>

                        <div class="flex space-x-2">
                          <!-- Language Selector -->
                          <div 
                            v-if="getAvailableLanguages().length > 0" 
                            class="relative"
                          >
                            <select 
                              v-model="currentLanguage" 
                              @change="changeLanguage(currentLanguage)"
                              :disabled="isLoadingTranslations"
                              class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option 
                                v-for="lang in getAvailableLanguages()" 
                                :key="lang.code" 
                                :value="lang.code"
                              >
                                <span v-if="isValidEmoji(lang.flag)">{{ lang.flag }}</span>
                                <span v-else>🌐</span>
                                {{ lang.name }}
                              </option>
                            </select>
                                      </div>
                          
                          <!-- แสดงข้อความเมื่อไม่มีภาษา -->
                          <div 
                            v-else 
                            class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-500"
                          >
                            🌐 ไม่มีภาษา
                                  </div>
                          
                          <!-- Changes Status -->
                          <div v-if="hasUnsavedChanges" class="flex items-center px-3 py-2 bg-orange-100 border border-orange-300 rounded-md text-sm">
                            <font-awesome-icon :icon="['fas','exclamation-triangle']" class="text-orange-600 mr-2"/>
                            <span class="text-orange-800">{{ pendingChangesCount }} การตั้งค่าพร้อมบันทึก</span>
                                      </div>
                          
                          <!-- Save Button -->
                          <button 
                            @click="saveRouterConfiguration"
                                      type="button" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <font-awesome-icon :icon="['fas','save']" class="mr-2"/>
                            {{ translate('config-save', 'บันทึกการตั้งค่า') }}
                          </button>
                          
                          <!-- Reset Button -->
                          <button 
                            @click="resetRouterConfiguration"
                            type="button"
                            class="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            <font-awesome-icon :icon="['fas','undo']" class="mr-2"/>
                            {{ translate('config-reset', 'รีเซ็ต') }}
                                    </button>
                                  </div>
                                      </div>

                      <!-- Router Configuration Interface -->
                      <div class="bg-white shadow rounded-lg">
                        <div class="bg-blue-100 px-6 py-4 border-b border-blue-200">
                          <div class="flex items-center justify-between">
                            <div class="flex items-center">
                              <font-awesome-icon :icon="['fas','cogs']" class="text-blue-600 mr-3"/>
                              <h3 class="text-lg font-medium text-blue-900">
                                {{ translate('config-router-inline-settings', 'Router Configuration - Inline Settings') }}
                              </h3>
                                </div>

                            <div class="flex space-x-2">
                              <!-- Expand/Collapse All Routes -->
                              <button 
                                @click="expandAllRoutes"
                                type="button"
                                class="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <font-awesome-icon :icon="['fas','expand-arrows-alt']" class="mr-1"/>
                                {{ translate('config-expand-all', 'ขยายทั้งหมด') }}
                              </button>
                              
                              <button 
                                @click="collapseAllRoutes"
                                      type="button"
                                class="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                              >
                                <font-awesome-icon :icon="['fas','compress-arrows-alt']" class="mr-1"/>
                                {{ translate('config-collapse-all', 'ย่อทั้งหมด') }}
                              </button>
                              
                              <button 
                                @click="validateRouteConfiguration"
                                type="button" 
                                class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                              >
                                <font-awesome-icon :icon="['fas','check-circle']" class="mr-1"/>
                                {{ translate('config-validate', 'ตรวจสอบ') }}
                              </button>
                              
                              <button 
                                @click="exportRouterData"
                                type="button"
                                class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <font-awesome-icon :icon="['fas','download']" class="mr-1"/>
                                {{ translate('config-export', 'Export') }}
                                    </button>
                                      </div>
                                    </div>
                                  </div>

                        <div class="p-6">
                          <!-- Inline Route Configuration -->
                          <div class="space-y-6">
                            <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                              <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                  <font-awesome-icon :icon="['fas','info-circle']" class="text-blue-500 mr-3"/>
                                  <div>
                                    <h3 class="text-sm font-medium text-blue-800">
                                      {{ translate('config-inline-title', 'การตั้งค่าแบบ Inline') }}
                                    </h3>
                                    <p class="mt-1 text-sm text-blue-700">
                                      {{ translate('config-inline-description', 'ตั้งค่าสิทธิ์, เมนู, และการแสดงผลโดยตรงในแต่ละ route') }}
                                    </p>
                                      </div>
                                  </div>
                                
                                <!-- Language Status -->
                                <div v-if="isLoadingTranslations" class="flex items-center text-blue-600">
                                  <font-awesome-icon :icon="['fas','spinner']" class="animate-spin mr-2"/>
                                  <span class="text-xs">{{ translate('config-loading-translations', 'กำลังโหลดการแปล...') }}</span>
                                      </div>
                                <div v-else-if="getAvailableLanguages().length > 0" class="flex items-center text-green-600">
                                  <span v-if="isValidEmoji(getCurrentLanguageFlag())" class="mr-2">{{ getCurrentLanguageFlag() }}</span>
                                  <span v-else class="mr-2">🌐</span>
                                  <span class="text-xs">{{ translate('config-language-loaded', 'ภาษาโหลดแล้ว') }}</span>
                                    </div>
                                <div v-else class="flex items-center text-orange-600">
                                  <font-awesome-icon :icon="['fas','exclamation-triangle']" class="mr-2"/>
                                  <span class="text-xs">ไม่พบข้อมูลภาษา</span>
                                  </div>
                                </div>
                                </div>

                            <!-- Inline Route Configuration -->
                            <div class="space-y-6">
                              <template v-for="(subModules, group) in routesByModule" :key="group">
                                <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                  <!-- Group Header -->
                                  <div class="bg-gray-100 px-6 py-4 border-b border-gray-200">
                                    <div class="flex items-center justify-between">
                                      <div class="flex items-center">
                                        <font-awesome-icon :icon="['fas','folder']" class="text-blue-500 mr-3"/>
                                        <h3 class="text-lg font-medium text-gray-900 capitalize">{{ getGroupDisplayName(group) }}</h3>
                                        <span class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          {{ Object.keys(subModules).length }} sub-groups
                                        </span>
                                      </div>
                                      <button 
                                        @click="toggleModule(group)"
                                        class="text-gray-400 hover:text-gray-600"
                                      >
                                        <font-awesome-icon :icon="isModuleExpanded(group) ? ['fas','chevron-up'] : ['fas','chevron-down']"/>
                                      </button>
                                    </div>
                                      </div>
                                      
                                  <!-- Routes Configuration -->
                                  <div v-show="isModuleExpanded(group)" class="divide-y divide-gray-100">
                                    <template v-for="(routes, subModule) in subModules" :key="subModule">
                                      <template v-for="route in routes" :key="route.path">
                                        <div class="p-6 hover:bg-gray-50">
                                          <!-- Route Header -->
                                          <div class="flex items-start justify-between mb-4">
                                            <div class="flex items-center flex-1">
                                              <font-awesome-icon 
                                                :icon="getRouteIcon(route)" 
                                                :class="isVirtualParent(route) ? 'text-indigo-500 mr-3 text-lg' : 'text-gray-400 mr-3 text-lg'"
                                              />
                                              <div class="flex-1">
                                                <h4 class="text-lg font-medium" :class="isVirtualParent(route) ? 'text-indigo-900' : 'text-gray-900'">
                                                  {{ getRouteDisplayName(route) }}
                                                  <span v-if="isVirtualParent(route)" class="text-xs text-indigo-600 ml-2">(Auto-generated)</span>
                                                </h4>
                                                <p class="text-sm" :class="isVirtualParent(route) ? 'text-indigo-600' : 'text-gray-500'">{{ route.path }}</p>
                                                <p class="text-xs text-gray-400">{{ subModule }} • {{ group }}</p>
                                                <p v-if="isVirtualParent(route)" class="text-xs text-indigo-500 mt-1">
                                                  <font-awesome-icon :icon="['fas','info-circle']" class="mr-1"/>
                                                  Virtual parent สำหรับจัดกลุ่ม {{ route.children?.length || 0 }} child routes
                                                </p>
                                    </div>
                                  </div>

                                            <div class="flex items-center space-x-2">
                                              <template v-for="badge in getRouteDetailBadge(route)" :key="badge.text">
                                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="badge.color">
                                                  {{ badge.text }}
                                                </span>
                                              </template>
                                              
                                              <!-- Toggle Configuration Button -->
                                              <button 
                                                @click="toggleRouteConfig(getRouteKey(group, subModule, route.path))"
                                                class="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                              >
                                                <font-awesome-icon :icon="isRouteConfigExpanded(getRouteKey(group, subModule, route.path)) ? ['fas','chevron-up'] : ['fas','chevron-down']" class="mr-1"/>
                                                {{ isRouteConfigExpanded(getRouteKey(group, subModule, route.path)) ? translate('config-hide-settings', 'ซ่อนการตั้งค่า') : translate('config-show-settings', 'แสดงการตั้งค่า') }}
                                              </button>
                                            </div>
                                      </div>

                                          <!-- Virtual Parent Warning -->
                                          <div v-if="isVirtualParent(route) && isRouteConfigExpanded(getRouteKey(group, subModule, route.path))" class="mt-4 pt-4 border-t border-gray-200">
                                            <div class="bg-indigo-50 border border-indigo-200 rounded-md p-4 mb-4">
                                              <div class="flex">
                                                <font-awesome-icon :icon="['fas','info-circle']" class="text-indigo-400 mr-3 mt-0.5"/>
                                      <div>
                                                  <h3 class="text-sm font-medium text-indigo-800">Virtual Parent Route</h3>
                                                  <p class="mt-1 text-sm text-indigo-700">
                                                    Route นี้ถูกสร้างขึ้นอัตโนมัติเพื่อจัดกลุ่ม child routes ที่เกี่ยวข้องกัน 
                                                    การตั้งค่าจะถูกนำไปใช้กับ child routes ทั้งหมด
                                                  </p>
                                      </div>
                                              </div>
                                    </div>
                                  </div>

                                          <!-- Configuration Grid -->
                                          <div v-show="isRouteConfigExpanded(getRouteKey(group, subModule, route.path))" class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 pt-4 border-t border-gray-200">
                                            <!-- Permissions & Access -->
                                            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                              <h5 class="text-sm font-medium text-yellow-800 mb-3 flex items-center">
                                                <font-awesome-icon :icon="['fas','shield-alt']" class="mr-2"/>
                                                {{ translate('config-permissions-access', 'สิทธิ์และการเข้าถึง') }}
                                              </h5>
                                              
                                              <!-- Authentication -->
                                              <div class="mb-3">
                                                <label class="inline-flex items-center">
                                            <input
                                                    type="checkbox" 
                                                    :checked="route.meta?.auth || false"
                                                    @change="updateRouteMeta(group, subModule, route.path, 'auth', $event.target.checked)"
                                                    class="rounded border-gray-300 text-yellow-600 shadow-sm focus:border-yellow-300 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                                  >
                                                  <span class="ml-2 text-sm text-yellow-700">{{ translate('config-auth-required', 'ต้องการ Authentication') }}</span>
                                                </label>
                                                      </div>
                            
                                                                                            <!-- Roles -->
                                              <div class="mb-3">
                                                <label class="block text-xs font-medium text-yellow-700 mb-2">User Roles:</label>
                                                <div class="grid grid-cols-2 gap-1">
                                                  <template v-for="role in getAllRoles()" :key="role.id">
                                                    <label class="inline-flex items-center">
                                                      <input 
                                                        type="checkbox" 
                                                        :checked="route.meta?.role?.includes(role.id) || false"
                                                        @change="updateRouteRole(group, subModule, route.path, role.id, $event.target.checked)"
                                                        class="rounded border-gray-300 text-yellow-600 shadow-sm focus:border-yellow-300 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                                      >
                                                      <span class="ml-1 text-xs capitalize" :class="getRoleColorClass(role)">
                                                        <font-awesome-icon :icon="['fas', role.icon]" class="mr-1"/>
                                                        {{ role.name }}
                                                      </span>
                                                    </label>
                                                  </template>
                                                  </div>
                                                </div>
                                                
                                              <!-- Route Type -->
                                              <div>
                                                <label class="block text-xs font-medium text-yellow-700 mb-1">Page Type:</label>
                                                <select 
                                                  :value="route.meta?.type || 'page'"
                                                  @change="updateRouteMeta(group, subModule, route.path, 'type', $event.target.value)"
                                                  class="w-full text-xs border-yellow-300 rounded focus:border-yellow-400 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                                >
                                                  <option value="page">Page</option>
                                                  <option value="modal">Modal</option>
                                                  <option value="popup">Popup</option>
                                                  <option value="iframe">IFrame</option>
                                                </select>
                                              </div>               
                                              </div>

                                            <!-- Menu & Display -->
                                            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                                              <h5 class="text-sm font-medium text-green-800 mb-3 flex items-center">
                                                <font-awesome-icon :icon="['fas','bars']" class="mr-2"/>
                                                {{ translate('config-menu-display', 'การแสดงผลเมนู') }}
                                              </h5>

                                              <!-- Menu Visibility -->
                                              <div class="mb-3">
                                                <label class="inline-flex items-center">
                                                  <input 
                                                    type="checkbox" 
                                                    :checked="route.meta?.inMenu || false"
                                                    @change="updateRouteMeta(group, subModule, route.path, 'inMenu', $event.target.checked)"
                                                    class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                                  >
                                                  <span class="ml-2 text-sm text-green-700">{{ translate('config-show-in-menu', 'แสดงในเมนู') }}</span>
                                                </label>
                                      </div>
                                        
                                              <!-- Navigation Position -->
                                              <div class="mb-3 space-y-2">
                                                <label class="inline-flex items-center">
                                                  <input 
                                                    type="checkbox" 
                                                    :checked="route.inApp === 'yes'"
                                                    @change="updateRouteProperty(group, subModule, route.path, 'inApp', $event.target.checked ? 'yes' : 'no')"
                                                    class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                                  >
                                                  <span class="ml-2 text-sm text-green-700">App Navigation</span>
                                                </label>
                                                <label class="inline-flex items-center">
                                                  <input 
                                                    type="checkbox" 
                                                    :checked="route.inTop === 'yes'"
                                                    @change="updateRouteProperty(group, subModule, route.path, 'inTop', $event.target.checked ? 'yes' : 'no')"
                                                    class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                                  >
                                                  <span class="ml-2 text-sm text-green-700">Top Navigation</span>
                                                </label>
                                  </div>

                                              <!-- Menu Icon -->
                                              <div class="mb-3">
                                                <label class="block text-xs font-medium text-green-700 mb-1">Icon:</label>
                                                <input 
                                                  type="text" 
                                                  :value="route.meta?.icon || ''"
                                                  @input="updateRouteMeta(group, subModule, route.path, 'icon', $event.target.value)"
                                                  placeholder="file-alt"
                                                  class="w-full text-xs border-green-300 rounded focus:border-green-400 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                                >
                                </div>

                                              <!-- Menu Order -->
                                <div>
                                                <label class="block text-xs font-medium text-green-700 mb-1">Menu Order:</label>
                                                <select 
                                                  :value="route.meta?.order || 0"
                                                  @change="updateRouteMeta(group, subModule, route.path, 'order', parseInt($event.target.value))"
                                                  class="w-full text-xs border-green-300 rounded focus:border-green-400 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                                >
                                                  <option value="0">Auto</option>
                                                  <option value="1">1</option>
                                                  <option value="2">2</option>
                                                  <option value="3">3</option>
                                                  <option value="4">4</option>
                                                  <option value="5">5</option>
                                                </select>
                                  </div>
                                      </div>

                                            <!-- Advanced Settings -->
                                            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                              <h5 class="text-sm font-medium text-purple-800 mb-3 flex items-center">
                                                <font-awesome-icon :icon="['fas','code']" class="mr-2"/>
                                                {{ translate('config-advanced', 'ขั้นสูง') }}
                                              </h5>

                                              <!-- Route Features -->
                                              <div class="mb-3 space-y-2">
                                                <label class="inline-flex items-center">
                                                  <input
                                                    type="checkbox" 
                                                    :checked="route.hasSubmenu || false"
                                                    @change="updateRouteProperty(group, subModule, route.path, 'hasSubmenu', $event.target.checked)"
                                                    class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                                                  >
                                                  <span class="ml-2 text-sm text-purple-700">Has Submenu</span>
                                                </label>
                                                <label class="inline-flex items-center">
                                                  <input 
                                                    type="checkbox" 
                                                    :checked="route.hasDashboard || false"
                                                    @change="updateRouteProperty(group, subModule, route.path, 'hasDashboard', $event.target.checked)"
                                                    class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                                                  >
                                                  <span class="ml-2 text-sm text-purple-700">Has Dashboard</span>
                                                </label>
                                                <label class="inline-flex items-center">
                                                  <input 
                                                    type="checkbox" 
                                                    :checked="route.meta?.fullscreen || false"
                                                    @change="updateRouteMeta(group, subModule, route.path, 'fullscreen', $event.target.checked)"
                                                    class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                                                  >
                                                  <span class="ml-2 text-sm text-purple-700">Fullscreen</span>
                                    </label>
                                  </div>

                                              <!-- Collection Mapping -->
                                              <div class="mb-3">
                                                <label class="block text-xs font-medium text-purple-700 mb-1">Collection:</label>
                                                <select 
                                                  :value="route.meta?.collection || ''"
                                                  @change="updateRouteMeta(group, subModule, route.path, 'collection', $event.target.value)"
                                                  class="w-full text-xs border-purple-300 rounded focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                                                >
                                                  <option value="">No Collection</option>
                                                  <option value="users">Users</option>
                                                  <option value="content">Content</option>
                                                  <option value="settings">Settings</option>
                                                  <option value="logs">Logs</option>
                                                </select>
                                </div>

                                              <!-- Custom Properties -->
                                  <div>
                                                <label class="block text-xs font-medium text-purple-700 mb-1">Custom Key:</label>
                                          <input
                                                  type="text" 
                                                  :value="route.meta?.key || ''"
                                                  @input="updateRouteMeta(group, subModule, route.path, 'key', $event.target.value)"
                                                  placeholder="custom-key"
                                                  class="w-full text-xs border-purple-300 rounded focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                                                >
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <!-- Child Routes (Using RouteCard Component) -->
                                          <template v-if="route.children && route.children.length > 0">
                                            <div class="mt-6 space-y-4">
                                              <RouteCard
                                                v-for="child in route.children" 
                                                :key="child.path"
                                                :route="child"
                                                :group="group"
                                                :subModule="subModule"
                                                :parentPath="route.path"
                                                :level="2"
                                                :routeKey="getChildRouteKey(group, subModule, route.path, child.path)"
                                                @update-meta="handleChildUpdateMeta"
                                                @update-property="handleChildUpdateProperty"
                                                @update-role="handleChildUpdateRole"
                                              />
                                          </div>
                                      </template>
                                    </div>
                                      </template>
                                    </template>
                                  </div>
                                          </div>
                                      </template>
                            </div>
                            
                            <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                              <div class="flex">
                                <font-awesome-icon :icon="['fas','exclamation-triangle']" class="text-yellow-400 mr-3 mt-0.5"/>
                                <div>
                                  <h3 class="text-sm font-medium text-yellow-800">คำเตือน</h3>
                                  <p class="mt-1 text-sm text-yellow-700">การเปลี่ยนแปลงสิทธิ์การเข้าถึงอาจส่งผลต่อการทำงานของระบบ กรุณาตรวจสอบให้ดีก่อนบันทึก</p>
                                    </div>
                                  </div>
                                </div>

                            <!-- User Role Permission Management Component -->
                            <!-- แสดง Loading State ขณะรอข้อมูล Permission -->
                            <div v-if="!isPermissionDataReady" class="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                              <div class="flex flex-col items-center">
                                <font-awesome-icon :icon="['fas','spinner']" class="text-blue-500 text-3xl animate-spin mb-4"/>
                                <h3 class="text-lg font-medium text-blue-800 mb-2">กำลังโหลดข้อมูลสิทธิ์...</h3>
                                <p class="text-sm text-blue-600">กรุณารอสักครู่ ระบบกำลังดึงข้อมูลการตั้งค่าสิทธิ์จากเซิร์ฟเวอร์</p>
                              </div>
                                </div>

                            <!-- แสดง Component เมื่อข้อมูลพร้อมแล้ว -->
                            <UserRolePermissionManagement
                              v-if="isPermissionDataReady"
                              :routesByModule="routesByModule"
                              :isSavingPermissions="isSavingPermissions"
                              :isLoadingPermissions="isLoadingPermissions"
                              @apply-bulk-permissions="applyBulkPermissions"
                              @export-permission-matrix="exportPermissionMatrix"
                              @toggle-group-role="toggleGroupRole"
                              @update-route-role="updateRouteRole"
                              @preview-changes="previewChanges"
                              @save-router-permissions="saveRouterPermissions"
                              @reset-to-default="resetToDefaultPermissions"
                            />
                                        </div>
                                    </div>
                                </div>
                              </div>
                              </div>
                          </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </main>
</template>

<style scoped>
/* ==========================================
   Route Configuration Animations
   ========================================== */
.route-config-enter-active,
.route-config-leave-active {
  transition: all 0.3s ease;
}

.route-config-enter-from,
.route-config-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ==========================================
   Child Route Configuration Animations
   ========================================== */
.child-config-enter-active,
.child-config-leave-active {
  transition: all 0.25s ease;
}

.child-config-enter-from,
.child-config-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* ==========================================
   Button & Card Hover Effects
   ========================================== */
.config-toggle-btn {
  transition: all 0.2s ease;
}

.config-toggle-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.route-card {
  transition: all 0.2s ease;
}

.route-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* ==========================================
   Child Route Card Effects
   ========================================== */
.child-route-card {
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.child-route-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.5s ease;
}

.child-route-card:hover::before {
  left: 100%;
}

/* ==========================================
   Configuration Grid Animations
   ========================================== */
.config-grid {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==========================================
   Layout & Responsive Design
   ========================================== */
.btn-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .btn-group {
    flex-direction: column;
  }
  
  .btn-group button {
    width: 100%;
  }
}

@media (max-width: 1024px) {
  .config-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* ==========================================
   Loading & Focus States
   ========================================== */
.loading-overlay {
  position: relative;
}

.loading-overlay::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* ==========================================
   Accessibility & User Preferences
   ========================================== */
@media (prefers-contrast: high) {
  .route-card,
  .child-route-card {
    border: 2px solid #000;
  }
  
  .config-toggle-btn {
    border: 1px solid #000;
  }
}

@media (prefers-reduced-motion: reduce) {
  .route-config-enter-active,
  .route-config-leave-active,
  .child-config-enter-active,
  .child-config-leave-active,
  .config-toggle-btn,
  .route-card,
  .child-route-card {
    transition: none;
  }
  
  .config-grid {
    animation: none;
  }
  
  .child-route-card::before {
    transition: none;
  }
}
</style>