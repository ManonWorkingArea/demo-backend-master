const slug = "inventory";
const title = "Inventory";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "ระบบจัดการเคลื่อนไหวของสินค้าและการตรวจนับ",
    groups: 'erp',
    default: false,
    hasSubmenu: false,
    hasDashboard: false,
    inApp: 'yes',
    inTop: 'yes',
    meta: {
      inMenu: true,
      title: title,
      parent: slug,
      key: 'dashboard',
      main: title,
      icon: "boxes",
      role: ['admin', 'manager', 'warehouse', 'inventory', 'production'],
    },
    children: [
      // === DASHBOARD ===
      {
        path: 'dashboard',
        name: `${slug}-dashboard`,
        component: () => import('./components/dashboard'),
        meta: {
          inMenu: true,
          inFront: true,
          parent: slug,
          main: title,
          key: 'dashboard',
          title: "Dashboard",
          type: 'page',
          auth: true,
          icon: "chart-line",
          role: ['admin', 'manager', 'warehouse', 'inventory'],
        }
      },

      // === STOCK OVERVIEW ===
      {
        path: 'stock-overview',
        name: `${slug}-stock-overview`,
        component: () => import('./components/stock-overview/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'stock-overview',
          title: "Stock Overview",
          type: 'page',
          auth: true,
          icon: "boxes",
          role: ['admin', 'manager', 'warehouse', 'inventory'],
        }
      },
      {
        path: 'stock-overview/detail/:id',
        name: `${slug}-stock-overview-detail`,
        component: () => import('./components/stock-overview/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'stock-overview',
          title: "Stock Detail",
          type: 'page',
          auth: true,
          role: ['admin', 'manager', 'warehouse', 'inventory'],
        }
      },
      {
        path: 'stock-locations',
        name: `${slug}-stock-locations`,
        component: () => import('./components/stock_locations/Index.vue'),
        meta: {
          inMenu: true,
          inFront: true,
          parent: slug,
          main: title,
          key: 'stock-locations',
          title: "จัดการตำแหน่งคลัง",
          type: 'page',
          auth: true,
          icon: "map-marker-alt",
          role: ['admin', 'manager', 'warehouse'],
        }
      },
      // === PRODUCT MANAGEMENT ===
      {
        path: 'products',
        name: `${slug}-products`,
        component: () => import('./components/products/List.vue'),
        meta: {
          inMenu: true,
          inFront: true,
          parent: slug,
          main: title,
          key: 'products',
          title: "จัดการสินค้า",
          type: 'page',
          auth: true,
          icon: "box",
          role: ['admin', 'manager', 'warehouse', 'inventory'],
        }
      },
      {
        path: 'products/add',
        name: `${slug}-product-add`,
        component: () => import('./components/products/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'product-add',
          title: "เพิ่มสินค้าใหม่",
          type: 'page',
          auth: true,
          icon: "plus-circle",
          role: ['admin', 'manager', 'warehouse', 'inventory'],
        }
      },
      {
        path: 'products/:id',
        name: `${slug}-product-view`,
        component: () => import('./components/products/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'product-view',
          title: "รายละเอียดสินค้า",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'warehouse', 'inventory'],
        }
      },
      {
        path: 'products/:id/edit',
        name: `${slug}-product-edit`,
        component: () => import('./components/products/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'product-edit',
          title: "แก้ไขข้อมูลสินค้า",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager', 'warehouse', 'inventory'],
        }
      },
      {
        path: 'stock-overview/item/:id',
        name: `${slug}-item-detail`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'item-detail',
          title: "รายละเอียดสินค้า",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'warehouse', 'inventory'],
        }
      },
      {
        path: 'stock-overview/lot/:lotId',
        name: `${slug}-lot-detail`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'lot-detail',
          title: "รายละเอียด Lot",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'warehouse', 'inventory'],
        }
      },
      {
        path: 'stock-overview/location/:locationId',
        name: `${slug}-location-detail`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'location-detail',
          title: "รายละเอียดตำแหน่ง",
          type: 'page',
          auth: true,
          icon: "map-marker-alt",
          role: ['admin', 'manager', 'warehouse', 'inventory'],
        }
      },

      // === GOODS RECEIPT ===
      {
        path: 'goods-receipt',
        name: `${slug}-goods-receipt`,
        component: () => import('./components/goods-receipt/Index.vue'),
        meta: {
          inMenu: true,
          inFront: true,
          parent: slug,
          main: title,
          key: 'goods-receipt',
          title: "รับเข้าสินค้า",
          type: 'page',
          auth: true,
          icon: "truck-loading",
          role: ['admin', 'manager', 'warehouse', 'inventory'],
        }
      },

      // === STOCK MOVEMENT / TRANSFER ===
      {
        path: 'stock-movement',
        name: `${slug}-stock-movement`,
        component: () => import('./components/stock-movement/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'stock-movement',
          title: "Stock Movement / Transfer",
          type: 'page',
          auth: true,
          icon: "exchange-alt",
          role: ['admin', 'manager', 'warehouse', 'inventory'],
        }
      },
      {
        path: 'stock-movement/create',
        name: `${slug}-stock-movement-create`,
        component: () => import('./components/stock-movement/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'stock-movement-create',
          title: "สร้าง Stock Movement",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'warehouse', 'inventory'],
        }
      },
      {
        path: 'stock-movement/detail/:id',
        name: `${slug}-stock-movement-detail`,
        component: () => import('./components/stock-movement/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'stock-movement-detail',
          title: "รายละเอียด Stock Movement",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'warehouse', 'inventory'],
        }
      },
      {
        path: 'stock-movement/warehouse-transfer',
        name: `${slug}-warehouse-transfer`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'warehouse-transfer',
          title: "โอนคลัง",
          type: 'page',
          auth: true,
          icon: "truck",
          role: ['admin', 'manager', 'warehouse'],
        }
      },
      {
        path: 'stock-movement/lot-transfer',
        name: `${slug}-lot-transfer`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'lot-transfer',
          title: "ย้าย Lot",
          type: 'page',
          auth: true,
          icon: "arrows-alt",
          role: ['admin', 'manager', 'warehouse'],
        }
      },
      {
        path: 'stock-movement/damaged-goods',
        name: `${slug}-damaged-goods`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'damaged-goods',
          title: "ตัดสินค้าชำรุด",
          type: 'page',
          auth: true,
          icon: "exclamation-triangle",
          role: ['admin', 'manager', 'warehouse'],
        }
      },
      {
        path: 'stock-movement/create',
        name: `${slug}-movement-create`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'movement-create',
          title: "สร้างรายการเคลื่อนไหว",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'warehouse'],
        }
      },

      // === STOCK ADJUSTMENT ===
      {
        path: 'stock-adjustment',
        name: `${slug}-stock-adjustment`,
        component: () => import('./components/stock-adjustment/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'stock-adjustment',
          title: "Stock Adjustment",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager', 'inventory'],
        }
      },
      {
        path: 'stock-adjustment/physical-count',
        name: `${slug}-physical-count`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'physical-count',
          title: "นับสินค้าจริง",
          type: 'page',
          auth: true,
          icon: "calculator",
          role: ['admin', 'manager', 'inventory'],
        }
      },
      {
        path: 'stock-adjustment/increase',
        name: `${slug}-stock-increase`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'stock-increase',
          title: "ปรับเพิ่มสต็อก",
          type: 'page',
          auth: true,
          icon: "plus-circle",
          role: ['admin', 'manager', 'inventory'],
        }
      },
      {
        path: 'stock-adjustment/decrease',
        name: `${slug}-stock-decrease`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'stock-decrease',
          title: "ปรับลดสต็อก",
          type: 'page',
          auth: true,
          icon: "minus-circle",
          role: ['admin', 'manager', 'inventory'],
        }
      },
      {
        path: 'stock-adjustment/create',
        name: `${slug}-adjustment-create`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'adjustment-create',
          title: "สร้างรายการปรับสต็อก",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'inventory'],
        }
      },
      {
        path: 'stock-adjustment/:id',
        name: `${slug}-adjustment-detail`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'adjustment-detail',
          title: "รายละเอียดการปรับสต็อก",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'inventory'],
        }
      },

      // === STOCK RESERVATION ===
      {
        path: 'stock-reservation',
        name: `${slug}-stock-reservation`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'stock-reservation',
          title: "Stock Reservation",
          type: 'page',
          auth: true,
          icon: "bookmark",
          role: ['admin', 'manager', 'inventory', 'production', 'sales'],
        }
      },
      {
        path: 'stock-reservation/production',
        name: `${slug}-production-reservation`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'production-reservation',
          title: "จองสำหรับผลิต",
          type: 'page',
          auth: true,
          icon: "industry",
          role: ['admin', 'manager', 'inventory', 'production'],
        }
      },
      {
        path: 'stock-reservation/sales',
        name: `${slug}-sales-reservation`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'sales-reservation',
          title: "จองสำหรับขาย",
          type: 'page',
          auth: true,
          icon: "shopping-cart",
          role: ['admin', 'manager', 'inventory', 'sales'],
        }
      },
      {
        path: 'stock-reservation/create',
        name: `${slug}-reservation-create`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'reservation-create',
          title: "สร้างรายการจอง",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'inventory'],
        }
      },
      {
        path: 'stock-reservation/:id',
        name: `${slug}-reservation-detail`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'reservation-detail',
          title: "รายละเอียดการจอง",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'inventory'],
        }
      },

      // === INVENTORY LOG ===
      {
        path: 'inventory-log',
        name: `${slug}-inventory-log`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'inventory-log',
          title: "Inventory Log",
          type: 'page',
          auth: true,
          icon: "history",
          role: ['admin', 'manager', 'inventory'],
        }
      },
      {
        path: 'inventory-log/:transactionId',
        name: `${slug}-log-transaction`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'log-transaction',
          title: "รายละเอียด Transaction",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'inventory'],
        }
      },
      {
        path: 'inventory-log/item/:itemId',
        name: `${slug}-log-item`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'log-item',
          title: "ประวัติสินค้า",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'inventory'],
        }
      },

      // === REPORTS & ANALYTICS ===
      {
        path: 'reports',
        name: `${slug}-reports`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'reports',
          title: "Reports & Analytics",
          type: 'page',
          auth: true,
          icon: "chart-bar",
          role: ['admin', 'manager', 'inventory'],
        }
      },

      // === SETTINGS ===
      {
        path: 'settings',
        name: `${slug}-settings`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'settings',
          title: "Settings",
          type: 'page',
          auth: true,
          icon: "cog",
          role: ['admin'],
        }
      },

      // === SEARCH & FILTER ===
      {
        path: 'search/:keyword',
        name: `${slug}-search`,
        component: () => import('./shared/Manager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'search',
          title: "ผลการค้นหา",
          type: 'page',
          auth: false,
          icon: "search",
          role: ['admin', 'manager', 'warehouse', 'inventory'],
        }
      }
    ]
  }
]