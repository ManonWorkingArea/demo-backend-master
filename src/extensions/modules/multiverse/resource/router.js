const slug  = "resource";
const title = "Site Resource";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "จัดการทรัพยากรระบบ Cloud Space และ Package ต่างๆ",
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
      icon: "rocket",
      role: ['root'],
    },
    children: [
      {
        path: 'space',
        name: `${slug}-space`,
        component: () => import('./view/Space.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'space',
          title: `Cloud Space`,
          type: 'page',
          auth: true,
          icon: "server",
          role: ['root'],
        }
      },
      {
        path: 'client',
        name: `${slug}-client`,
        component: () => import('./view/Client.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'client',
          title: `Resource client`,
          type: 'page',
          auth: true,
          icon: "box-open",
          role: ['root'],
        }
      },
    ]
  }
]
