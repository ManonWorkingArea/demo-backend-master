const slug  = "application";
const title = "ระบบรับรอง";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/home`,
    description: "ระบบรับรอง",
    groups: 'standard',
    linkage: "form",
    counter: false,
    default: false,
    hasSubmenu: true,
    hasDashboard: true,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      icon: "clipboard-list",
      role: ['admin','public'],
    },
    children: [
      {
        path: 'home',
        name: `${slug}-home`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          auth: false,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `การลงทะเบียน`,
          type: 'page',
          icon: "clipboard-list",
        }
      },
      {
        path: 'factory',
        name: `${slug}-factory`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `โรงงาน`,
          type: 'page',
          icon: "plus",
        }
      },
      {
        path: 'auditor',
        name: `${slug}-auditor`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `ผู้ตรวจประเมิน`,
          type: 'page',
          icon: "plus",
        }
      },
      {
        path: 'verifier',
        name: `${slug}-verifier`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `ที่ปรึกษา`,
          type: 'page',
          icon: "plus",
        }
      },
      {
        path: 'list',
        name: `${slug}-list`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `ใบสมัครทั้งหมด`,
          type: 'page',
          icon: "plus",
        }
      },
      {
        path: 'new',
        name: `${slug}-new`,
        component: () => import('./view/New.vue'),
        meta: {
          inMenu: false,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `เพิ่มใบสมัคร`,
          type: 'page',
          icon: "plus",
        }
      },{
        path: 'view/:id',
        name: `${slug}-view-application`,
        component: () => import('./view/View.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/application`,
          main: title,
          title: `รายละเอียด application`,
          type: 'page',
          auth: true,
          icon: "university",
        }
      },
      {
        path: 'edit/:id',
        name: `${slug}-edit-application`,
        component: () => import('./view/View.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/application`,
          main: title,
          title: `รายละเอียด application`,
          type: 'page',
          auth: true,
          icon: "university",
        }
      },
      {
        path: 'status/:id',
        name: `${slug}-status-application`,
        component: () => import('./view/View.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/application`,
          main: title,
          title: `status application`,
          type: 'page',
          auth: true,
          icon: "university",
        }
      },
      {
        path: 'document/:id',
        name: `${slug}-document-application`,
        component: () => import('./view/Document.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/application`,
          main: title,
          title: `document application`,
          type: 'page',
          auth: true,
          icon: "university",
        }
      },
      {
        path: 'apply/:id/:status',
        name: `${slug}-apply-application`,
        component: () => import('./view/Apply.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/application`,
          main: title,
          title: `การลงทะเบียน`,
          type: 'page',
          auth: true,
          icon: "university",
        }
      },
      {
        path: 'form/:id/:form',
        name: `${slug}-form-application`,
        component: () => import('./view/Form.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/application`,
          main: title,
          title: `แบบฟอร์ม`,
          type: 'page',
          auth: true,
          icon: "university",
        }
      },
      {
        path: 'detail/:id',
        name: `${slug}-detail-apply`,
        component: () => import('./view/Detail.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/application`,
          main: title,
          title: `ข้อมูลใบสมัคร`,
          type: 'page',
          auth: true,
          icon: "university",
        }
      },
    ]
  }
]
