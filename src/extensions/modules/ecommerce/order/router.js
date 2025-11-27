const slug = "order";
const title = "คำสั่งซื้อ";

export default [
  {
    path: `/${slug}/index`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "ข้อมูลคำสั่งซื้อของระบบร้านค้า",
    groups: 'ecommerce',
    linkage: "shop",
    default: false,
    hasSubmenu: false,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'no',
    meta: {
      inMenu: true,
      title: title,
      icon: "clipboard-list",
      role: ['admin'],
    },
    children: [
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: true,
          auth: true,
          parent: title,
          main: title,
          page: `${slug}`,
          title: `ข้อความ`,
          type: 'page',
          icon: "clipboard-list",
        }
      }
    ]
  }
];
