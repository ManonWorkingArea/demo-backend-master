const slug  = "institution";
const title = "Institution Central";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "จัดการข้อมูล Institution",
    groups: 'standard',
    default: true,
    hasSubmenu: true,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      icon: "university",
      role: ['superadmin'],
    },
    children: [
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./view/unit/Unit.vue'),
        meta: {
          inMenu: true,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `Institution List`,
          type: 'page',
          auth: true,
          icon: "university",
        }
      },
      {
        path: 'add',
        name: `${slug}-institution-add`,
        component: () => import('./view/unit/Add.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/institution`,
          main: title,
          title: `เพิ่ม Institution`,
          type: 'page',
          auth: true,
          icon: "globe",
        }
      },
      {
        path: 'edit/:id',
        name: `${slug}-institution-edit`,
        component: () => import('./view/unit/Edit.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/institution`,
          main: title,
          title: `แก้ไข Institution`,
          type: 'page',
          auth: true,
          icon: "university",
        }
      },
      {
        path: 'menu/:id',
        name: `${slug}-institution-menu`,
        component: () => import('./view/unit/Menu.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/institution`,
          main: title,
          title: `menu Institution`,
          type: 'page',
          auth: true,
          icon: "university",
        }
      },
      {
        path: 'detail/:id',
        name: `${slug}-school-detail`,
        component: () => import('./view/unit/Detail.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/school`,
          main: title,
          title: `รายละเอียด Institution`,
          type: 'page',
          auth: true,
          icon: "university",
        }
      },
      {
        path: 'admin/:id',
        name: `${slug}-institution-admin`,
        component: () => import('./view/unit/Admin.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/institution`,
          main: title,
          title: `เลือก Institution Admin`,
          type: 'page',
          auth: true,
          icon: "user-shield",
        }
      },
      {
        path: 'user',
        name: `${slug}-user`,
        component: () => import('./view/user/User.vue'),
        meta: {
          inMenu: true,
          parent: title,
          page: `${slug}/user`,
          main: title,
          title: `Institution Admin`,
          type: 'page',
          auth: true,
          icon: "user-shield",
        }
      },
      {
        path: 'user/add',
        name: `${slug}-user-add`,
        component: () => import('./view/user/Add.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/user`,
          main: title,
          title: `เพิ่ม Institution Admin`,
          type: 'page',
          auth: true,
          icon: "user-shield",
        }
      },
      {
        path: 'user/add/:id',
        name: `${slug}-user-add-collection`,
        component: () => import('./view/user/Add.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/user`,
          main: title,
          title: `เพิ่ม Admin to Institution`,
          type: 'page',
          auth: true,
          icon: "user-shield",
        }
      },
      {
        path: 'user/edit/:id',
        name: `${slug}-user-edit`,
        component: () => import('./view/user/Edit.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/user`,
          main: title,
          title: `แก้ไข Institution Admin`,
          type: 'page',
          auth: true,
          icon: "user-shield",
        }
      },
      {
        path: 'user/detail/:id',
        name: `${slug}-user-detail`,
        component: () => import('./view/user/Detail.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/user`,
          main: title,
          title: `รายละเอียด Institution Admin`,
          type: 'page',
          auth: true,
          icon: "user-shield",
        }
      },
      {
        path: 'config',
        name: `${slug}-config`,
        component: () => import('./view/Config.vue'),
        meta: {
          inMenu: true,
          parent: title,
          page: `${slug}/config`,
          main: title,
          title: `Institution Config`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      }
    ]
  }
]
