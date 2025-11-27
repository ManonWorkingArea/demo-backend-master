const slug  = "ai";
const title = { TH: "AI Assistant", EN: "AI Assistant" };

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/chat`,
    description: "AI Assistant สำหรับการสนทนาและจัดการข้อมูล",
    groups: 'default',
    default: false,
    counter: true,
    hasSubmenu: false,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'no',
    meta: {
      inMenu: true,
      title: title,
      parent: slug,
      key: 'home',
      icon: "robot",
      role: ['admin','public'],
    },
    children: [
      {
        path: 'chat',
        name: `${slug}-chat`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'chat',
          page: `${slug}`,
          main: title,
          title: `แชทกับ AI`,
          type: 'page',
          auth: true,
          icon: "comments",
        }
      },
      {
        path: 'agent',
        name: `${slug}-agent`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'agent',
          page: `${slug}/agent`,
          main: title,
          title: `AI Agent`,
          type: 'page',
          auth: true,
          icon: "user-robot",
        }
      },
      {
        path: 'datasource',
        name: `${slug}-datasource`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'datasource',
          page: `${slug}/datasource`,
          main: title,
          title: `จัดการข้อมูล`,
          type: 'page',
          auth: true,
          icon: "database",
        }
      },
      {
        path: 'datasource/create',
        name: `${slug}-datasource-create`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          key: 'datasource-create',
          page: `${slug}/datasource/create`,
          main: title,
          title: `สร้างข้อมูลใหม่`,
          type: 'page',
          auth: true,
          icon: "plus-circle",
        }
      },
      {
        path: 'datasource/edit/:id',
        name: `${slug}-datasource-edit`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          key: 'datasource-edit',
          page: `${slug}/datasource/edit`,
          main: title,
          title: `แก้ไขข้อมูล`,
          type: 'page',
          auth: true,
          icon: "edit",
        }
      },
      {
        path: 'knowledge-base',
        name: `${slug}-knowledge-base`,
        component: () => import('./view/KnowledgeBase.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'knowledge-base',
          page: `${slug}/knowledge-base`,
          main: title,
          title: `ฐานความรู้`,
          type: 'page',
          auth: true,
          icon: "book",
        }
      },
      {
        path: 'knowledge-base/categories',
        name: `${slug}-knowledge-categories`,
        component: () => import('./view/KnowledgeCategories.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          key: 'knowledge-categories',
          page: `${slug}/knowledge-base/categories`,
          main: title,
          title: `จัดหมวดหมู่ความรู้`,
          type: 'page',
          auth: true,
          icon: "folder-tree",
        }
      },
      {
        path: 'knowledge-base/library',
        name: `${slug}-knowledge-library`,
        component: () => import('./view/KnowledgeLibrary.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          key: 'knowledge-library',
          page: `${slug}/knowledge-base/library`,
          main: title,
          title: `คลังเอกสาร`,
          type: 'page',
          auth: true,
          icon: "books",
        }
      },
      {
        path: 'knowledge-base/upload',
        name: `${slug}-knowledge-upload`,
        component: () => import('./view/KnowledgeUpload.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          key: 'knowledge-upload',
          page: `${slug}/knowledge-base/upload`,
          main: title,
          title: `อัพโหลดเอกสาร`,
          type: 'page',
          auth: true,
          icon: "cloud-upload-alt",
        }
      },
      {
        path: 'knowledge-base/review',
        name: `${slug}-knowledge-review`,
        component: () => import('./view/KnowledgeReview.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          key: 'knowledge-review',
          page: `${slug}/knowledge-base/review`,
          main: title,
          title: `ตรวจสอบและปรับปรุง`,
          type: 'page',
          auth: true,
          icon: "clipboard-check",
        }
      },
      {
        path: 'knowledge-base/analytics',
        name: `${slug}-knowledge-analytics`,
        component: () => import('./view/KnowledgeAnalytics.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          key: 'knowledge-analytics',
          page: `${slug}/knowledge-base/analytics`,
          main: title,
          title: `วิเคราะห์การใช้งาน`,
          type: 'page',
          auth: true,
          icon: "chart-line",
        }
      },
      {
        path: 'history',
        name: `${slug}-history`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'history',
          page: `${slug}/history`,
          main: title,
          title: `ประวัติการสนทนา`,
          type: 'page',
          auth: true,
          icon: "history",
        }
      },
      {
        path: 'settings',
        name: `${slug}-settings`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'settings',
          page: `${slug}/settings`,
          main: title,
          title: `ตั้งค่า AI`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      }
    ]
  }
]
