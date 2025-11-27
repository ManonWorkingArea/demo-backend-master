
const slug  = "support";
const title = { TH: "support", EN: "support" };

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/home`,
    description: "support",
    groups: 'system',
    counter: true,
    default: false,
    hasSubmenu: true,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,

      parent: slug,
      key: 'home',
      main: title,
      
      icon: "headset",
      role: ['admin'],
    },
    children: [
      {
        path: 'home',
        name: `${slug}-home`,
        component: () => import('./view/Support.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'home',
          page: `${slug}`,
          main: title,
          title: `Live Support`,
          type: 'page',
          auth: true,
          icon: "headset",
        }
      },
      {
        path: 'flow',
        name: `${slug}-flow`,
        component: () => import('./view/Flow.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'flow',
          page: `${slug}`,
          main: title,
          title: `flow`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
    ]
  }
]
