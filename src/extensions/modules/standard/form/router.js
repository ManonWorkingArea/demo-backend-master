
const slug  = "form";
const title = "แบบฟอร์ม";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "จัดการข้อมูลแบบฟอร์ม",
    groups: 'standard',
    linkage: "form",
    counter: false,
    default: false,
    hasSubmenu: false,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: false,
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
          inMenu: false,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `แบบฟอร์มทั้งหมด`,
          type: 'page',
          icon: "clipboard-list",
        }
      },
      {
        path: 'new',
        name: `${slug}-new`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: false,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `เพิ่มแบบฟอร์ม`,
          type: 'page',
          icon: "plus",
        }
      }
    ]
  }
]
