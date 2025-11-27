const slug  = "debug";
const title = "debug";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/display`,
    description: "debug",
    groups: 'system',
    default: true,
    hasSubmenu: true,
    hasDashboard: false,
    meta: {
      inMenu: false,
      title: title,
      icon: "user",
      fullscreen: true,
      role: ['superadmin','admin'],
    },
    children: [
        {
          path: 'display',
          name: `${slug}-display`,
          component: () => import('./Logs.vue'),
          meta: {
            fullscreen: true,
            inMenu: false,
            parent: title,
            page: `${slug}`,
            main: title,
            title: `Console.log`,
            type: 'page',
            auth: false,
            icon: "download",
          }
        }
      ]
  }
]
