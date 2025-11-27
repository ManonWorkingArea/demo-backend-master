const slug = "vote";
const title = "vote";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    description: "จัดการข้อมูล Event",
    redirect: `/${slug}/event`,
    groups: 'event',
    default: true,
    hasSubmenu: true,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'no',
    meta: {
      inMenu: true,
      title: title,
      parent: slug,
      key: 'home',
      main: title,
      icon: "list",
      role: ['superadmin','admin'],
    },
    children: [
      {
        path: 'event',
        name: `${slug}-event`,
        component: () => import('./view/Event.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'event',
          title: 'event',
          type: 'page',
          auth: true,
          icon: "archive",
          role: ['admin'],
        }
      },
      {
        path: 'event/:id',
        name: `${slug}-event-detail`,
        component: () => import('./view/EventDetail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'event',
          title: 'event',
          type: 'page',
          auth: true,
          icon: "archive",
          role: ['admin'],
        }
      },
      {
        path: 'package',
        name: `${slug}-package`,
        component: () => import('./view/Package.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'package',
          title: 'package',
          type: 'page',
          auth: true,
          icon: "archive",
          role: ['admin'],
        }
      },
      {
        path: 'influencer',
        name: `${slug}-influencer`,
        component: () => import('./view/Influencer.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'influencer',
          title: 'influencer',
          type: 'page',
          auth: true,
          icon: "archive",
          role: ['admin'],
        }
      },
      {
        path: 'gift',
        name: `${slug}-gift`,
        component: () => import('./view/Gift.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'gift',
          title: 'gift',
          type: 'page',
          auth: true,
          icon: "archive",
          role: ['admin'],
        }
      },
    ]
  }
]
