const slug = "dummy";
const title = "Dummy";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "Template module สำหรับการพัฒนาโมดูลใหม่ด้วย Tailwind CSS",
    groups: 'erp',
    default: false,
    hasSubmenu: false,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      parent: slug,
      key: 'dashboard',
      main: title,
      icon: "cube",
      role: ['admin', 'manager', 'user'],
    },
    children: [
      // === DASHBOARD ===
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./components/dashboard/index.vue'),
        meta: {
          inMenu: true,
          inFront: true,
          parent: slug,
          main: title,
          key: 'dashboard',
          title: "Dashboard",
          type: 'page',
          auth: true,
          icon: "th",
          role: ['admin', 'manager', 'user'],
        }
      },
      {
        path: 'overview',
        name: `${slug}-overview`,
        component: () => import('./components/DummyDashboard.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'overview',
          title: "Overview",
          type: 'page',
          auth: true,
          icon: "chart-line",
          role: ['admin', 'manager', 'user'],
        }
      },

      // === ITEMS MANAGEMENT ===
      {
        path: 'items',
        name: `${slug}-items`,
        component: () => import('./components/DummyItemsManager.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'items',
          title: "Items Management",
          type: 'page',
          auth: true,
          icon: "list",
          role: ['admin', 'manager', 'user'],
        }
      },
      {
        path: 'datatable',
        name: `${slug}-datatable`,
        component: () => import('./components/DummyDataTable.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'datatable',
          title: "Data Table Template",
          type: 'page',
          auth: true,
          icon: "table",
          role: ['admin', 'manager', 'user'],
        }
      },
      {
        path: 'templates',
        name: `${slug}-templates`,
        component: () => import('./components/DummyTemplateGallery.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'templates',
          title: "Layout Templates",
          type: 'page',
          auth: true,
          icon: "th-large",
          role: ['admin', 'manager', 'user'],
        }
      },
      {
        path: 'templates/fullwidth',
        name: `${slug}-templates-fullwidth`,
        component: () => import('./components/DummyFullwidthTemplate.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'templates-fullwidth',
          title: "Fullwidth Layout",
          type: 'page',
          auth: true,
          icon: "arrows-alt",
          role: ['admin', 'manager', 'user'],
        }
      },
      {
        path: 'templates/left-sidebar',
        name: `${slug}-templates-left-sidebar`,
        component: () => import('./components/DummyLeftSidebarTemplate.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'templates-left-sidebar',
          title: "Left Sidebar",
          type: 'page',
          auth: true,
          icon: "border-left",
          role: ['admin', 'manager', 'user'],
        }
      },
      {
        path: 'templates/right-sidebar',
        name: `${slug}-templates-right-sidebar`,
        component: () => import('./components/DummyRightSidebarTemplate.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'templates-right-sidebar',
          title: "Right Sidebar",
          type: 'page',
          auth: true,
          icon: "border-right",
          role: ['admin', 'manager', 'user'],
        }
      },
      {
        path: 'templates/three-column',
        name: `${slug}-templates-three-column`,
        component: () => import('./components/DummyThreeColumnTemplate.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'templates-three-column',
          title: "Three Column",
          type: 'page',
          auth: true,
          icon: "columns",
          role: ['admin', 'manager', 'user'],
        }
      },
      {
        path: 'elements',
        name: `${slug}-elements`,
        component: () => import('./components/DummyUIElements.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'elements',
          title: "UI Elements",
          type: 'page',
          auth: true,
          icon: "palette",
          role: ['admin', 'manager', 'user'],
        }
      },
      {
        path: 'items/new',
        name: `${slug}-item-new`,
        component: () => import('./components/DummyItemAdd.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'item-new',
          title: "เพิ่ม Item ใหม่",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager'],
        }
      },
      {
        path: 'items/create',
        name: `${slug}-item-create`,
        component: () => import('./components/DummyItemAdd.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'item-create',
          title: "สร้าง Item",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager'],
        }
      },
      {
        path: 'items/:id',
        name: `${slug}-item-detail`,
        component: () => import('./components/DummyItemDetail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'item-detail',
          title: "Item Details",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'user'],
        }
      },
      {
        path: 'reports',
        name: `${slug}-reports`,
        component: () => import('./components/DummyReports.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'reports',
          title: "Reports & Analytics",
          type: 'page',
          auth: true,
          icon: "chart-bar",
          role: ['admin', 'manager'],
        }
      },

      // === SETTINGS ===
      {
        path: 'settings',
        name: `${slug}-settings`,
        component: () => import('./components/DummySettings.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'settings',
          title: "Settings",
          type: 'page',
          auth: true,
          icon: "cog",
          role: ['admin'],
        }
      }
    ]
  }
]