import { createRouter, createWebHistory } from 'vue-router';
import pluginRoutes from '../extensions/loader';
import storageManager from '@/plugins/storage';
import { translate } from '@/plugins/language.js';

// Initialize empty routes array
const routes = [];

// Cache for frequently accessed data
let configCache = null;
let sessionCache = null;
let routerPermissionsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 5 seconds cache
const ROUTER_PERMISSIONS_CACHE_KEY = 'router_permissions_cache';
const ROUTER_PERMISSIONS_TIMESTAMP_KEY = 'router_permissions_timestamp';
const ROUTER_PERMISSIONS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Helper function to get cached storage data
function getCachedStorageData() {
  const now = Date.now();
  if (!configCache || !sessionCache || (now - cacheTimestamp) > CACHE_DURATION) {
    configCache = storageManager.get('configs') || {};
    sessionCache = storageManager.get('session') || {};
    cacheTimestamp = now;
  }
  return { configs: configCache, session: sessionCache };
}

// Helper function to get cached router permissions
function getCachedRouterPermissions() {
  const now = Date.now();
  const cachedTimestamp = storageManager.get(ROUTER_PERMISSIONS_TIMESTAMP_KEY) || 0;
  
  if (!routerPermissionsCache || (now - cachedTimestamp) > ROUTER_PERMISSIONS_CACHE_DURATION) {
    routerPermissionsCache = storageManager.get(ROUTER_PERMISSIONS_CACHE_KEY) || null;
  }
  
  return routerPermissionsCache;
}

// Function to load router permissions from API
async function loadRouterPermissionsFromAPI() {
  try {
    const configs = storageManager.get('configs') || {};
    const clientTokenKey = configs.key;
    
    if (!clientTokenKey) {
      return null;
    }
    
    const response = await fetch("https://gateway.cloudrestfulapi.com/api/router_permission", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'client-token-key': clientTokenKey
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      
      // Handle both array and object responses
      let permissionData = null;
      if (Array.isArray(result) && result.length > 0) {
        permissionData = result[0];
      } else if (result && typeof result === 'object' && !Array.isArray(result)) {
        permissionData = result;
      }
      
      if (permissionData && permissionData.overrides && permissionData.overrides.length > 0) {
        // Cache the permissions data
        storageManager.set(ROUTER_PERMISSIONS_CACHE_KEY, permissionData);
        storageManager.set(ROUTER_PERMISSIONS_TIMESTAMP_KEY, Date.now());
        routerPermissionsCache = permissionData;
        
        return permissionData;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

// Function to apply router permissions to routes
function applyRouterPermissions(routePermissions) {
  if (!routePermissions || !routePermissions.overrides) {
    return;
  }
  
  routePermissions.overrides.forEach(override => {
    try {
      // Find the route by matching path patterns
      const targetRoute = findRouteByPath(override.routePath, override.childPath);
      
      if (targetRoute) {
        // Apply overrides to the route
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
      }
    } catch (error) {
      // Silent error handling
    }
  });
}

// Helper function to find route by path
function findRouteByPath(routePath, childPath = null) {
  const allRoutes = router.getRoutes();
  
  for (const route of allRoutes) {
    if (route.path === routePath) {
      if (!childPath) {
        return route;
      } else {
        // Look for child route
        if (route.children) {
          const childRoute = route.children.find(child => child.path === childPath);
          if (childRoute) {
            return childRoute;
          }
        }
      }
    }
  }
  
  return null;
}

// Function to initialize router with permissions
async function initializeRouterWithPermissions() {
  try {
    // First, try to get cached permissions
    let routerPermissions = getCachedRouterPermissions();
    
    if (!routerPermissions) {
      // If no cache, load from API
      routerPermissions = await loadRouterPermissionsFromAPI();
    } else {
      // Load fresh data in background (non-blocking)
      setTimeout(async () => {
        const freshPermissions = await loadRouterPermissionsFromAPI();
        if (freshPermissions) {
          // Apply fresh permissions if different
          const currentChecksum = routerPermissions?.masterConfigChecksum;
          const freshChecksum = freshPermissions?.masterConfigChecksum;
          
          if (currentChecksum !== freshChecksum) {
            applyRouterPermissions(freshPermissions);
          }
        }
      }, 1000); // Delay 1 second to not block initial load
    }
    
    // Apply permissions if available
    if (routerPermissions) {
      applyRouterPermissions(routerPermissions);
    }
    
  } catch (error) {
    // Silent error handling
  }
}

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Improved scroll behavior with smooth scrolling
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    } else {
      const appElement = document.getElementById('app');
      if (appElement) {
        appElement.scrollIntoView({ behavior: 'smooth' });
      }
      return { top: 0, behavior: 'smooth' };
    }
  },
});

// Optimized plugin route addition with translation enhancement
if (pluginRoutes && Array.isArray(pluginRoutes)) {
  pluginRoutes.forEach((route) => {
    if (route && typeof route === 'object') {
      // เพิ่มการแปลภาษาลงใน route object
      enhanceRouteWithTranslation(route);
      
      // ตรวจสอบว่า route ได้รับค่าถูกต้องหรือไม่
      if (route.meta?.parent && route.meta?.key) {
        if (!route.lang || !route.translatedTitle) {
          // Force set values if enhancement failed
          route.lang = `router-${route.meta.parent}-${route.meta.key}`;
          route.translatedTitle = route.meta.translatedTitle || route.meta.title;
        }
      }
      
      router.addRoute(route);
    }
  });
}

// Helper function to enhance route with translation
function enhanceRouteWithTranslation(route) {
  // เพิ่ม lang key และ translatedTitle สำหรับ main route
  if (route.meta?.parent && route.meta?.key) {
    const langKey = `router-${route.meta.parent}-${route.meta.key}`;
    const translatedTitle = translate(langKey);
    
    route.lang = langKey;
    // ถ้าแปลได้ ใช้การแปล ถ้าไม่ได้ ใช้ title เดิม
    if (translatedTitle !== langKey) {
      route.translatedTitle = translatedTitle;
    } else {
      // ถ้า meta.title เป็น object ให้แปลงเป็น string
      if (typeof route.meta.title === 'object') {
        const currentLang = localStorage.getItem('available') || 'TH';
        route.translatedTitle = route.meta.title[currentLang] || route.meta.title.TH || route.meta.title.EN || Object.values(route.meta.title)[0];
      } else {
        route.translatedTitle = route.meta.title;
      }
    }
    
    // เพิ่มลงใน meta ด้วยเพื่อให้เข้าถึงได้ง่าย
    route.meta.lang = langKey;
    route.meta.translatedTitle = route.translatedTitle;
  } else {
    // ถ้าไม่มี parent และ key ให้ใส่ค่า default
    route.lang = null;
    route.translatedTitle = route.meta?.title || route.name || 'Undefined';
  }
  
  // เก็บ plugin properties ที่สำคัญ (เพิ่มใหม่)
  if (route.hasDashboard !== undefined) route.meta.hasDashboard = route.hasDashboard;
  if (route.hasSubmenu !== undefined) route.meta.hasSubmenu = route.hasSubmenu;
  if (route.default !== undefined) route.meta.default = route.default;
  if (route.groups !== undefined) route.meta.groups = route.groups;
  if (route.description !== undefined) route.meta.description = route.description;
  if (route.inApp !== undefined) route.meta.inApp = route.inApp;
  if (route.inTop !== undefined) route.meta.inTop = route.inTop;
  if (route.icon !== undefined) route.meta.icon = route.icon;
  
  // เพิ่มการแปลภาษาสำหรับ children routes แบบ recursive
  if (route.children && Array.isArray(route.children)) {
    route.children.forEach(child => {
      if (child.meta?.parent && child.meta?.key) {
        const childLangKey = `router-${child.meta.parent}-${child.meta.key}`;
        const childTranslatedTitle = translate(childLangKey);
        
        child.lang = childLangKey;
        // ถ้าแปลได้ ใช้การแปล ถ้าไม่ได้ ใช้ title เดิม
        if (childTranslatedTitle !== childLangKey) {
          child.translatedTitle = childTranslatedTitle;
        } else {
          // ถ้า meta.title เป็น object ให้แปลงเป็น string
          if (typeof child.meta.title === 'object') {
            const currentLang = localStorage.getItem('available') || 'TH';
            child.translatedTitle = child.meta.title[currentLang] || child.meta.title.TH || child.meta.title.EN || Object.values(child.meta.title)[0];
          } else {
            child.translatedTitle = child.meta.title;
          }
        }
        
        // เพิ่มลงใน meta ด้วย
        child.meta.lang = childLangKey;
        child.meta.translatedTitle = child.translatedTitle;
        
        // เพิ่มในระดับ root ด้วย (สำคัญมาก!)
        child.lang = childLangKey;
        
        // เก็บ plugin properties สำหรับ child routes (เพิ่มใหม่)
        if (child.hasDashboard !== undefined) child.meta.hasDashboard = child.hasDashboard;
        if (child.hasSubmenu !== undefined) child.meta.hasSubmenu = child.hasSubmenu;
        if (child.default !== undefined) child.meta.default = child.default;
        if (child.groups !== undefined) child.meta.groups = child.groups;
        if (child.description !== undefined) child.meta.description = child.description;
        if (child.inApp !== undefined) child.meta.inApp = child.inApp;
        if (child.inTop !== undefined) child.meta.inTop = child.inTop;
        if (child.icon !== undefined) child.meta.icon = child.icon;
      }
      
      // ตรวจสอบว่า child route ได้รับค่าถูกต้องหรือไม่
      if (child.meta?.parent && child.meta?.key) {
        if (!child.lang || !child.translatedTitle) {
          // Force set values if enhancement failed
          const forceLang = `router-${child.meta.parent}-${child.meta.key}`;
          const forceTitle = child.meta.translatedTitle || child.meta.title;
          
          // Set ในระดับ root
          child.lang = forceLang;
          child.translatedTitle = forceTitle;
          
          // Set ใน meta ด้วย
          child.meta.lang = forceLang;
          child.meta.translatedTitle = forceTitle;
        }
      }
      
      // Recursive สำหรับ nested children
      if (child.children && Array.isArray(child.children)) {
        enhanceRouteWithTranslation(child);
      }
    });
  }
}

// Initialize router with permissions after routes are added
initializeRouterWithPermissions();

router.beforeEach((to, from, next) => {
  try {
    // Prevent infinite redirection
    if (from.path === to.path) {
      next();
      return;
    }

    // Use cached storage data for better performance
    const { configs, session } = getCachedStorageData();
    
    // Extract session data
    const userRole = session.role;
    const userUI = session.interface;
    const isAuthenticated = session.login;
    
    // Extract route meta data with safe access
    const routeRole = to.meta?.role;
    const requiresAuth = to.matched.some(record => record.meta?.auth === true);
    const isAuthOptional = to.meta?.auth === false;
    
    // Plugin validation
    const activePlugins = configs.plugins || [];
    const isRoleValid = !routeRole || (Array.isArray(routeRole) ? routeRole.includes(userRole) : routeRole === userRole);
    
    // Optimized plugin route check
    const routeName = to.name?.toLowerCase();
    const isPluginRoute = routeName ? activePlugins.some(plugin => 
      routeName.startsWith(plugin.toLowerCase())
    ) : false;

    // Translation logic with safe meta access
    if (to.meta?.parent && to.meta?.key) {
      const langKey = `router-${to.meta.parent}-${to.meta.key}`;
      const translatedTitle = translate(langKey);
      
      to.translate = translatedTitle;
      to.lang = langKey;
      
      // ถ้าแปลได้ ใช้การแปล ถ้าไม่ได้ ใช้ title เดิม
      if (translatedTitle !== langKey) {
        to.translatedTitle = translatedTitle;
      } else {
        // ถ้า meta.title เป็น object ให้แปลงเป็น string
        if (typeof to.meta.title === 'object') {
          const currentLang = localStorage.getItem('available') || 'TH';
          to.translatedTitle = to.meta.title[currentLang] || to.meta.title.TH || to.meta.title.EN || Object.values(to.meta.title)[0];
        } else {
          to.translatedTitle = to.meta.title;
        }
      }
    }

    // Update document title and meta tags based on translation system
    updateDocumentTitle(to);
    updateDocumentMeta(to);

    // Improved routing logic with clearer conditions and infinite loop prevention
    if (requiresAuth && !isAuthenticated) {
      // Prevent redirecting to the same path
      if (to.path !== '/') {
        return next('/');
      } else {
        // If already at home and not authenticated, allow it (might be login page)
        return next();
      }
    } 
    
    if (isPluginRoute && configs.siteType !== 'unit' && !isAuthenticated && to.name !== 'member-login' && !isAuthOptional) {
      const redirectPath = requiresAuth ? '/member/login' : '/';
      // Prevent redirecting to the same path
      if (to.path !== redirectPath) {
        return next(redirectPath);
      } else {
        return next();
      }
    } 
    
    if (isPluginRoute && (
      (userUI === 'backend' && isRoleValid) || 
      isAuthOptional || 
      isAuthenticated
    )) {
      return next();
    } 
    
    if (!isPluginRoute && (!requiresAuth || isAuthenticated)) {
      return next();
    } 
    
    // Final fallback
    // Prevent redirecting to the same path
    if (to.path !== '/') {
      return next('/');
    } else {
      // If already at home, allow it to prevent infinite loop
      return next();
    }
    
  } catch (error) {
    // Fallback to allow navigation in case of errors
    return next();
  }
});

// Helper function to update document title based on translation system
function updateDocumentTitle(to) {
  try {
    let pageTitle = '';
    
    // ลำดับการหาชื่อหน้า
    // 1. ลองใช้ระบบแปลภาษาก่อน
    if (to.meta?.parent && to.meta?.key) {
      const translationKey = `router-${to.meta.parent}-${to.meta.key}`;
      const translatedTitle = translate(translationKey);
      
      // ถ้าแปลได้ (ไม่ใช่ key เดิม) ให้ใช้
      if (translatedTitle && translatedTitle !== translationKey) {
        pageTitle = translatedTitle;
      }
    }
    
    // 2. ถ้าไม่มีการแปล ใช้ title จาก meta
    if (!pageTitle && to.meta?.title) {
      if (typeof to.meta.title === 'object') {
        // ถ้าเป็น object ให้ใช้ภาษาปัจจุบัน
        const currentLang = storageManager.get('available') || 'th';
        pageTitle = to.meta.title[currentLang] || to.meta.title.th || to.meta.title.en || Object.values(to.meta.title)[0];
      } else {
        pageTitle = to.meta.title;
      }
    }
    
    // 3. ถ้ายังไม่มี ใช้ชื่อ route
    if (!pageTitle && to.name) {
      pageTitle = to.name;
    }
    
    // 4. เพิ่มชื่อเว็บไซต์ท้าย title
    if (pageTitle) {
      const configs = storageManager.get('configs') || {};
      const siteName = configs.siteName || 'Website';
      document.title = `${pageTitle} | ${siteName}`;
    }
    
  } catch (error) {
    // Fallback ถ้าเกิดข้อผิดพลาด
    if (to.meta?.title) {
      document.title = typeof to.meta.title === 'string' ? to.meta.title : 'Page';
    }
  }
}

// Helper function to update document meta tags based on translation system
function updateDocumentMeta(to) {
  try {
    // ลบ meta tags เก่าที่ควบคุมโดย router
    const existingTags = document.querySelectorAll('[data-vue-router-controlled]');
    existingTags.forEach(el => el.parentNode?.removeChild(el));

    // สร้าง meta tags ใหม่
    const fragment = document.createDocumentFragment();
    
    // Meta description
    let description = '';
    if (to.meta?.parent && to.meta?.key) {
      const descriptionKey = `router-${to.meta.parent}-${to.meta.key}-description`;
      const translatedDescription = translate(descriptionKey);
      if (translatedDescription && translatedDescription !== descriptionKey) {
        description = translatedDescription;
      }
    }
    
    if (!description && to.meta?.description) {
      if (typeof to.meta.description === 'object') {
        const currentLang = storageManager.get('available') || 'th';
        description = to.meta.description[currentLang] || to.meta.description.th || to.meta.description.en || Object.values(to.meta.description)[0];
      } else {
        description = to.meta.description;
      }
    }
    
    if (description) {
      const metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      metaDescription.setAttribute('data-vue-router-controlled', '');
      fragment.appendChild(metaDescription);
    }
    
    // Meta keywords
    let keywords = '';
    if (to.meta?.parent && to.meta?.key) {
      const keywordsKey = `router-${to.meta.parent}-${to.meta.key}-keywords`;
      const translatedKeywords = translate(keywordsKey);
      if (translatedKeywords && translatedKeywords !== keywordsKey) {
        keywords = translatedKeywords;
      }
    }
    
    if (!keywords && to.meta?.keywords) {
      if (typeof to.meta.keywords === 'object') {
        const currentLang = storageManager.get('available') || 'th';
        keywords = to.meta.keywords[currentLang] || to.meta.keywords.th || to.meta.keywords.en || Object.values(to.meta.keywords)[0];
      } else {
        keywords = to.meta.keywords;
      }
    }
    
    if (keywords) {
      const metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      metaKeywords.setAttribute('content', keywords);
      metaKeywords.setAttribute('data-vue-router-controlled', '');
      fragment.appendChild(metaKeywords);
    }
    
    // เพิ่ม meta tags อื่นๆ ถ้ามี
    if (to.meta?.metaTags && Array.isArray(to.meta.metaTags)) {
      to.meta.metaTags.forEach(tagDef => {
        const tag = document.createElement('meta');
        Object.entries(tagDef).forEach(([key, value]) => {
          tag.setAttribute(key, value);
        });
        tag.setAttribute('data-vue-router-controlled', '');
        fragment.appendChild(tag);
      });
    }
    
    // เพิ่ม meta tags ลงใน document head
    if (fragment.children.length > 0) {
      document.head.appendChild(fragment);
    }
    
  } catch (error) {
    // Silent error handling
  }
}
export default router;
