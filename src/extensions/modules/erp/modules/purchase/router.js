const slug = "purchase";
const title = "Purchase";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "ระบบจัดการขาซื้อ ตั้งแต่การขอสั่งซื้อจนถึงการรับเข้าและออกใบแจ้งหนี้",
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
      icon: "shopping-cart",
      role: ['admin', 'manager', 'purchaser', 'warehouse', 'accounting'],
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
          role: ['admin', 'manager', 'purchaser'],
        }
      },

      // === PURCHASE REQUEST (PR) ===
      {
        path: 'purchase-request',
        name: `${slug}-purchase-request`,
        component: () => import('./components/request/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'purchase-request',
          title: "Purchase Request (PR)",
          type: 'page',
          auth: true,
          icon: "file-plus",
          role: ['admin', 'manager', 'purchaser'],
        }
      },
      {
        path: 'purchase-request/new',
        name: `${slug}-pr-form-new`,
        component: () => import('./components/request/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'pr-form-new',
          title: "สร้างใบขอซื้อใหม่",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'purchaser'],
        }
      },
      {
        path: 'purchase-request/:id/edit',
        name: `${slug}-pr-form-edit`,
        component: () => import('./components/request/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'pr-form-edit',
          title: "แก้ไขใบขอซื้อ",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager', 'purchaser'],
        }
      },
      {
        path: 'purchase-request/create',
        name: `${slug}-pr-create`,
        component: () => import('./components/request/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'pr-create',
          title: "สร้าง Purchase Request",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'purchaser'],
        }
      },
      {
        path: 'purchase-request/:id',
        name: `${slug}-pr-detail`,
        component: () => import('./components/request/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'pr-detail',
          title: "รายละเอียด PR",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'purchaser'],
        }
      },

      // === PURCHASE ORDER (PO) ===
      {
        path: 'purchase-order',
        name: `${slug}-purchase-order`,
        component: () => import('./components/purchase-order/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'purchase-order',
          title: "Purchase Order (PO)",
          type: 'page',
          auth: true,
          icon: "shopping-bag",
          role: ['admin', 'manager', 'purchaser'],
        }
      },
      {
        path: 'purchase-order/create',
        name: `${slug}-po-create`,
        component: () => import('./components/purchase-order/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'po-create',
          title: "สร้าง Purchase Order",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'purchaser'],
        }
      },
      {
        path: 'purchase-order/:id',
        name: `${slug}-po-detail`,
        component: () => import('./components/purchase-order/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'po-detail',
          title: "รายละเอียด PO",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'purchaser'],
        }
      },
      {
        path: 'purchase-order/:id/edit',
        name: `${slug}-po-edit`,
        component: () => import('./components/purchase-order/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'po-edit',
          title: "แก้ไข PO",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager', 'purchaser'],
        }
      },

      // === GOODS RECEIPT (GRN) ===
      {
        path: 'goods-receipt',
        name: `${slug}-goods-receipt`,
        component: () => import('./components/goods-receipt/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'goods-receipt',
          title: "Goods Receipt (GRN)",
          type: 'page',
          auth: true,
          icon: "truck-loading",
          role: ['admin', 'manager', 'warehouse'],
        }
      },
      {
        path: 'goods-receipt/create',
        name: `${slug}-grn-create`,
        component: () => import('./components/goods-receipt/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'grn-create',
          title: "บันทึกรับสินค้า",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'warehouse'],
        }
      },
      {
        path: 'goods-receipt/:id',
        name: `${slug}-grn-detail`,
        component: () => import('./components/goods-receipt/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'grn-detail',
          title: "รายละเอียด GRN",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'warehouse'],
        }
      },

      // === PURCHASE INVOICE (AP INVOICE) ===
      {
        path: 'invoice',
        name: `${slug}-invoice`,
        component: () => import('./components/invoice/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'invoice',
          title: "Purchase Invoice (AP)",
          type: 'page',
          auth: true,
          icon: "file-invoice",
          role: ['admin', 'manager', 'accounting'],
        }
      },
      {
        path: 'invoice/create',
        name: `${slug}-invoice-create`,
        component: () => import('./components/invoice/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'invoice-create',
          title: "บันทึกใบแจ้งหนี้",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'accounting'],
        }
      },
      {
        path: 'invoice/:id',
        name: `${slug}-invoice-detail`,
        component: () => import('./components/invoice/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'invoice-detail',
          title: "รายละเอียดใบแจ้งหนี้",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'accounting'],
        }
      },

      // === SUPPLIER MANAGEMENT ===
      {
        path: 'suppliers',
        name: `${slug}-suppliers`,
        component: () => import('./components/supplier/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'suppliers',
          title: "Supplier Master",
          type: 'page',
          auth: true,
          icon: "users",
          role: ['admin', 'manager'],
        }
      },
      {
        path: 'suppliers/new',
        name: `${slug}-supplier-new`,
        component: () => import('./components/supplier/New.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'supplier-new',
          title: "เพิ่มผู้ขายใหม่",
          type: 'page',
          auth: true,
          icon: "user-plus",
          role: ['admin', 'manager'],
        }
      },
      {
        path: 'suppliers/create',
        name: `${slug}-supplier-create`,
        component: () => import('./components/supplier/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'supplier-create',
          title: "เพิ่ม Supplier",
          type: 'page',
          auth: true,
          icon: "user-plus",
          role: ['admin', 'manager'],
        }
      },
      {
        path: 'suppliers/:id',
        name: `${slug}-supplier-detail`,
        component: () => import('./components/supplier/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'supplier-detail',
          title: "รายละเอียด Supplier",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'purchaser'],
        }
      },
      {
        path: 'suppliers/:id/edit',
        name: `${slug}-supplier-edit`,
        component: () => import('./components/supplier/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'supplier-edit',
          title: "แก้ไข Supplier",
          type: 'page',
          auth: true,
          icon: "user-edit",
          role: ['admin', 'manager'],
        }
      },

      // === REPORTS & ANALYTICS ===
      {
        path: 'reports',
        name: `${slug}-reports`,
        component: () => import('./components/reports/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'reports',
          title: "Reports & Analytics",
          type: 'page',
          auth: true,
          icon: "chart-bar",
          role: ['admin', 'manager'],
        }
      },

      // === SETTINGS ===
      {
        path: 'settings',
        name: `${slug}-settings`,
        component: () => import('./components/settings/Index.vue'),
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
      // === WORKFLOW ACTIONS (Hidden Routes) ===
      {
        path: 'purchase-request/:id/approve',
        name: `${slug}-pr-approve`,
        component: () => import('./components/request/List.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'pr-approve',
          title: "อนุมัติ PR",
          type: 'page',
          auth: true,
          icon: "check",
          role: ['admin', 'manager'],
          action: 'createPurchaseRequest'
        }
      },
      {
        path: 'purchase-order/:id/approve',
        name: `${slug}-po-approve`,
        component: () => import('./components/request/List.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'po-approve',
          title: "อนุมัติ PO",
          type: 'page',
          auth: true,
          icon: "check",
          role: ['admin', 'manager'],
          action: 'approvePurchaseOrder'
        }
      },
      {
        path: 'goods-receipt/:poId/receive',
        name: `${slug}-goods-receive`,
        component: () => import('./components/request/List.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'goods-receive',
          title: "รับสินค้าเข้าคลัง",
          type: 'page',
          auth: true,
          icon: "warehouse",
          role: ['admin', 'manager', 'warehouse'],
          action: 'receiveGoods'
        }
      },
      {
        path: 'invoice/:poId/create-ap',
        name: `${slug}-create-ap-invoice`,
        component: () => import('./components/request/List.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'create-ap-invoice',
          title: "สร้างใบแจ้งหนี้ AP",
          type: 'page',
          auth: true,
          icon: "file-invoice-dollar",
          role: ['admin', 'manager', 'accounting'],
          action: 'createAPInvoice'
        }
      },

      // === PRINT & EXPORT ===
      {
        path: 'purchase-request/:id/print',
        name: `${slug}-pr-print`,
        component: () => import('./shared/Print.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'pr-print',
          title: "พิมพ์ใบขอซื้อ",
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "print",
          role: ['admin', 'manager', 'purchaser'],
        }
      },
      {
        path: 'purchase-order/:id/print',
        name: `${slug}-po-print`,
        component: () => import('./shared/Print.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'po-print',
          title: "พิมพ์ PO",
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "print",
          role: ['admin', 'manager', 'purchaser'],
        }
      },
      {
        path: 'invoice/:id/print',
        name: `${slug}-invoice-print`,
        component: () => import('./components/request/List.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'invoice-print',
          title: "พิมพ์ใบแจ้งหนี้",
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "print",
          role: ['admin', 'manager', 'accounting'],
        }
      },

      // === SEARCH & FILTER ===
      {
        path: 'search/:keyword',
        name: `${slug}-search`,
        component: () => import('./components/request/List.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'search',
          title: "ผลการค้นหา",
          type: 'page',
          auth: false,
          icon: "search",
          role: ['admin', 'manager', 'purchaser'],
        }
      }
    ]
  }
]