const slug  = "asset";
const title = "Asset Central";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    description: "จัดการข้อมูล Assets",
    redirect: `/${slug}/dashboard`,
    groups: 'origin',
    default: true,
    hasSubmenu: true,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      icon: "box",
      role: ['superadmin'],
    },
    children: [
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./view/asset/Asset.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `Assets Dashboard`,
          type: 'page',
          auth: true,
          icon: "box",
        }
      },
      {
        path: 'excel',
        name: `${slug}-excel`,
        component: () => import('./view/excel.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `Assets excel`,
          type: 'page',
          auth: true,
          icon: "globe",
        }
      },
      {
        path: 'add',
        name: `${slug}-asset-add`,
        component: () => import('./view/asset/AssetAdd.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `เพิ่ม Asset`,
          type: 'page',
          auth: true,
          icon: "box",
        }
      },
      {
        path: 'edit/:id',
        name: `${slug}-asset-edit`,
        component: () => import('./view/asset/AssetEdit.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `แก้ไข Asset`,
          type: 'page',
          auth: true,
          icon: "box",
        }
      },
      {
        path: 'detail/:id',
        name: `${slug}-asset-detail`,
        component: () => import('./view/asset/AssetDetail.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `รายละเอียด Asset`,
          type: 'page',
          auth: true,
          icon: "box",
        }
      },
      {
        path: 'admin/:id',
        name: `${slug}-asset-admin`,
        component: () => import('./view/asset/AssetAdmin.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/asset`,
          main: title,
          title: `เลือก Asset Admin`,
          type: 'page',
          auth: true,
          icon: "user-shield",
        }
      },
      {
        path: 'user',
        name: `${slug}-user`,
        component: () => import('./view/user/User.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: title,
          page: `${slug}/user`,
          main: title,
          title: `รายชื่อ Assetor`,
          type: 'page',
          auth: true,
          icon: "user-shield",
        }
      },
      {
        path: 'user/add',
        name: `${slug}-user-add`,
        component: () => import('./view/user/UserAdd.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/user`,
          main: title,
          title: `เพิ่ม Assetor`,
          type: 'page',
          auth: true,
          icon: "user-shield",
        }
      },
      {
        path: 'user/add/:id',
        name: `${slug}-user-add-collection`,
        component: () => import('./view/user/UserAdd.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/user`,
          main: title,
          title: `เพิ่ม Assetor to Asset`,
          type: 'page',
          auth: true,
          icon: "user-shield",
        }
      },
      {
        path: 'user/edit/:id',
        name: `${slug}-user-edit`,
        component: () => import('./view/user/UserEdit.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/user`,
          main: title,
          title: `แก้ไข Assetor`,
          type: 'page',
          auth: true,
          icon: "user-shield",
        }
      },
      {
        path: 'user/detail/:id',
        name: `${slug}-user-detail`,
        component: () => import('./view/user/UserDetail.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/user`,
          main: title,
          title: `รายละเอียด Assetor`,
          type: 'page',
          auth: true,
          icon: "user-shield",
        }
      },
      {
        path: 'config',
        name: `${slug}-config`,
        component: () => import('./view/Config.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: title,
          page: `${slug}/config`,
          main: title,
          title: `ตั้งค่า Collection`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      }
    ]
  }
]
