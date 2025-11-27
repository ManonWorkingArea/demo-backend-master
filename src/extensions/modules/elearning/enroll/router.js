const slug = "enroll";
const title = { TH: "ลงทะเบียน", EN: "Enroll" };

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "จัดการข้อมููลการลงทะเบียนของหลักสูตร",
    groups: 'academy',
    linkage: "lesson",
    counter: true,
    default: false,
    hasSubmenu: false,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'no',
    meta: {
      inMenu: true,
      title: title,
      parent: slug,
      key: 'home',
      icon: "clipboard-list",
      role: ['admin'],
    },
    children: [
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          auth: true,
          parent: slug,
          key: 'home',
          main: title,
          page: `${slug}`,
          title: `ลงทะเบียน`,
          type: 'page',
          icon: "clipboard-list",
        }
      },
      {
        path: 'new',
        name: `${slug}-new`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          auth: true,
          parent: slug,
          key: 'new',
          main: title,
          page: `${slug}`,
          title: `ลงทะเบียนใหม่`,
          type: 'page',
          icon: "plus",
        }
      }
    ]
  }
]
