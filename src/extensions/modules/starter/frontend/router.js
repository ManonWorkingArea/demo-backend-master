import storageManager 	from '@/plugins/storage';

const storedConfigData  = storageManager.get("configs");
const session           = storageManager.get("session");
const defaultPlugin 	  = storedConfigData ? storedConfigData.defaultPlugin : null;
const sessionInterface  = session && session.interface ? session.interface : "backend";

const slug  = "home";
const title = "หน้าหลัก";

export default 
[
  {
    path: `/`,
    name: `${slug}`,
    description: "หน้าหลักของระบบ",
    groups: 'default',
    default: true,
    component: (() => {
      if (sessionInterface === "frontend") {
        return () => import('./view/Dashboard');
      } else if (sessionInterface === "backend") {
        if (defaultPlugin) {
          return () => import(`../${defaultPlugin}/view/Dashboard`);
        } else {
          return () => import('../home/view/Dashboard');
        }
      }
    })(),
    hasSubmenu: false,
    hasDashboard: true,
    meta: {
      inMenu: true,
      auth: false,
      title: title,
      icon: "home",
      role: ['root','superadmin','admin','member','public'],
    }
  }
]
