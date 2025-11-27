const slug = "credit";
const title = " เครดิต";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "จัดการร้านค้าเพื่อจำหน่ายสินค้า",
    groups: 'ecommerce',
    default: false,
    hasSubmenu: true,
    hasDashboard: true,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      icon: "wallet",
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
          title: `คำสั่งซื้อ`,
          type: 'page',
          auth: true,
          icon: "wallet",
        }
      },
      {
        path: 'products',
        name: `${slug}-products`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `สินค้า`,
          type: 'page',
          auth: true,
          icon: "box",
        }
      },
      {
        path: 'inventory',
        name: `${slug}-inventory`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `คลังสินค้า`,
          type: 'page',
          auth: true,
          icon: "warehouse",
        }
      },
      {
        path: 'shipping',
        name: `${slug}-shipping`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `การจัดส่ง`,
          type: 'page',
          auth: true,
          icon: "truck",
        }
      },
      {
        path: 'payment',
        name: `${slug}-payment`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `การชำระเงิน`,
          type: 'page',
          auth: true,
          icon: "money-bill-alt",
        }
      }
    ]
  }
];
