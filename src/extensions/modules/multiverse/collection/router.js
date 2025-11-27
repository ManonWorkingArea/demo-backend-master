const slug  = "collection";
const title = "ศูนย์กลางข้อมูล";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "คลังข้อมูลสำหรับจัดเก็บและจัดการข้อมูล",
    groups: 'origin',
    default: true,
    hasSubmenu: true,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      icon: "lock",
      role: ['superadmin'],
    },
    children: [
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./view/Index.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `ศูนย์กลางข้อมูล`,
          type: 'page',
          auth: true,
          icon: "lock",
        }
      }
    ]
  }
]
