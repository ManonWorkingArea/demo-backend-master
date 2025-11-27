const slug = "user";
const title = "สมาชิก";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "จัดการข้อมูลสมาชิก",
    groups: 'ecommerce',
    default: false,
    hasSubmenu: true,
    hasDashboard: true,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      icon: "user-graduate",
      role: ['admin','public'],
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
          title: `รายชื่อสมาชิก`,
          type: 'page',
          auth: true,
          icon: "user-graduate",
        }
      },
      {
        path: 'add',
        name: `${slug}-add`,
        component: () => import('./view/Add.vue'),
        meta: {
          inMenu: true,
          parent: title,
          page: `${slug}/index`,
          main: title,
          title: `เพิ่มข้อมูลใหม่`,
          type: 'page',
          auth: true,
          icon: "user-graduate",
        }
      },
      {
        path: 'detail/:id',
        name: `${slug}-detail`,
        component: () => import('./view/Detail.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/index`,
          main: title,
          title: `รายละเอียด`,
          type: 'page',
          auth: true,
          icon: "user-graduate",
        }
      },
      {
        path: 'edit/:id',
        name: `${slug}-edit`,
        component: () => import('./view/Edit.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/index`,
          main: title,
          title: `แก้ไขข้อมูล`,
          type: 'page',
          auth: true,
          icon: "user-graduate",
        }
      },
      {
        path: 'register',
        name: `${slug}-register`,
        component: () => import('./view/Register.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/register`,
          main: title,
          title: `ลงทะเบียน`,
          type: 'page',
          auth: false,
          icon: "user-graduate",
        }
      },
      {
        path: 'login',
        name: `${slug}-login`,
        component: () => import('./view/Login.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/login`,
          main: title,
          title: `เข้าสู่ระบบ`,
          type: 'page',
          auth: false,
          icon: "user-graduate",
        }
      },
      {
        path: 'forgot',
        name: `${slug}-forgot`,
        component: () => import('./view/Forgot.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/forgot`,
          main: title,
          title: `ลืมรหัสผ่าน`,
          type: 'page',
          auth: false,
          icon: "user-graduate",
        }
      },
      {
        path: 'activate',
        name: `${slug}-activate`,
        component: () => import('./view/Activate.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/activate`,
          main: title,
          title: `ยืนยันบัญชี`,
          type: 'page',
          auth: false,
          icon: "user-graduate",
        }
      },
      {
        path: 'profile',
        name: `${slug}-profile`,
        component: () => import('./view/Profile.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}/profile`,
          main: title,
          title: `โปรไฟล์สมาชิก`,
          type: 'page',
          auth: true,
          icon: "user-circle",
        }
      }
    ]
  }
];
