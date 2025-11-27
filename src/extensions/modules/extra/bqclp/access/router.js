const slug = "bqclp_access";
const title = "เข้าสู่ระบบ";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/login`,
    description: "จัดการข้อมููลการลงทะเบียนของหลักสูตร",
    groups: 'academy',
    linkage: "lesson",
    counter: false,
    default: false,
    hasSubmenu: false,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'no',
    session: {
      name: 'bqclp',
      yes: {
        name: 'ออกจากระบบ',
        url: '/logout',
        icon: "power-off",
      },
      no: {
        name: 'เข้าสู่ระบบ',
        url: '/profile',
        icon: "key",
      },
    },
    meta: {
      inMenu: true,
      title: title,
      icon: "key",
      role: ['admin'],
    },
    children: [
      {
        path: 'login',
        name: `${slug}-login`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: false,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `เข้าสู่ระบบ`,
          type: 'page',
          icon: "key",
          session:false
        }
      },
      {
        path: 'profile',
        name: `${slug}-profile`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: false,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `ข้อมูลส่วนตัว`,
          type: 'page',
          icon: "user",
          session:true
        }
      }
    ]
  }
];
