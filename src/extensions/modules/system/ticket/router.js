
const slug  = "ticket";
const title = { TH: "ticket", EN: "ticket" };

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/home`,
    description: "ticket",
    groups: 'system',
    counter: true,
    default: false,
    hasSubmenu: true,
    hasDashboard: true,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,

      parent: slug,
      key: 'home',
      main: title,
      
      icon: "clipboard-list",
      role: ['admin'],
    },
    children: [
      {
        path: 'home',
        name: `${slug}-home`,
        component: () => import('./view/Ticket.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'home',
          page: `${slug}`,
          main: title,
          title: `ticket`,
          type: 'page',
          auth: true,
          icon: "clipboard-list",
        }
      }
    ]
  }
]
