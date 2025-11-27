const slug  = "install";
const title = "ติดตั้งระบบ";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "ติดตั้งระบบ",
    groups: 'default',
    default: true,
    hasSubmenu: false,
    hasDashboard: false,
    meta: {
      inMenu: false,
      title: title,
      icon: "download",
      role: ['superadmin'],
    },
    children: [
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `ติดตั้งระบบ`,
          type: 'page',
          auth: false,
          icon: "download",
        }
      }
    ]
  }
]
