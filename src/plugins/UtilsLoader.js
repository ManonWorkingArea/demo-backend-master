export function getPluginRoutes(routes) {
  const routesWithSubmenus = [];
  routes.forEach((route) => {
      const finalName = route.translatedTitle || route.meta.translatedTitle || route.meta.title;
      const finalLanguage = route.lang || route.meta.lang || ('router-' + route.meta.parent + '-' + route.meta.key);
      
      routesWithSubmenus.push({
        name: finalName,
        linkage: route.linkage||"",
        userDashboard: route.userDashboard||"",
        inApp: route.inApp||"",
        inTop: route.inTop||"",
        slug: route.name,
        groups: route.groups,
        path: route.path,
        icon: route.meta.icon,
        meta: route.meta,
        role: route.meta.role,
        routes: route.children,
        counter: route.counter,
        session: route.session || false,
        fullscreen: route.meta.fullscreen||false,
        hasSubmenu: route.hasSubmenu,
        language: finalLanguage
      });
  });
  
  return routesWithSubmenus;
}

export function getPluginNames(plugins) {
  return plugins.map((plugin) => {
    const finalName = plugin.translatedTitle || plugin.meta.translatedTitle || plugin.meta.title;
    const finalLanguage = plugin.lang || plugin.meta.lang || ('router-' + plugin.meta.parent + '-' + plugin.meta.key);
    
    return {
      slug: plugin.name,
      groups: plugin.groups,
      linkage: plugin.linkage||"",
      userDashboard: plugin.userDashboard||"",
      inApp: plugin.inApp||"",
      inTop: plugin.inTop||"",
      name: finalName,
      dashboard: plugin.hasDashboard,
      description: plugin.description,
      default: plugin.default,
      role: plugin.meta.role,
      counter: plugin.counter,
      session: plugin.session || false,
      fullscreen: plugin.meta.fullscreen||false,
      language: finalLanguage
    };
  });
}

/**
 * จัดกลุ่ม Plugin Routes ตาม groups
 * @param {Array} routes - Array ของ routes
 * @returns {Object} - Object ที่จัดกลุ่มแล้ว
 */
export function getGroupedPluginRoutes(routes) {
  const processedRoutes = getPluginRoutes(routes);
  const groups = {};
  
  processedRoutes.forEach((route) => {
    const groupName = route.groups || 'general';
    
    // สร้าง subModule จาก path
    const pathParts = route.path ? route.path.split('/').filter(part => part !== '') : [];
    let subModule;
    
    if (groupName === 'origin') {
      // สำหรับ origin group ใช้ path segment แรกเป็น subModule
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
    
    groups[groupName][subModule].push(route);
  });
  
  return groups;
}

/**
 * จัดกลุ่ม Plugin Names ตาม groups
 * @param {Array} plugins - Array ของ plugins
 * @returns {Object} - Object ที่จัดกลุ่มแล้ว
 */
export function getGroupedPluginNames(plugins) {
  const processedPlugins = getPluginNames(plugins);
  const groups = {};
  
  processedPlugins.forEach((plugin) => {
    const groupName = plugin.groups || 'general';
    
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    
    groups[groupName].push(plugin);
  });
  
  return groups;
}

/**
 * คำนวณสถิติของแต่ละกลุ่ม Plugin
 * @param {Object} groupedPlugins - Plugins ที่จัดกลุ่มแล้ว
 * @returns {Object} - สถิติของแต่ละกลุ่ม
 */
export function calculatePluginStats(groupedPlugins) {
  const stats = {};
  
  Object.keys(groupedPlugins).forEach(group => {
    if (Array.isArray(groupedPlugins[group])) {
      // สำหรับ Plugin Names (array)
      stats[group] = {
        totalPlugins: groupedPlugins[group].length,
        withDashboard: groupedPlugins[group].filter(p => p.dashboard).length,
        withSession: groupedPlugins[group].filter(p => p.session).length,
        withFullscreen: groupedPlugins[group].filter(p => p.fullscreen).length
      };
    } else {
      // สำหรับ Plugin Routes (object with subModules)
      let totalRoutes = 0;
      let totalWithSubmenu = 0;
      
      Object.keys(groupedPlugins[group]).forEach(subModule => {
        const routes = groupedPlugins[group][subModule];
        totalRoutes += routes.length;
        totalWithSubmenu += routes.filter(r => r.hasSubmenu).length;
      });
      
      stats[group] = {
        subModules: Object.keys(groupedPlugins[group]).length,
        totalRoutes: totalRoutes,
        withSubmenu: totalWithSubmenu
      };
    }
  });
  
  return stats;
}

/**
 * กรองข้อมูล plugins ตามคำค้นหา
 * @param {string} searchTerm - คำค้นหา
 * @param {Object} groupedPlugins - Plugins ที่จัดกลุ่มแล้ว
 * @returns {Object} - Plugins ที่ผ่านการกรอง
 */
export function filterPlugins(searchTerm = '', groupedPlugins) {
  if (!searchTerm) return groupedPlugins;
  
  const searchTermLower = searchTerm.toLowerCase();
  const filtered = {};
  
  Object.keys(groupedPlugins).forEach(group => {
    if (Array.isArray(groupedPlugins[group])) {
      // สำหรับ Plugin Names (array)
      const filteredPlugins = groupedPlugins[group].filter(plugin =>
        plugin.name.toLowerCase().includes(searchTermLower) ||
        plugin.slug.toLowerCase().includes(searchTermLower) ||
        (plugin.description && plugin.description.toLowerCase().includes(searchTermLower))
      );
      
      if (filteredPlugins.length > 0) {
        filtered[group] = filteredPlugins;
      }
    } else {
      // สำหรับ Plugin Routes (object with subModules)
      const filteredSubModules = {};
      
      Object.keys(groupedPlugins[group]).forEach(subModule => {
        const filteredRoutes = groupedPlugins[group][subModule].filter(route =>
          route.name.toLowerCase().includes(searchTermLower) ||
          route.slug.toLowerCase().includes(searchTermLower) ||
          route.path.toLowerCase().includes(searchTermLower)
        );
        
        if (filteredRoutes.length > 0) {
          filteredSubModules[subModule] = filteredRoutes;
        }
      });
      
      if (Object.keys(filteredSubModules).length > 0) {
        filtered[group] = filteredSubModules;
      }
    }
  });
  
  return filtered;
}

/**
 * กรองตามกลุ่ม
 * @param {string} groupName - ชื่อกลุ่ม
 * @param {Object} groupedPlugins - Plugins ที่จัดกลุ่มแล้ว
 * @returns {Object} - Plugins ของกลุ่มที่เลือก
 */
export function filterPluginsByGroup(groupName = 'all', groupedPlugins) {
  if (groupName === 'all') return groupedPlugins;
  
  const filtered = {};
  if (groupedPlugins[groupName]) {
    filtered[groupName] = groupedPlugins[groupName];
  }
  
  return filtered;
}

/**
 * ดึงรายชื่อกลุ่มทั้งหมด
 * @param {Object} groupedPlugins - Plugins ที่จัดกลุ่มแล้ว
 * @returns {Array} - Array ของชื่อกลุ่ม
 */
export function getAvailablePluginGroups(groupedPlugins) {
  return Object.keys(groupedPlugins);
}

/**
 * Export ข้อมูล plugin ที่จัดกลุ่มแล้วเป็น JSON
 * @param {Array} routes - Array ของ routes
 * @param {Array} plugins - Array ของ plugins
 * @returns {Object} - ข้อมูลสำหรับ export
 */
export function exportGroupedPluginData(routes, plugins) {
  const groupedRoutes = getGroupedPluginRoutes(routes);
  const groupedPlugins = getGroupedPluginNames(plugins);
  
  return {
    groupedRoutes: groupedRoutes,
    groupedPlugins: groupedPlugins,
    routeStats: calculatePluginStats(groupedRoutes),
    pluginStats: calculatePluginStats(groupedPlugins),
    summary: {
      totalRouteGroups: Object.keys(groupedRoutes).length,
      totalPluginGroups: Object.keys(groupedPlugins).length,
      availableRouteGroups: getAvailablePluginGroups(groupedRoutes),
      availablePluginGroups: getAvailablePluginGroups(groupedPlugins)
    },
    exportedAt: new Date().toISOString()
  };
}

/**
 * ตัวอย่างการใช้งาน
 * 
 * // สำหรับ routes
 * const routes = [
 *   { 
 *     name: 'origin-collection', 
 *     path: '/origin/collection',
 *     groups: 'origin',
 *     meta: { title: 'Collection', parent: 'origin', key: 'collection' }
 *   },
 *   { 
 *     name: 'lesson-course', 
 *     path: '/lesson/course',
 *     groups: 'lesson',
 *     meta: { title: 'Course', parent: 'lesson', key: 'course' }
 *   }
 * ];
 * 
 * const groupedRoutes = getGroupedPluginRoutes(routes);
 * // Result:
 * // {
 * //   origin: {
 * //     origin: [{ name: 'Collection', slug: 'origin-collection', groups: 'origin', ... }]
 * //   },
 * //   lesson: {
 * //     lesson: [{ name: 'Course', slug: 'lesson-course', groups: 'lesson', ... }]
 * //   }
 * // }
 * 
 * // สำหรับ plugins
 * const plugins = [
 *   { 
 *     name: 'origin-plugin', 
 *     groups: 'origin',
 *     meta: { title: 'Origin Plugin', parent: 'origin', key: 'plugin' }
 *   },
 *   { 
 *     name: 'lesson-plugin', 
 *     groups: 'lesson',
 *     meta: { title: 'Lesson Plugin', parent: 'lesson', key: 'plugin' }
 *   }
 * ];
 * 
 * const groupedPlugins = getGroupedPluginNames(plugins);
 * // Result:
 * // {
 * //   origin: [{ name: 'Origin Plugin', slug: 'origin-plugin', groups: 'origin', ... }],
 * //   lesson: [{ name: 'Lesson Plugin', slug: 'lesson-plugin', groups: 'lesson', ... }]
 * // }
 * 
 * // การใช้งานแบบรวม
 * const exportData = exportGroupedPluginData(routes, plugins);
 * console.log(exportData.summary);
 */
  