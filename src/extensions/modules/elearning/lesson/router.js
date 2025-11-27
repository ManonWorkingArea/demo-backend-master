const slug  = "lesson";
const title = "Course";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/home`,
    description: "จัดการข้อมูลหลักสูตรที่เปิดให้บริการภายในสถาบัน",
    groups: 'academy',
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
      icon: "graduation-cap",
      role: ['admin','manager','public','guest'],
    },
    children: [
      {
        path: 'home',
        name: `${slug}-home`,
        component: () => import('./view/course/Index.vue'), // Dynamic import
        meta: {
          inMenu: true,
          inFront: true,
          parent: slug,
          main: title,
          key: 'home',
          title: "Course",
          type: 'page',
          auth: false,
          icon: "graduation-cap",
          role: ['admin','manager'],
        }
      },
      {
        path: 'command',
        name: `${slug}-command`,
        component: () => import('./view/course/Command.vue'), // Dynamic import
        meta: {
          inMenu: false,
          inFront: false,
          parent: slug,
          main: title,
          key: 'command',
          title: `command`,
          type: 'page',
          auth: false,
          icon: "terminal",
          role: ['admin','manager'],
        }
      },
      {
        path: 'pdf',
        name: `${slug}-pdf`,
        component: () => import('./view/course/PDFToImage.vue'), // Dynamic import
        meta: {
          inMenu: false,
          inFront: false,
          parent: slug,
          main: title,
          key: 'pdf',
          title: `pdf`,
          type: 'page',
          auth: false,
          icon: "terminal",
          role: ['admin','manager'],
        }
      },
      {
        path: 'ably',
        name: `${slug}-ably`,
        component: () => import('./view/course/Ably.vue'), // Dynamic import
        meta: {
          inMenu: false,
          inFront: false,
          parent: slug,
          main: title,
          key: 'ably',
          title: `ably`,
          type: 'page',
          auth: false,
          icon: "terminal",
          role: ['admin','manager'],
        }
      },
      {
        path: 'reconcile',
        name: `${slug}-reconcile`,
        component: () => import('./view/course/SCB.vue'), // Dynamic import
        meta: {
          inMenu: false,
          inFront: false,
          parent: slug,
          main: title,
          key: 'reconcile',
          title: `reconcile`,
          type: 'page',
          auth: false,
          icon: "terminal",
          role: ['admin','manager'],
        }
      },
      {
        path: 'reconcile-xls',
        name: `${slug}-reconcile-xls`,
        component: () => import('./view/course/SCBXLS.vue'), // Dynamic import
        meta: {
          inMenu: false,
          inFront: false,
          parent: slug,
          main: title,
          key: 'reconcile-xls',
          title: `reconcile-xls`,
          type: 'page',
          auth: false,
          icon: "terminal",
          role: ['admin','manager'],
        }
      },
      {
        path: 'player-customize',
        name: `${slug}-player-customize`,
        component: () => import('./view/course/PlayerCustomizer.vue'), // Dynamic import
        meta: {
          inMenu: false,
          inFront: false,
          parent: slug,
          main: title,
          key: 'player-customize',
          title: `player-customize`,
          type: 'page',
          auth: false,
          icon: "terminal",
          role: ['admin','manager'],
        }
      },
      {
        path: 'detail-customize',
        name: `${slug}-detail-customize`,
        component: () => import('./view/course/DetailCustomizer.vue'), // Dynamic import
        meta: {
          inMenu: false,
          inFront: false,
          parent: slug,
          main: title,
          key: 'detail-customize',
          title: `detail-customize`,
          type: 'page',
          auth: false,
          icon: "terminal",
          role: ['admin','manager'],
        }
      },
      {
        path: 'categories/:id',
        name: `${slug}-categories`,
        component: () => import('./view/course/Index.vue'), // Dynamic import
        meta: {
          inMenu: false,
          inFront: false,
          parent: slug,
          main: title,
          key: 'categories',
          title: `หลักสูตร`,
          type: 'page',
          auth: false,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'search/:keyword',
        name: `${slug}-kehttps://vue-project.sgp1.digitaloceanspaces.com/Slide/eco-plus-label-thumbnail-fti-academy-1920-1080-px-2-1png.pngyword`,
        component: () => import('./view/course/Index.vue'), // Dynamic import
        meta: {
          inMenu: false,
          inFront: false,
          parent: slug,
          main: title,
          key: 'search',
          title: `หลักสูตร`,
          type: 'page',
          auth: false,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'add',
        name: `${slug}-add`,
        component: () => import('./view/course/Add.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'add',
          title: `เพิ่มหลักสูตร`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'taxonomy',
        name: `${slug}-taxonomy`,
        component: () => import('./view/course/TaxonomyManager.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'taxonomy',
          title: "taxonomy",
          type: 'page',
          auth: true,
          icon: "archive",
          role: ['admin'],
        }
      },
      {
        path: 'category',
        name: `${slug}-category`,
        component: () => import('./view/course/Category.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'category',
          title: { TH: "หมวดหมู่", EN: "Category" },
          type: 'page',
          auth: true,
          icon: "archive",
          role: ['admin'],
        }
      },
      {
        path: 'institution',
        name: `${slug}-institution`,
        component: () => import('./view/course/Institution.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'institution',
          title: { TH: "สถาบัน", EN: "Institution" },
          type: 'page',
          auth: true,
          icon: "school",
          role: ['admin'],
        }
      },
      {
        path: 'lecturer',
        name: `${slug}-lecturer`,
        component: () => import('./view/course/Lecturer.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'lecturer',
          title: { TH: "วิทยากร", EN: "Lecturer" },
          type: 'page',
          auth: true,
          icon: "user-tie",
          role: ['admin'],
        }
      },
      {
        path: 'target',
        name: `${slug}-target`,
        component: () => import('./view/course/Target.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'target',
          title: { TH: "กลุ่มเป้าหมาย", EN: "Target" },
          type: 'page',
          auth: true,
          icon: "user-tie",
          role: ['admin'],
        }
      },
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./view/course/Dashboard.vue'), // Dynamic import
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'dashboard',
          title: `Dashboard`,
          type: 'page',
          auth: true,
          icon: "user-tie",
          role: ['admin'],
        }
      },
      {
        path: 'detail/:id',
        name: `${slug}-detail`,
        component: () => import('./view/course/Detail.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'detail',
          title: `รายละเอียด`,
          type: 'page',
          auth: false,
          mode: 'standard',
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'subscribe/:id',
        name: `${slug}-subscribe`,
        component: () => import('./view/course/Subscribe.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'subscribe',
          title: `Subscribe`,
          type: 'page',
          auth: false,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'pay/:id',
        name: `${slug}-pay`,
        component: () => import('./view/course/Payment.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'pay',
          title: `Pay`,
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'detail/:id/enroll',
        name: `${slug}-enroll`,
        component: () => import('./view/course/Enroll.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'detail',
          title: `ผู้ลงทะเบียนในหลักสูตร`,
          type: 'page',
          auth: false,
          icon: "graduation-cap",
          role: ['admin','manager'],
        }
      },
      {
        path: 'assessment/:cid/:eid/:type?/:round?',
        name: `${slug}-assessment`,
        component: () => import('./view/course/Assessment.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'assessment',
          title: `แบบทดสอบ`,
          type: 'page',
          auth: false,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'public/:id',
        name: `${slug}-public`,
        component: () => import('./view/course/Public.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'public',
          title: `Public`,
          type: 'page',
          auth: false,
          icon: "graduation-cap",
          fullscreen: true,
        }
      },
      {
        path: 'certification/:cid/:uid?',
        name: `${slug}-certification`,
        component: () => import('./view/course/Cetification.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'certification',
          title: `ใบรับรองผลการเรียน`,
          type: 'page',
          auth: false,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'edit/:id/:mode/:history',
        name: `${slug}-edit`,
        component: () => import('./view/course/Edit.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'edit',
          title: `แก้ไข`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'player/detail/:id',
        name: `${slug}-player-detail`,
        component: () => import('./view/player/Detail.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'player-detail',
          title: `รายละเอียด บทเรียน`,
          type: 'page',
          auth: false,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'player/edit/:id',
        name: `${slug}-player-edit`,
        component: () => import('./view/player/Edit.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'player-edit',
          title: `แก้ไข บทเรียน`,
          type: 'page',
          auth: false,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'player/add/:id',
        name: `${slug}-player-add`,
        component: () => import('./view/player/Add.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'player-add',
          title: `เพิ่ม บทเรียน`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'player/sub/:cid/:pid',
        name: `${slug}-player-add-sub`,
        component: () => import('./view/player/AddSub.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'player-sub',
          title: `เพิ่ม Sub-Player to Folder`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'exam/add/:id/:history',
        name: `${slug}-exam-add`,
        component: () => import('./view/exam/Add.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'exam-add',
          title: `เพิ่มแบบทดสอบ`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'exam/edit/:id/:history',
        name: `${slug}-exam-edit`,
        component: () => import('./view/exam/Edit.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'exam-edit',
          title: `แก้ไขแบบทดสอบ`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'exam/detail/:id/:history',
        name: `${slug}-exam-detail`,
        component: () => import('./view/exam/Detail.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'exam-detail',
          title: `รายละเอียดแบบทดสอบ`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'question/add/:id',
        name: `${slug}-question-add`,
        component: () => import('./view/exam/question/Add.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'question-add',
          title: `เพิ่มข้อสอบ`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'question/edit/:exam/:question',
        name: `${slug}-question-edit`,
        component: () => import('./view/exam/question/Edit.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'question-edit',
          title: `แก้ไขข้อสอบ`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'question/answer/:exam/:question',
        name: `${slug}-question-answer`,
        component: () => import('./view/exam/question/Answer.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'question-answer',
          title: `เพิ่มคำตอบ`,
          type: 'page',
          auth: true,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'play/:cid/:pid',
        name: `${slug}-play`,
        props: true,
        component: () => import('./view/course/Play.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'play',
          title: `เรียน`,
          type: 'page',
          auth: false,
          icon: "play",
          role: ['admin'],
        }
      },
      {
        path: 'bill',
        name: `${slug}-bill`,
        component: () => import('./view/course/Bill.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'bill',
          title: `Bill`,
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'chat-client',
        name: `${slug}-chat-client`,
        component: () => import('./component/course/ChatClient.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'chat-client',
          title: `chat-client`,
          type: 'page',
          auth: false,
          icon: "graduation-cap",
          role: ['admin','manager'],
        }
      },
      {
        path: 'chat-admin',
        name: `${slug}-chat-admin`,
        component: () => import('./component/course/ChatAdmin.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'chat-admin',
          title: `chat-admin`,
          type: 'page',
          auth: false,
          icon: "graduation-cap",
          role: ['admin','manager'],
        }
      },
      {
        path: 'survey',
        name: `${slug}-survey`,
        component: () => import('./view/course/Survey.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'survey',
          title: `Survey`,
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "graduation-cap",
          role: ['admin'],
        }
      },{
        path: 'streaming',
        name: `${slug}-streaming`,
        component: () => import('./view/course/Streaming.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'streaming',
          title: `Streaming`,
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'camera',
        name: `${slug}-camera`,
        component: () => import('./view/course/Camera.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'camera',
          title: `camera`,
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
      {
        path: 'webcam',
        name: `${slug}-webcam`,
        component: () => import('./view/course/Webcam.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'webcam',
          title: `webcam`,
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "camera",
          role: ['admin'],
        }
      },
      {
        path: 'certification/search',
        name: `${slug}-certification-search`,
        component: () => import('./view/course/Search.vue'), // Dynamic import
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'certification-search',
          title: `ฐานข้อมูลใบรับรอง`,
          type: 'page',
          auth: false,
          icon: "graduation-cap",
          role: ['admin'],
        }
      },
    ]
  }
]
