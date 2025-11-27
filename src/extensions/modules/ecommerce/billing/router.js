const slug = "billing";
const title = "การชำระเงิน";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "ข้อมูลการรับชำระเงินของระบบ",
    groups: 'payment',
    default: false,
    hasSubmenu: true,
    hasDashboard: true,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      icon: "calculator",
      role: ['admin'],
    },
    children: [
      {
        path: 'branch',
        name: `${slug}-branch-index`,
        component: () => import('./view/branch/List.vue'),
        meta: {
          inMenu: true,
          parent: title,
          main: title,
          title: `ผู้รับชำระ`,
          type: 'page',
          auth: true,
          icon: "home",
        }
      },
      {
        path: 'branch/detail/:id',
        name: `${slug}-branch-detail`,
        component: () => import('./view/branch/Single.vue'),
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: `รายละเอียดผู้รับชำระ`,
          type: 'page',
          auth: true,
          icon: "home",
        }
      },
      {
        path: 'branch/add',
        name: `${slug}-branch-add`,
        component: () => import('./view/branch/Add.vue'),
        meta: {
          inMenu: true,
          parent: title,
          main: title,
          title: `เพิ่มผู้รับชำระ`,
          type: 'page',
          auth: true,
          icon: "home",
        }
      },
      {
        path: 'branch/edit/:id',
        name: `${slug}-branch-edit`,
        component: () => import('./view/branch/Edit.vue'),
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: `แก้ไขผู้รับชำระ`,
          type: 'page',
          auth: true,
          icon: "home",
        }
      },
      {
        path: 'transaction',
        name: `${slug}-transaction-index`,
        component: () => import('./view/transaction/List.vue'),
        meta: {
          inMenu: true,
          parent: title,
          main: title,
          title: `การชำระ`,
          type: 'page',
          auth: true,
          icon: "home",
        }
      },
      {
        path: 'transaction/detail/:id',
        name: `${slug}-transaction-detail`,
        component: () => import('./view/transaction/Single.vue'),
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: `รายละเอียดการชำระ`,
          type: 'page',
          auth: true,
          icon: "home",
        }
      },
      {
        path: 'transaction/add',
        name: `${slug}-transaction-add`,
        component: () => import('./view/transaction/Add.vue'),
        meta: {
          inMenu: true,
          parent: title,
          main: title,
          title: `เพิ่มการชำระ`,
          type: 'page',
          auth: true,
          icon: "home",
        }
      },
      {
        path: 'transaction/edit/:id',
        name: `${slug}-transaction-edit`,
        component: () => import('./view/transaction/Edit.vue'),
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: `แก้ไขการชำระ`,
          type: 'page',
          auth: true,
          icon: "home",
        }
      }
    ]
  }
];
