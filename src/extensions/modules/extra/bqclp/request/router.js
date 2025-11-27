const slug = "bqclp_request";
const title = "คำขอ/ตัวอย่าง(ไม่ส่ง)";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/request`,
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
      icon: "file-signature",
      role: ['admin'],
    },
    children: [
      {
        path: 'request',
        name: `${slug}-request`,
        component: () => import('./view/Index.vue'),
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: title,
          type: 'page',
          auth: true,
          icon: "file-signature",
        }
      },
      {
        path: 'request/:id',
        name: `${slug}-request-single`,
        component: () => import('./view/Single.vue'),
        meta: {
          inMenu: false,
          parent: title,
          main: title,
          title: title,
          type: 'page',
          auth: true,
          icon: "file-signature",
        }
      }
    ]
  }
];
