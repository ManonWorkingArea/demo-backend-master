

const slug  = "config";
const title = "ปรับแต่งระบบ";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "การตั้งค่าระบบหลังบ้าน",
    groups: 'system',
    default: true,
    hasSubmenu: true,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      icon: "cog",
      role: ['superadmin','admin'],
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
          title: `ตั้งค่าทั้งหมด`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
      {
        path: 'general',
        name: `${slug}-general`,
        component: () => import('./view/General.vue'),
        meta: {
          inMenu: true,
          parent: title,
          page: `${slug}/general`,
          main: title,
          title: `ตั้งค่าทั่วไป`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
      {
        path: 'category',
        name: `${slug}-category`,
        component: () => import('./view/ui/Index.vue?v=category'),
        meta: {
          inMenu: true,
          parent: title,
          callback: 'catagories',
          page: `${slug}/category`,
          path: 'category',
          main: title,
          title: `หมวดหมู่`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
      {
        path: 'category/add',
        name: `${slug}-category-add`,
        component: () => import('./view/ui/New.vue?v=category'),
        meta: {
          inMenu: false,
          parent: title,
          callback: 'catagories',
          page: `${slug}/category-add`,
          path: 'category',
          main: title,
          title: `เพิ่มหมวดหมู่`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
      {
        path: 'category/edit/:id',
        name: `${slug}-category-edit`,
        component: () => import('./view/ui/Edit.vue?v=category'),
        meta: {
          inMenu: false,
          parent: title,
          callback: 'catagories',
          page: `${slug}/category-edit`,
          path: 'category',
          main: title,
          title: `แก้ไขหมวดหมู่`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
      {
        path: 'type',
        name: `${slug}-type`,
        component: () => import('./view/ui/Index.vue?v=type'),
        meta: {
          inMenu: true,
          parent: title,
          callback: 'types',
          page: `${slug}/type`,
          path: 'type',
          main: title,
          title: `ประเภท`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
      {
        path: 'type/add',
        name: `${slug}-type-add`,
        component: () => import('./view/ui/New.vue?v=type'),
        meta: {
          inMenu: false,
          parent: title,
          callback: 'types',
          page: `${slug}/type-add`,
          path: 'type',
          main: title,
          title: `เพิ่มประเภท`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
      {
        path: 'type/edit/:id',
        name: `${slug}-type-edit`,
        component: () => import('./view/ui/Edit.vue?v=type'),
        meta: {
          inMenu: false,
          parent: title,
          callback: 'types',
          page: `${slug}/type-edit`,
          path: 'type',
          main: title,
          title: `แก้ไขประเภท`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
      {
        path: 'mode',
        name: `${slug}-mode`,
        component: () => import('./view/ui/Index.vue?v=mode'),
        meta: {
          inMenu: true,
          parent: title,
          callback: 'modes',
          page: `${slug}/mode`,
          path: 'mode',
          main: title,
          title: `วิธีการเรียน`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
      {
        path: 'mode/add',
        name: `${slug}-mode-add`,
        component: () => import('./view/ui/New.vue?v=mode'),
        meta: {
          inMenu: false,
          parent: title,
          callback: 'modes',
          page: `${slug}/mode-add`,
          path: 'mode',
          main: title,
          title: `เพิ่มวิธีการเรียน`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
      {
        path: 'mode/edit/:id',
        name: `${slug}-mode-edit`,
        component: () => import('./view/ui/Edit.vue?v=mode'),
        meta: {
          inMenu: false,
          parent: title,
          callback: 'modes',
          page: `${slug}/mode-edit`,
          path: 'mode',
          main: title,
          title: `แก้ไขวิธีการเรียน`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
      {
        path: 'display',
        name: `${slug}-display`,
        component: () => import('./view/ui/Index.vue?v=mode'),
        meta: {
          inMenu: true,
          parent: title,
          callback: 'display',
          page: `${slug}/display`,
          path: 'display',
          main: title,
          title: `วิธีการเรียน`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
      {
        path: 'tools',
        name: `${slug}-tools`,
        component: () => import('./view/ui/Index.vue?v=mode'),
        meta: {
          inMenu: true,
          parent: title,
          callback: 'tools',
          page: `${slug}/tools`,
          path: 'tools',
          main: title,
          title: `วิธีการเรียน`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
    ]
  }
]
