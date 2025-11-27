const slug = "seminar";
const title = "สัมมนา";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "จัดการหลักสูตรสัมมนาแบบจัดในสถานที่",
    groups: 'academy',
    default: false,
    hasSubmenu: true,
    hasDashboard: true,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      icon: "calendar",
      role: ['admin'],
    },
    children: [
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./view/course/Index.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          title: `งามสัมมนาทั้งหมด`,
          type: 'page',
          auth: true,
          icon: "calendar",
        }
      },
      {
        path: 'add',
        name: `${slug}-add`,
        component: () => import('./view/course/Add.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          title: `เพิ่ม/แก้ไข`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
        }
      },
      {
        path: 'detail/:id',
        name: `${slug}-detail`,
        component: () => import('./view/course/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `รายละเอียด`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
        }
      },
      {
        path: 'edit/:id',
        name: `${slug}-edit`,
        component: () => import('./view/course/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `แก้ไข`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
        }
      },
      {
        path: 'player/detail/:id',
        name: `${slug}-player-detail`,
        component: () => import('./view/player/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `รายละเอียด บทเรียน`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
        }
      },
      {
        path: 'player/edit/:id',
        name: `${slug}-player-edit`,
        component: () => import('./view/player/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `แก้ไข บทเรียน`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
        }
      },
      {
        path: 'player/add/:id/:count',
        name: `${slug}-player-add`,
        component: () => import('./view/player/Add.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `เพิ่ม บทเรียน`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
        }
      },
      {
        path: 'player/sub/:cid/:pid/:count',
        name: `${slug}-player-add-sub`,
        component: () => import('./view/player/AddSub.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `เพิ่ม Sub-Player to Folder`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
        }
      },
      {
        path: 'exam/add/:id',
        name: `${slug}-exam-add`,
        component: () => import('./view/exam/Add.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `เพิ่มแบบทดสอบ`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
        }
      },
      {
        path: 'exam/edit/:id',
        name: `${slug}-exam-edit`,
        component: () => import('./view/exam/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `แก้ไขแบบทดสอบ`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
        }
      },
      {
        path: 'exam/detail/:id',
        name: `${slug}-exam-detail`,
        component: () => import('./view/exam/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `รายละเอียดแบบทดสอบ`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
        }
      },
      {
        path: 'question/add/:id/:count',
        name: `${slug}-question-add`,
        component: () => import('./view/exam/question/Add.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `เพิ่มข้อสอบ`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
        }
      },
      {
        path: 'question/edit/:exam/:question',
        name: `${slug}-question-edit`,
        component: () => import('./view/exam/question/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `แก้ไขข้อสอบ`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
        }
      },
      {
        path: 'question/answer/:exam/:question',
        name: `${slug}-question-answer`,
        component: () => import('./view/exam/question/Answer.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `เพิ่มคำตอบ`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
        }
      }
    ]
  }
];
