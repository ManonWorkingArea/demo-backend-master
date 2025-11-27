const slug = "bqclp_website";
const title = "BQCLP's LIMs Website";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "การจัดการเนื้อหาเว็บไซต์",
    groups: 'extra',
    default: false,
    hasSubmenu: false,
    hasDashboard: true,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      icon: "newspaper",
      role: ['superadmin'],
    },
    children: [
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./view/unit/Unit.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `Website List`,
          type: 'page',
          auth: true,
          icon: "university",
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
          title: `เพิ่ม website`,
          type: 'page',
          auth: true,
          icon: "globe",
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
          title: `แก้ไข website`,
          type: 'page',
          auth: true,
          icon: "university",
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
          title: `รายละเอียด website`,
          type: 'page',
          auth: true,
          icon: "university",
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
          title: `เลือก website Admin`,
          type: 'page',
          auth: true,
          icon: "user-shield",
        }
      },
    ]
  }
];
