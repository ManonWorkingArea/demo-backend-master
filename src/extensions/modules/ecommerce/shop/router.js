const slug = "shop";
const title = { TH: "ร้านค้า", EN: "Shop" };

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
      parent: slug,
      key: 'home',
      main: title,
      icon: "shopping-cart",
      role: ['admin','public'],
    },
    children: [
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'dashboard',
          page: `${slug}`,
          title: `คำสั่งซื้อ`,
          type: 'page',
          auth: true,
          icon: "shopping-cart",
        }
      },
      {
        path: 'products',
        name: `${slug}-products`,
        component: () => import('./view/Products.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'products',
          page: `${slug}`,
          main: title,
          title: `รายการสินค้า`,
          type: 'page',
          auth: false,
          icon: "box",
        }
      },
      {
        path: 'orders',
        name: `${slug}-orders`,
        component: () => import('./view/Order.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'orders',
          page: `${slug}`,
          main: title,
          title: `รายการคำสั่งซื้อ`,
          type: 'page',
          auth: false,
          icon: "shopping-cart",
        }
      },
      {
        path: 'config',
        name: `${slug}-config`,
        component: () => import('./view/StoreConfig.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'config',
          page: `${slug}`,
          main: title,
          title: `config`,
          type: 'page',
          auth: false,
          icon: "cogs",
        }
      },
      {
        path: 'category',
        name: `${slug}-category`,
        component: () => import('./view/Category.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'category',
          page: `${slug}`,
          main: title,
          title: `หมวดหมู่สินค้า`,
          type: 'page',
          auth: true,
          icon: "archive",
        }
      },
      {
        path: 'checkout',
        name: `${slug}-checkout`,
        component: () => import('./view/Checkout.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `ชำระเงิน`,
          type: 'page',
          auth: false,
          icon: "box",
        }
      },
      {
        path: 'product/:id/:variant?',
        name: `${slug}-detail`,
        component: () => import('./view/Product.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `รายละเอียดสินค้า`,
          type: 'page',
          auth: false,
          icon: "box",
        }
      },
      {
        path: 'inventory',
        name: `${slug}-inventory`,
        component: () => import('./view/Inventory.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'inventory',
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
        component: () => import('./view/Shipping.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'shipping',
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
        component: () => import('./view/Payment.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'payment',
          page: `${slug}`,
          main: title,
          title: `การชำระเงิน`,
          type: 'page',
          auth: true,
          icon: "money-bill-alt",
        }
      },
      {
        path: 'demo',
        name: `${slug}-demo`,
        component: () => import('./view/Demo.vue'),
        meta: {
          inMenu: false,
          parent: title,
          page: `${slug}`,
          main: title,
          title: `demo`,
          type: 'page',
          auth: true,
          icon: "money-bill-alt",
        }
      }
    ]
  }
];
