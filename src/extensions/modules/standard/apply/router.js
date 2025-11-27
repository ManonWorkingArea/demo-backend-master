
const slug  = "apply";
const title = "การสมัคร";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "จัดการข้อมูลใบสมัคร",
    groups: 'standard',
    linkage: "form",
    counter: true,
    default: false,
    hasSubmenu: false,
    hasDashboard: true,
    inApp: 'yes',
    inTop: 'no',
    meta: {
      inMenu: true,
      title: title,
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
          parent: title,
          main: title,
          page: `${slug}`,
          title: `ใบสมัครทั้งหมด`,
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
          parent: title,
          main: title,
          page: `${slug}`,
          title: `เพิ่มใบสมัคร`,
          type: 'page',
          icon: "plus",
        }
      }
    ]
  }
]
