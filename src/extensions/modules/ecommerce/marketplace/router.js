const slug = "marketplace";
const title = "Marketplace";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "Marketplace",
    groups: 'ecommerce',
    counter: true,
    default: false,
    hasSubmenu: true,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      icon: "store",
      role: ['admin'],
    },
    children: [
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: false,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `Marketplace`,
          type: 'page',
          icon: "store",
        }
      },
      {
        path: 'category',
        name: `${slug}-category`,
        component: () => import('./view/category/Index.vue'),
        meta: {
          inMenu: true,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `Category`,
          type: 'page',
          icon: "tags",
        }
      },
      {
        path: 'campaign',
        name: `${slug}-campaign`,
        component: () => import('./view/campaign/Index.vue'),
        meta: {
          inMenu: true,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `Campaign`,
          type: 'page',
          icon: "rocket",
        }
      },
      {
        path: 'property',
        name: `${slug}-property`,
        component: () => import('./view/property/Index.vue'),
        meta: {
          inMenu: true,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `Property`,
          type: 'page',
          icon: "building",
        }
      },
      {
        path: 'vendor',
        name: `${slug}-vendor`,
        component: () => import('./view/vendor/Index.vue'),
        meta: {
          inMenu: true,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `Vendor`,
          type: 'page',
          icon: "handshake",
        }
      },
      {
        path: 'store',
        name: `${slug}-store`,
        component: () => import('./view/store/Index.vue'),
        meta: {
          inMenu: true,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `Store`,
          type: 'page',
          icon: "cash-register",
        }
      }
    ]
  }
];
