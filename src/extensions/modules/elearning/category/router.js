const slug = "category";
const title = "category";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    description: "จัดการข้อมูล Category",
    redirect: `/${slug}/dashboard`,
    groups: 'origin',
    default: true,
    hasSubmenu: false,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      parent: slug,
      key: 'home',
      main: title,
      icon: "list",
      role: ['superadmin'],
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
          title: `Category Dashboard`,
          type: 'page',
          auth: true,
          icon: "globe",
        }
      },
      {
        path: 'add',
        name: `${slug}-category-add`,
        component: () => import('./view/Add.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `เพิ่ม Category`,
          type: 'page',
          auth: true,
          icon: "globe",
        }
      },
      {
        path: 'edit/:id',
        name: `${slug}-category-edit`,
        component: () => import('./view/Edit.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `แก้ไข Category`,
          type: 'page',
          auth: true,
          icon: "globe",
        }
      }
    ]
  }
]
