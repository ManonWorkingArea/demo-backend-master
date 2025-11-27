const slug  = "test";
const title = "test";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "จัดการข้อมูลผู้เรียน",
    groups: 'default',
    default: false,
    hasSubmenu: true,
    hasDashboard: true,
    meta: {
      inMenu: true,
      title: title,
      icon: "user-graduate",
      role: ['admin'],
    },
    children: [
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `รายชื่อผู้เรียน`,
          type: 'page',
          auth: true,
          icon: "user-graduate",
        }
      }
    ]
  }
]
