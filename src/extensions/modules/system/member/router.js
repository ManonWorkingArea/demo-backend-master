const slug  = "member";
const title = "ผู้ดูแลระบบ";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "จัดการผู้ดูแลระบบ",
    groups: 'system',
    default: true,
    hasSubmenu: true,
    hasDashboard: false,
    meta: {
      inMenu: false,
      title: title,
      icon: "user",
      role: ['superadmin','admin'],
    },
    children: [
      {
        path: 'profile',
        name: `${slug}-profile`,
        component: () => import('./view/LoginForm.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `ประวัติสมาชิก`,
          type: 'page',
          auth: true,
          icon: "user",
        }
      },
      {
        path: 'login',
        name: `${slug}-login`,
        component: () => import('./view/LoginForm.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `เข้าสู่ระบบ`,
          type: 'page',
          auth: false,
          icon: "user",
        }
      },
      {
        path: 'layout',
        name: `${slug}-layout`,
        component: () => import('./view/layout/Layout.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `layout`,
          type: 'page',
          auth: false,
          icon: "user",
        }
      },
      {
        path: 'unactive',
        name: `${slug}-unactive`,
        component: () => import('./view/Unactive.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `บัญชียังไม่ได้รับการยืนยัน`,
          type: 'page',
          auth: false,
          icon: "user",
        }
      },
      {
        path: 'forgot',
        name: `${slug}-forgot`,
        component: () => import('./view/ForgotForm.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `ลืมรหัสผ่าน`,
          type: 'page',
          auth: false,
          icon: "user",
        }
      },
      {
        path: 'register',
        name: `${slug}-register`,
        component: () => import('./view/RegisterForm.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          title: `ลงทะเบียน`,
          type: 'page',
          auth: false,
          icon: "user",
        }
      }
    ]
  }
]
