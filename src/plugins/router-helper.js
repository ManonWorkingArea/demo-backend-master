/**
 * Router Helper - สำหรับดึงและจัดการข้อมูล router
 * ใช้สำหรับ render router information ในหลายๆ จุด
 */

export class RouterHelper {
  constructor(routes = []) {
    this.routes = routes;
  }

  /**
   * Process routes recursively และจัดกลุ่มตาม groups
   * @param {Array} routes - Array ของ routes
   * @returns {Object} - Object ที่จัดกลุ่มแล้ว
   */
  processRoutes(routes = null) {
    const routesToProcess = routes || this.routes;
    const groups = {};
    
    // Function to process routes recursively
    const processRoute = (route, parentPath = '', level = 0) => {
      if (!route.path && !route.name) return null;
      
      // สร้าง full path โดยใส่ / คั่นกลาง และกำจัด double slash
      const fullPath = parentPath 
        ? `${parentPath}/${route.path}`.replace(/\/+/g, '/') 
        : route.path;
      const pathParts = fullPath.split('/').filter(part => part !== '');
      
      // ใช้ groups จาก route definition เป็นหลัก
      const groupName = route.groups || pathParts[0] || 'general';
      
      // สำหรับ origin group ให้ใช้ path segment แรกเป็น subModule
      // สำหรับ group อื่นๆ ให้ใช้ path segment ที่สองเป็น subModule
      let subModule;
      if (groupName === 'origin') {
        // สำหรับ origin group ใช้ path segment แรกเป็น subModule (origin, resource, asset, collection)
        subModule = pathParts[0] || 'main';
      } else {
        // สำหรับ group อื่นๆ ใช้ path segment ที่สองเป็น subModule
        subModule = pathParts[1] || 'main';
      }
      
      if (!groups[groupName]) {
        groups[groupName] = {};
      }
      if (!groups[groupName][subModule]) {
        groups[groupName][subModule] = [];
      }
      
      const routeInfo = {
        name: route.name || 'Unnamed',
        path: fullPath,
        originalPath: route.path,
        component: route.component?.name || route.component || 'Unknown',
        meta: route.meta || {},
        level: level,
        isParent: !!(route.children && route.children.length > 0),
        children: [],
        // ข้อมูลเพิ่มเติม
        props: route.props || null,
        redirect: route.redirect || null,
        alias: route.alias || null,
        beforeEnter: route.beforeEnter ? 'Yes' : 'No',
        caseSensitive: route.caseSensitive || false,
        pathToRegexpOptions: route.pathToRegexpOptions || null,
        // ข้อมูลจาก route definition
        description: route.description || route.meta?.description || '',
        groups: route.groups || route.meta?.groups || '',
        default: route.default || route.meta?.default || false,
        hasSubmenu: route.hasSubmenu || route.meta?.hasSubmenu || false,
        hasDashboard: route.hasDashboard || route.meta?.hasDashboard || false,
        inApp: route.inApp || route.meta?.inApp || '',
        inTop: route.inTop || route.meta?.inTop || '',
        icon: route.icon || route.meta?.icon || 'folder-o'
      };
      
      // Process children recursively
      if (route.children && route.children.length > 0) {
        route.children.forEach(child => {
          const childInfo = processRoute(child, fullPath, level + 1);
          if (childInfo) {
            routeInfo.children.push(childInfo);
          }
        });
      }
      
      groups[groupName][subModule].push(routeInfo);
      return routeInfo;
    };
    
    // Process all routes
    routesToProcess.forEach(route => {
      processRoute(route);
    });
    
    // Post-process: จัดกลุ่ม routes ที่มี path pattern เหมือนกัน
    Object.keys(groups).forEach(groupName => {
      Object.keys(groups[groupName]).forEach(subModule => {
        groups[groupName][subModule] = this.groupRelatedRoutes(groups[groupName][subModule]);
      });
    });
    
    return groups;
  }

  /**
   * จัดกลุ่ม routes ที่เกี่ยวข้องกัน โดยจัดเป็น hierarchical structure
   * @param {Array} routes - Array ของ routes
   * @returns {Array} - Routes ที่จัดกลุ่มแล้ว
   */
  groupRelatedRoutes(routes) {
    const routeMap = new Map();
    const result = [];
    
    // สร้าง map ของ routes ทั้งหมด
    routes.forEach(route => {
      routeMap.set(route.path, { ...route, children: [] });
    });
    
    // จัดกลุ่ม routes ตาม path hierarchy
    routes.forEach(route => {
      const pathParts = route.path.split('/').filter(part => part !== '');
      const currentRoute = routeMap.get(route.path);
      
      if (pathParts.length === 1) {
        // Level 1: Main routes เช่น /origin
        result.push(currentRoute);
      } else if (pathParts.length === 2) {
        // Level 2: Sub routes เช่น /origin/collection
        const parentPath = '/' + pathParts[0];
        const parentRoute = routeMap.get(parentPath);
        
        if (parentRoute) {
          parentRoute.children.push(currentRoute);
          parentRoute.isParent = true;
        } else {
          // ถ้าไม่มี parent ให้เพิ่มเป็น root level
          result.push(currentRoute);
        }
      } else if (pathParts.length >= 3) {
        // Level 3+: Child routes เช่น /origin/collection/add
        const parentPath = '/' + pathParts.slice(0, 2).join('/');
        const parentRoute = routeMap.get(parentPath);
        
        if (parentRoute) {
          // มี parent route ตรงกัน
          parentRoute.children.push(currentRoute);
          parentRoute.isParent = true;
        } else {
          // ไม่มี parent route ตรงกัน ให้สร้าง virtual parent
          const grandParentPath = '/' + pathParts[0];
          const grandParentRoute = routeMap.get(grandParentPath);
          
          if (grandParentRoute) {
            // หา virtual parent ที่มีอยู่แล้วหรือสร้างใหม่
            let virtualParent = grandParentRoute.children.find(child => 
              child.meta?.virtual && child.name === `${pathParts[0]}-${pathParts[1]}`
            );
            
            if (!virtualParent) {
              // สร้าง virtual parent ใหม่
              virtualParent = {
                path: `/${pathParts[0]}/${pathParts[1]}`,
                name: `${pathParts[0]}-${pathParts[1]}`,
                component: 'Virtual Parent',
                meta: {
                  title: this.formatRouteName(pathParts[1]),
                  virtual: true,
                  icon: 'folder-open-o',
                  inMenu: true,
                  auth: false,
                  parent: pathParts[0]
                },
                children: [],
                isParent: true,
                level: 2
              };
              
              grandParentRoute.children.push(virtualParent);
              grandParentRoute.isParent = true;
            }
            
            // เพิ่ม child route เข้าไปใน virtual parent
            virtualParent.children.push(currentRoute);
          } else {
            // ไม่มี grand parent ให้เพิ่มเป็น root level
            result.push(currentRoute);
          }
        }
      }
    });
    
    // เรียงลำดับ routes
    this.sortRoutesRecursively(result);
    
    return result;
  }
  
  /**
   * เรียงลำดับ routes แบบ recursive
   * @param {Array} routes - Array ของ routes
   */
  sortRoutesRecursively(routes) {
    routes.sort((a, b) => {
      // Virtual routes อยู่ท้าย
      if (a.meta?.virtual && !b.meta?.virtual) return 1;
      if (!a.meta?.virtual && b.meta?.virtual) return -1;
      
      // เรียงตาม path
      return a.path.localeCompare(b.path);
    });
    
    // เรียงลำดับ children ด้วย
    routes.forEach(route => {
      if (route.children && route.children.length > 0) {
        this.sortRoutesRecursively(route.children);
      }
    });
  }

  /**
   * Format route name ให้อ่านง่าย
   * @param {string} name - ชื่อ route
   * @returns {string} - ชื่อที่ format แล้ว
   */
  formatRouteName(name) {
    if (!name) return '';
    
    // แปลง camelCase หรือ kebab-case เป็นชื่อที่อ่านง่าย
    return name
      .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase -> camel Case
      .replace(/[-_]/g, ' ') // kebab-case หรือ snake_case -> space
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * คำนวณสถิติของแต่ละกลุ่ม
   * @param {Object} groupedRoutes - Routes ที่จัดกลุ่มแล้ว
   * @returns {Object} - สถิติของแต่ละกลุ่ม
   */
  calculateStats(groupedRoutes = null) {
    const routes = groupedRoutes || this.processRoutes();
    const stats = {};
    
    Object.keys(routes).forEach(group => {
      let totalRoutes = 0;
      let totalChildren = 0;
      let parentRoutes = 0;
      
      Object.keys(routes[group]).forEach(subModule => {
        routes[group][subModule].forEach(route => {
          totalRoutes++;
          if (route.isParent) {
            parentRoutes++;
            totalChildren += route.children.length;
          }
        });
      });
      
      stats[group] = {
        subModules: Object.keys(routes[group]).length,
        totalRoutes: totalRoutes,
        parentRoutes: parentRoutes,
        totalChildren: totalChildren,
        totalAll: totalRoutes + totalChildren
      };
    });
    
    return stats;
  }

  /**
   * กรองข้อมูล routes ตามคำค้นหา
   * @param {string} searchTerm - คำค้นหา
   * @param {Object} groupedRoutes - Routes ที่จัดกลุ่มแล้ว
   * @returns {Object} - Routes ที่ผ่านการกรอง
   */
  filterRoutes(searchTerm = '', groupedRoutes = null) {
    const routes = groupedRoutes || this.processRoutes();
    
    if (!searchTerm) return routes;
    
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = {};
    
    Object.keys(routes).forEach(group => {
      const filteredSubModules = {};
      Object.keys(routes[group]).forEach(subModule => {
        const filteredRoutes = routes[group][subModule].filter(route => {
          // ค้นหาใน parent route
          const parentMatch = route.name.toLowerCase().includes(searchTermLower) ||
                            route.path.toLowerCase().includes(searchTermLower) ||
                            route.component.toLowerCase().includes(searchTermLower);
          
          // ค้นหาใน children routes
          const childMatch = route.children && route.children.some(child =>
            child.name.toLowerCase().includes(searchTermLower) ||
            child.path.toLowerCase().includes(searchTermLower) ||
            child.component.toLowerCase().includes(searchTermLower)
          );
          
          return parentMatch || childMatch;
        });
        
        if (filteredRoutes.length > 0) {
          filteredSubModules[subModule] = filteredRoutes;
        }
      });
      if (Object.keys(filteredSubModules).length > 0) {
        filtered[group] = filteredSubModules;
      }
    });
    
    return filtered;
  }

  /**
   * กรองตามกลุ่ม
   * @param {string} groupName - ชื่อกลุ่ม
   * @param {Object} groupedRoutes - Routes ที่จัดกลุ่มแล้ว
   * @returns {Object} - Routes ของกลุ่มที่เลือก
   */
  filterByGroup(groupName = 'all', groupedRoutes = null) {
    const routes = groupedRoutes || this.processRoutes();
    
    if (groupName === 'all') return routes;
    
    const filtered = {};
    if (routes[groupName]) {
      filtered[groupName] = routes[groupName];
    }
    
    return filtered;
  }

  /**
   * กรอง routes ที่มี hasDashboard = true
   * @param {Object} groupedRoutes - Routes ที่จัดกลุ่มแล้ว
   * @returns {Object} - Routes ที่มี hasDashboard = true
   */
  filterDashboardRoutes(groupedRoutes = null) {
    const routes = groupedRoutes || this.processRoutes();
    const filtered = {};
    
    Object.keys(routes).forEach(group => {
      const filteredSubModules = {};
      Object.keys(routes[group]).forEach(subModule => {
        const filteredRoutes = routes[group][subModule].filter(route => {
          return route.hasDashboard === true;
        });
        
        if (filteredRoutes.length > 0) {
          filteredSubModules[subModule] = filteredRoutes;
        }
      });
      if (Object.keys(filteredSubModules).length > 0) {
        filtered[group] = filteredSubModules;
      }
    });
    
    return filtered;
  }

  /**
   * กรอง routes ที่เป็น default plugins
   * @param {Object} groupedRoutes - Routes ที่จัดกลุ่มแล้ว
   * @returns {Object} - Routes ที่เป็น default plugins
   */
  filterDefaultRoutes(groupedRoutes = null) {
    const routes = groupedRoutes || this.processRoutes();
    const filtered = {};
    
    Object.keys(routes).forEach(group => {
      const filteredSubModules = {};
      Object.keys(routes[group]).forEach(subModule => {
        const filteredRoutes = routes[group][subModule].filter(route => {
          return route.default === true;
        });
        
        if (filteredRoutes.length > 0) {
          filteredSubModules[subModule] = filteredRoutes;
        }
      });
      if (Object.keys(filteredSubModules).length > 0) {
        filtered[group] = filteredSubModules;
      }
    });
    
    return filtered;
  }

  /**
   * สร้าง badge สำหรับแสดงคุณสมบัติของ route
   * @param {Object} route - ข้อมูล route
   * @returns {Array} - Array ของ badge objects
   */
  getRouteDetailBadges(route) {
    const badges = [];
    
    // Badge สำหรับ virtual parent (ต้องมาก่อน)
    if (route.meta?.virtual) badges.push({ text: 'Virtual Parent', color: 'bg-indigo-100 text-indigo-800' });
    
    if (route.isParent) badges.push({ text: 'Parent', color: 'bg-blue-100 text-blue-800' });
    if (route.redirect) badges.push({ text: 'Redirect', color: 'bg-yellow-100 text-yellow-800' });
    if (route.alias) badges.push({ text: 'Alias', color: 'bg-purple-100 text-purple-800' });
    if (route.beforeEnter === 'Yes') badges.push({ text: 'Guard', color: 'bg-red-100 text-red-800' });
    if (route.props) badges.push({ text: 'Props', color: 'bg-green-100 text-green-800' });
    
    // Badge สำหรับ meta data
    if (route.meta?.auth) badges.push({ text: 'Auth Required', color: 'bg-orange-100 text-orange-800' });
    if (route.meta?.inMenu) badges.push({ text: 'In Menu', color: 'bg-green-100 text-green-800' });
    if (route.hasDashboard) badges.push({ text: 'Has Dashboard', color: 'bg-blue-100 text-blue-800' });
    if (route.hasSubmenu) badges.push({ text: 'Has Submenu', color: 'bg-cyan-100 text-cyan-800' });
    if (route.default) badges.push({ text: 'Default Plugin', color: 'bg-emerald-100 text-emerald-800' });
    if (route.meta?.role && route.meta.role.length > 0) badges.push({ 
      text: `Role: ${route.meta.role.join(', ')}`, 
      color: 'bg-purple-100 text-purple-800' 
    });
    if (route.path.includes(':')) badges.push({ text: 'Dynamic', color: 'bg-indigo-100 text-indigo-800' });
    if (route.meta?.type) badges.push({ text: route.meta.type, color: 'bg-gray-100 text-gray-800' });
    
    return badges;
  }

  /**
   * ดึงรายชื่อกลุ่มทั้งหมด
   * @param {Object} groupedRoutes - Routes ที่จัดกลุ่มแล้ว
   * @returns {Array} - Array ของชื่อกลุ่ม
   */
  getAvailableGroups(groupedRoutes = null) {
    const routes = groupedRoutes || this.processRoutes();
    return Object.keys(routes);
  }

  /**
   * นับจำนวน routes ทั้งหมด
   * @returns {number} - จำนวน routes ทั้งหมด
   */
  getTotalRoutesCount() {
    let total = 0;
    this.routes.forEach(route => {
      if (route.path && route.name) {
        total++;
        // นับ children ด้วย
        if (route.children) {
          total += route.children.length;
        }
      }
    });
    return total;
  }

  /**
   * Export ข้อมูล router เป็น JSON
   * @param {Object} groupedRoutes - Routes ที่จัดกลุ่มแล้ว
   * @returns {Object} - ข้อมูลสำหรับ export
   */
  exportData(groupedRoutes = null) {
    const routes = groupedRoutes || this.processRoutes();
    const stats = this.calculateStats(routes);
    
    return {
      groups: routes,
      stats: stats,
      summary: {
        totalGroups: Object.keys(routes).length,
        totalRoutes: Object.values(stats).reduce((sum, stat) => sum + stat.totalRoutes, 0),
        totalChildren: Object.values(stats).reduce((sum, stat) => sum + stat.totalChildren, 0),
        totalAll: Object.values(stats).reduce((sum, stat) => sum + stat.totalAll, 0)
      },
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * รีเซ็ต routes
   * @param {Array} newRoutes - Routes ใหม่
   */
  setRoutes(newRoutes) {
    this.routes = newRoutes;
  }
}

/**
 * Helper function สำหรับสร้าง RouterHelper instance
 * @param {Array} routes - Array ของ routes
 * @returns {RouterHelper} - RouterHelper instance
 */
export function createRouterHelper(routes) {
  return new RouterHelper(routes);
}

/**
 * Helper function สำหรับดึงข้อมูล router แบบ static
 * @param {Array} routes - Array ของ routes
 * @returns {Object} - ข้อมูล router ที่ process แล้ว
 */
export function getProcessedRoutes(routes) {
  const helper = new RouterHelper(routes);
  return {
    groupedRoutes: helper.processRoutes(),
    stats: helper.calculateStats(),
    helper: helper
  };
}

export default RouterHelper; 