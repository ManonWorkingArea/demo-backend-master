const slug  = "home";
const title = { TH: "หน้าหลัก", EN: "Home" };

export default 
[
  {
    path: `/`,
    name: `${slug}`,
    description: "หน้าหลักของระบบ",
    groups: 'default',
    default: true,
    component: () => import('./view/Router'), // Dynamic import
    hasSubmenu: false,
    hasDashboard: true,
    inApp: 'yes',
    inTop: 'no',
    meta: {
      inMenu: true,
      auth: false,
      title: title,
      icon: "home",
      parent: slug,
      key: 'home',
      role: ['root','superadmin','admin','member','guest'],
    }
  }
]
