
const slug  = "drive";
const title = "จัดการไฟล์";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    component: () => import('./component/Index.vue'),
    description: "จัดการไฟล์",
    groups: 'standard',
    linkage: "drive",
    counter: false,
    default: false,
    hasSubmenu: false,
    hasDashboard: false,
    inApp: 'no',
    inTop: 'no',
    meta: {
      inMenu: false,
      title: title,
      icon: "clipboard-list",
      role: ['public'],
    },
    children: [
      {
        path: 'public/:id/:shareKey?',
        name: `${slug}-public-share`,
        component: () => import('./component/Index.vue'),
        meta: {
          inMenu: false,
          auth: false,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `โฟลเดอร์ที่แชร์`,
          type: 'page',
          icon: "share-alt",
          fullscreen: true,
        }
      }
    ]
  }
]
