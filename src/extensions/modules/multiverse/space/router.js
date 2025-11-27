const slug  = "space";
const title = "Cloud Space";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "จัดการระบบ Cloud Space และ Storage ต่างๆ",
    groups: 'origin',
    default: true,
    hasSubmenu: true,
    hasDashboard: true,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      key: 'dashboard',
      title: title,
      parent: slug,
      icon: "hdd",
      role: ['root'],
    },
    children: [
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./view/Index.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'dashboard',
          title: `${title} Dashboard`,
          type: 'page',
          auth: true,
          icon: "hdd",
          role: ['root'],
        }
      },
      {
        path: 'storage',
        name: `${slug}-storage`,
        component: () => import('./view/Index.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'storage',
          title: `Storage`,
          type: 'page',
          auth: true,
          icon: "server",
          role: ['root'],
        }
      },
      {
        path: 'storage/add',
        name: `${slug}-storage-add`,
        component: () => import('./view/Index.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'storage',
          title: `เพิ่ม Storage`,
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['root'],
        }
      },
      {
        path: 'storage/detail/:id',
        name: `${slug}-storage-detail`,
        component: () => import('./view/Index.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'storage',
          title: `รายละเอียด Storage`,
          type: 'page',
          auth: true,
          icon: "info-circle",
          role: ['root'],
        }
      },
      {
        path: 'config',
        name: `${slug}-config`,
        component: () => import('./view/Index.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'config',
          title: `Storage Config`,
          type: 'page',
          auth: true,
          icon: "cog",
          role: ['root'],
        }
      }
    ]
  }
]
