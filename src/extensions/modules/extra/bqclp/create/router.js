const slug = "bqclp_create";
const title = "สร้างเลขคำขอ";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/create`,
    description: "การจัดการเนื้อหาเว็บไซต์",
    groups: 'extra',
    default: false,
    hasSubmenu: false,
    hasDashboard: true,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      icon: "pencil-alt",
      role: ['admin'],
    },
    children: [
      {
        path: 'create',
        name: `${slug}-create`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: title,
          type: 'page',
          auth: true,
          icon: "pencil-alt",
        }
      }
    ]
  }
];
