const slug = "school";
const title = "school";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "จัดการข้อมูล School",
    groups: 'origin',
    default: true,
    hasSubmenu: true,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      parent: slug,
      key: 'home',
      main: title,
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
          title: title,
          key: 'dashboard',
          type: 'page',
          auth: true,
          icon: "university",
        }
      },
      {
        path: 'add',
        name: `${slug}-school-add`,
        component: () => import('./view/unit/Add.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/school`,
          main: title,
          title: `เพิ่ม School`,
          type: 'page',
          auth: true,
          icon: "globe",
        }
      },
      {
        path: 'wizard',
        name: `${slug}-school-wizard`,
        component: () => import('./view/unit/Wizard.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/school`,
          main: title,
          title: `เพิ่ม School (Wizard)`,
          type: 'page',
          auth: true,
          icon: "globe",
        }
      },
      {
        path: 'edit/:id',
        name: `${slug}-school-edit`,
        component: () => import('./view/unit/Edit.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/school`,
          main: title,
          title: `แก้ไข School`,
          type: 'page',
          auth: true,
          icon: "university",
        }
      },
      {
        path: 'menu/:id',
        name: `${slug}-school-menu`,
        component: () => import('./view/unit/Menu.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/school`,
          main: title,
          title: `menu School`,
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
          title: `รายละเอียด School`,
          type: 'page',
          auth: true,
          icon: "university",
        }
      },
      {
        path: 'admin/:id',
        name: `${slug}-school-admin`,
        component: () => import('./view/unit/Admin.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/school`,
          main: title,
          title: `เลือก School Admin`,
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
          key: 'user',
          title: 'user',
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
          title: `เพิ่ม School Admin`,
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
          title: `เพิ่ม Admin to School`,
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
          title: `แก้ไข School Admin`,
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
          title: `รายละเอียด School Admin`,
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
          key: 'config',
          title: 'config',
          type: 'page',
          auth: true,
          icon: "cog",
        }
      }
    ]
  }
]
