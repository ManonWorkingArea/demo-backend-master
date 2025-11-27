
const slug  = "appointment";
const title = { TH: "appointment", EN: "appointment" };

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/home`,
    description: "appointment",
    groups: 'system',
    counter: true,
    default: false,
    hasSubmenu: false,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'no',
    meta: {
      inMenu: true,
      title: title,

      parent: slug,
      key: 'home',
      main: title,
      
      icon: "calendar-days",
      role: ['admin'],
    },
    children: [
      {
        path: 'home',
        name: `${slug}-home`,
        component: () => import('./view/Calendar.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          key: 'home',
          page: `${slug}`,
          main: title,
          title: `ตารางนัดหมาย`,
          type: 'page',
          auth: true,
          icon: "calendar-days",
        }
      }
    ]
  }
]
