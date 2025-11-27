
const slug  = "setup";
const title = { TH: "ตั้งค่าระบบ", EN: "Setup" };

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "การตั้งค่าข้อมูลของหน่วยงาน",
    groups: 'system',
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
      
      icon: "cogs",
      role: ['root','admin'],
    },
    children: [
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'home',
          page: `${slug}`,
          main: title,
          title: `การตั้งค่า`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
      {
        path: 'workflow',
        name: `${slug}-workflow`,
        component: () => import('./view/Workflow.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'workflow',
          page: `${slug}`,
          main: title,
          title: `Flow`,
          type: 'page',
          auth: true,
          icon: "cog",
        }
      },
      {
        path: 'email',
        name: `${slug}-email-template`,
        component: () => import('./view/EmailTemplate.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'email',
          page: `${slug}`,
          main: title,
          title: `Email Template`,
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
          parent: slug,
          key: 'general',
          main: title,
          title: `ข้อมูลทั่วไป`,
          type: 'page',
          auth: true,
          icon: "cogs",
        }
      },
      {
        path: 'install',
        name: `${slug}-install`,
        component: () => import('./view/Install.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'install',
          main: title,
          title: `ข้อมูลทั่วไป`,
          type: 'page',
          auth: true,
          icon: "cogs",
        }
      },
      {
        path: 'admin',
        name: `${slug}-admin`,
        component: () => import('./view/Admin.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'admin',
          main: title,
          title: `เจ้าหน้าที่`,
          type: 'page',
          auth: true,
          icon: "user-tie",
        }
      },
      {
        path: 'payment',
        name: `${slug}-payment`,
        component: () => import('./view/Payment.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'payment',
          main: title,
          title: `การชำระเงิน`,
          type: 'page',
          auth: true,
          icon: "credit-card",
        }
      },
      {
        path: 'file',
        name: `${slug}-file`,
        component: () => import('./view/File.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'file',
          main: title,
          title: `จัดการไฟล์`,
          type: 'page',
          auth: true,
          icon: "folder",
        }
      },
      {
        path: 'language',
        name: `${slug}-language`,
        component: () => import('./view/Language.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'language',
          main: title,
          title: `ภาษา`,
          type: 'page',
          auth: true,
          icon: "flag",
        }
      },
      {
        path: 'builder',
        name: `${slug}-builder`,
        component: () => import('./view/BuillderItem.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'builder',
          main: title,
          title: `builder`,
          type: 'page',
          auth: true,
          icon: "flag",
        }
      },
      {
        path: 'gateway',
        name: `${slug}-gateway`,
        component: () => import('./view/ConnectionGateway.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'builder',
          main: title,
          title: `builder`,
          type: 'page',
          auth: true,
          icon: "flag",
        }
      },
      {
        path: 'monitor',
        name: `${slug}-monitor`,
        component: () => import('./view/Monitor.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'monitor',
          main: title,
          title: `monitor`,
          type: 'page',
          auth: true,
          icon: "flag",
        }
      },{
        path: 'cmd',
        name: `${slug}-cmd`,
        component: () => import('./view/CMD.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'cmd',
          main: title,
          title: `cmd`,
          type: 'page',
          auth: true,
          icon: "flag",
        }
      }
    ]
  }
]
