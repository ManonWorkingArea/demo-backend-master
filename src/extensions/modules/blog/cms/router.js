const slug = "cms";
const title = { TH: "เนื้อหา", EN: "CMS" };

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "การจัดการเนื้อหาเว็บไซต์",
    groups: 'blog',
    default: false,
    hasSubmenu: true,
    hasDashboard: true,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,

      parent: slug,
      key: 'home',
      main: title,
      
      icon: "newspaper",
      role: ['admin', 'public'],
    },
    children: [
      {
        path: 'pages',
        name: `${slug}-all`,
        component: () => import('./view/All.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'home',
          main: title,
          title: `หน้าเว็บ`,
          type: 'page',
          auth: true,
          icon: "file-alt",
        }
      },
      {
        path: 'pages/:id',
        name: `${slug}-posts`,
        component: () => import('./view/All.vue'),
        props: true,
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: `บทความ`,
          type: 'page',
          auth: false,
          icon: "files",
        }
      },
      {
        path: 'customize',
        name: `${slug}-customize`,
        component: () => import('./view/Customize.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'customize',
          main: title,
          title: `ตั้งค่าการแสดงผล`,
          type: 'page',
          auth: true,
          icon: "palette",
        }
      },
      {
        path: 'add',
        name: `${slug}-add`,
        component: () => import('./view/Add.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          key: 'add',
          main: title,
          title: `เพิ่มหน้าใหม่`,
          type: 'page',
          auth: true,
          icon: "plus",
        }
      },
      {
        path: 'edit/:id',
        name: `${slug}-edit`,
        component: () => import('./view/Edit.vue'),
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: `แก้ไข`,
          type: 'page',
          auth: true,
          icon: "pencil",
        }
      },
      {
        path: 'new/:id',
        name: `${slug}-new`,
        component: () => import('./view/NewPost.vue'),
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: `แก้ไข`,
          type: 'page',
          auth: true,
          icon: "home",
        }
      },
      {
        path: 'iframe/:id',
        name: `${slug}-iframe`,
        component: () => import('./view/Iframe.vue'),
        meta: {
          fullscreen: true,
          inMenu: false,
          parent: title,
          main: title,
          title: `ตัวอย่าง`,
          type: 'page',
          auth: false,
          icon: "plus",
        }
      },
      {
        path: 'form/:id/:sub?',
        name: `${slug}-form`,
        component: () => import('./view/Form.vue'),
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: `แบบฟอร์ม`,
          type: 'page',
          auth: false,
          icon: "file-alt",
        }
      },
      {
        path: 'builder/:id',
        name: `${slug}-builder`,
        component: () => import('./view/Builder.vue'),
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: `ออกแบบหน้าเว็บ`,
          type: 'page',
          auth: false,
          icon: "file-alt",
        }
      },
      {
        path: 'menu/:id',
        name: `${slug}-menu`,
        component: () => import('./view/Menu.vue'),
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: `ออกแบบเมนู`,
          type: 'page',
          auth: false,
          icon: "file-alt",
        }
      },
      {
        path: 'page/:page',
        name: `${slug}-page`,
        component: () => import('./view/Page.vue'),
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: `หน้าเว็บ`,
          type: 'page',
          auth: false,
          icon: "file-alt",
        }
      },
      {
        path: 'post/:id/add',
        name: `${slug}-post`,
        component: () => import('./view/NewPost.vue'),
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: `บทความ`,
          type: 'page',
          auth: false,
          icon: "file-alt",
        }
      },
      {
        path: 'blog/add',
        name: `${slug}-blog-add`,
        component: () => import('./component/AddBlog.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          key: 'blog-add',
          main: title,
          title: `เพิ่มบล็อก`,
          type: 'page',
          auth: true,
          icon: "plus",
        }
      },
      {
        path: 'blog/add/:id',
        name: `${slug}-blog-add-parent`,
        component: () => import('./component/AddBlog.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          key: 'blog-add-parent',
          main: title,
          title: `เพิ่มบล็อกภายใต้หน้า`,
          type: 'page',
          auth: true,
          icon: "plus",
        }
      },
    ]
  }
];
