const slug  = "website";
const title = "Website Central";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "จัดการข้อมูล Website",
    groups: 'ecommerce',
    default: true,
    hasSubmenu: true,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      icon: "compass",
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
          title: `Website List`,
          type: 'page',
          auth: true,
          icon: "compass",
        }
      },
      {
        path: 'add',
        name: `${slug}-website-add`,
        component: () => import('./view/unit/Add.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/website`,
          main: title,
          title: `เพิ่ม Website`,
          type: 'page',
          auth: true,
          icon: "compass",
        }
      },
      {
        path: 'edit/:id',
        name: `${slug}-website-edit`,
        component: () => import('./view/unit/Edit.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/website`,
          main: title,
          title: `แก้ไข Website`,
          type: 'page',
          auth: true,
          icon: "compass",
        }
      },
      {
        path: 'detail/:id',
        name: `${slug}-website-detail`,
        component: () => import('./view/unit/Detail.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/website`,
          main: title,
          title: `รายละเอียด Website`,
          type: 'page',
          auth: true,
          icon: "compass",
        }
      },
      {
        path: 'menu/:id',
        name: `${slug}-website-menu`,
        component: () => import('./view/unit/Menu.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/website`,
          main: title,
          title: `ปรับแต่ง Menu`,
          type: 'page',
          auth: true,
          icon: "paint-brush",
        }
      },
      {
        path: 'design/:id',
        name: `${slug}-website-design`,
        component: () => import('./view/unit/Design.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/website`,
          main: title,
          title: `Design Website`,
          type: 'page',
          auth: true,
          icon: "paint-brush",
        }
      },
      {
        path: 'admin/:id',
        name: `${slug}-website-admin`,
        component: () => import('./view/unit/Admin.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/website`,
          main: title,
          title: `เลือก Website Admin`,
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
          title: `Website Admin`,
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
          title: `เพิ่ม Website Admin`,
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
          title: `เพิ่ม Admin to Website`,
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
          title: `แก้ไข Website Admin`,
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
          title: `รายละเอียด Website Admin`,
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
          title: `Website Config`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      }
    ]
  }
]
