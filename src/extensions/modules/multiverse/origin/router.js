const slug  = "origin";
const title = "Origin Control";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "จัดการข้อมูล Collector และ Assets ต่างๆ",
    groups: 'origin',
    default: true,
    hasSubmenu: true,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      key: 'dashboard',
      title: title,
      parent: slug,
      icon: "warehouse",
      role: ['root'],
    },
    children: [
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./view/Index.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'dashboard',
          title: `Origin Dashboard`,
          type: 'page',
          auth: true,
          icon: "warehouse",
        }
      },
      {
        path: 'collection',
        name: `${slug}-collection`,
        component: () => import('./view/collection/Collection.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'collection',
          title: `Collection Central`,
          type: 'page',
          auth: true,
          icon: "boxes",
          role: ['root'],
        }
      },
      {
        path: 'collection/add',
        name: `${slug}-collection-add`,
        component: () => import('./view/collection/CollectionAdd.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'collection',
          title: `เพิ่ม Collection`,
          type: 'page',
          auth: true,
          icon: "boxes",
        }
      },
      {
        path: 'collection/edit/:id',
        name: `${slug}-collection-edit`,
        component: () => import('./view/collection/CollectionEdit.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'collection',
          title: `แก้ไข Collection`,
          type: 'page',
          auth: true,
          icon: "boxes",
        }
      },
      {
        path: 'collection/detail/:id',
        name: `${slug}-collection-detail`,
        component: () => import('./view/collection/CollectionDetail.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'collection',
          title: `รายละเอียด Collection`,
          type: 'page',
          auth: true,
          icon: "boxes",
        }
      },
      {
        path: 'collection/admin/:id',
        name: `${slug}-collection-admin`,
        component: () => import('./view/collection/CollectionAdmin.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'collection',
          title: `เลือก Collection Superadmin`,
          type: 'page',
          auth: true,
          icon: "user-shield",
        }
      },
      {
        path: 'package',
        name: `${slug}-package`,
        component: () => import('./view/package/Package.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'package',
          title: `Package Central`,
          type: 'page',
          auth: true,
          icon: "gift",
          role: ['root'],
        }
      },
      {
        path: 'package/add',
        name: `${slug}-package-add`,
        component: () => import('./view/package/PackageAdd.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'package',
          title: `เพิ่ม Package`,
          type: 'page',
          auth: true,
          icon: "gift",
        }
      },
      {
        path: 'package/edit/:id',
        name: `${slug}-package-edit`,
        component: () => import('./view/package/PackageEdit.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'package',
          title: `แก้ไข Package`,
          type: 'page',
          auth: true,
          icon: "gift",
        }
      },
      {
        path: 'package/detail/:id',
        name: `${slug}-package-detail`,
        component: () => import('./view/package/PackageDetail.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'package',
          title: `รายละเอียด Package`,
          type: 'page',
          auth: true,
          icon: "gift",
        }
      },
      {
        path: 'package/management/:collectionId?',
        name: `${slug}-package-management`,
        component: () => import('./view/package/PackageManagement.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'package',
          title: `Package Management`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },

      {
        path: 'unit',
        name: `${slug}-unit`,
        component: () => import('./view/unit/Index.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'unit',
          title: `unit Central`,
          type: 'page',
          auth: true,
          icon: "boxes",
        }
      },
      {
        path: 'unit/add',
        name: `${slug}-unit-add`,
        component: () => import('./view/unit/Add.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'unit',
          title: `เพิ่ม unit`,
          type: 'page',
          auth: true,
          icon: "boxes",
        }
      },
      {
        path: 'unit/edit/:id',
        name: `${slug}-unit-edit`,
        component: () => import('./view/unit/Edit.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'unit',
          title: `แก้ไข unit`,
          type: 'page',
          auth: true,
          icon: "boxes",
        }
      },
      {
        path: 'unit/detail/:id',
        name: `${slug}-unit-detail`,
        component: () => import('./view/unit/Detail.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'unit',
          title: `รายละเอียด unit`,
          type: 'page',
          auth: true,
          icon: "boxes",
        }
      },
      {
        path: 'unit/admin/:id',
        name: `${slug}-collection-admin`,
        component: () => import('./view/unit/Admin.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'unit',
          title: `เลือก unit Superadmin`,
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
          parent: slug,
          main: title,
          key: 'user',
          title: `Collector Central`,
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
          parent: slug,
          main: title,
          key: 'user',
          title: `เพิ่ม Collector`,
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
          parent: slug,
          main: title,
          key: 'user',
          title: `เพิ่ม Collector to collection`,
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
          parent: slug,
          main: title,
          key: 'user',
          title: `แก้ไข Collector`,
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
          parent: slug,
          main: title,
          key: 'user',
          title: `รายละเอียด Collector`,
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
          parent: slug,
          key: 'config',
          main: title,
          title: `Origin Config`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      }
    ]
  }
]
