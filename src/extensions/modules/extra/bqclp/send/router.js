const slug = "bqclp_send";
const title = "ส่งคำขอฯ";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/all`,
    description: "การจัดการเนื้อหาเว็บไซต์",
    groups: 'extra',
    default: false,
    hasSubmenu: false,
    hasDashboard: true,
    inApp: 'yes',
    inTop: 'yes',
    counter: true,
    meta: {
      inMenu: true,
      title: title,
      icon: "paper-plane",
      role: ['admin'],
    },
    children: [
      {
        path: 'all',
        name: `${slug}-all`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: title,
          type: 'page',
          auth: true,
          icon: "paper-plane",
        }
      }
    ]
  }
];
