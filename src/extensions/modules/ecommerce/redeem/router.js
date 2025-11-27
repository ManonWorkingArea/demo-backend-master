const slug = "redeem-coupon";
const title = "Kovic Privilege Health Card";

export default [
  {
    path: `/${slug}/:code`,
    name: `${slug}`,
    component: () => import('./view/Index.vue'),
    //redirect: `/${slug}/dashboard`,
    description: "จัดการคูปอง",
    groups: 'ecommerce',
    default: false,
    hasSubmenu: false,
    hasDashboard: false,
    inApp: 'no',
    inTop: 'no',
    meta: {
      auth: false,
      inMenu: true,
      title: title,
      icon: "shopping-cart",
      role: ['admin','public'],
    }
  }
];
