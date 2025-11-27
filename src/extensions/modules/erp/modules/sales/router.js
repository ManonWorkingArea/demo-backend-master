const slug = "sales";
const title = "Sales";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "ระบบขาย: ใบเสนอราคา → ใบสั่งซื้อ → ใบแจ้งหนี้",
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
      icon: "file-invoice-dollar",
      role: ['admin', 'manager', 'sales', 'accounting'],
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
          role: ['admin', 'manager', 'sales'],
        }
      },

      // === QUOTATION (Draft Status) ===
      {
        path: 'quotation',
        name: `${slug}-quotation`,
        component: () => import('./components/quotation/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'quotation',
          title: "Quotation (Draft)",
          type: 'page',
          auth: true,
          icon: "file-alt",
          role: ['admin', 'manager', 'sales'],
        }
      },
      {
        path: 'quotations/create',
        name: `${slug}-quotation-create`,
        component: () => import('./components/quotation/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'quotation-create',
          title: "สร้างใบเสนอราคา",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'sales'],
        }
      },
      {
        path: 'quotation/:id',
        name: `${slug}-quotation-detail`,
        component: () => import('./components/quotation/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'quotation-detail',
          title: "รายละเอียดใบเสนอราคา",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'sales'],
        }
      },
      {
        path: 'quotation/:id/edit',
        name: `${slug}-quotation-edit`,
        component: () => import('./components/quotation/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'quotation-edit',
          title: "แก้ไขใบเสนอราคา",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager', 'sales'],
        }
      },

      // === INVOICE (Pending Payment Status) ===
      {
        path: 'invoice',
        name: `${slug}-invoice`,
        component: () => import('./components/invoice/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'invoice',
          title: "Invoice (Pending Payment)",
          type: 'page',
          auth: true,
          icon: "file-invoice",
          role: ['admin', 'manager', 'sales', 'accounting'],
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
          title: "รายละเอียด Invoice",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'sales', 'accounting'],
        }
      },
      {
        path: 'invoice/:id/edit',
        name: `${slug}-invoice-edit`,
        component: () => import('./components/invoice/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'invoice-edit',
          title: "แก้ไข Invoice",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager', 'sales', 'accounting'],
        }
      },
      {
        path: 'invoice/:id/print',
        name: `${slug}-invoice-print`,
        component: () => import('./components/invoice/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'invoice-print',
          title: "พิมพ์ Invoice",
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "print",
          role: ['admin', 'manager', 'sales', 'accounting'],
        }
      },

      // === SALES ORDER (Approved Status - Ready for Production) ===
      {
        path: 'sales-order',
        name: `${slug}-sales-order`,
        component: () => import('./components/sales-order/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'sales-order',
          title: "Sales Order (Approved)",
          type: 'page',
          auth: true,
          icon: "shopping-cart",
          role: ['admin', 'manager', 'sales'],
        }
      },
      {
        path: 'sales-order/create',
        name: `${slug}-so-create`,
        component: () => import('./components/sales-order/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'so-create',
          title: "สร้าง Sales Order",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'sales'],
        }
      },
      {
        path: 'sales-order/:id',
        name: `${slug}-so-detail`,
        component: () => import('./components/sales-order/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'so-detail',
          title: "รายละเอียด Sales Order",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'sales'],
        }
      },
      {
        path: 'sales-order/:id/edit',
        name: `${slug}-so-edit`,
        component: () => import('./components/sales-order/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'so-edit',
          title: "แก้ไข Sales Order",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager', 'sales'],
        }
      },

      // === SALES INVOICE (Pending Payment Status) ===
      {
        path: 'sales-invoice',
        name: `${slug}-sales-invoice`,
        component: () => import('./components/sales-invoice/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'sales-invoice',
          title: "Sales Invoice (Pending Payment)",
          type: 'page',
          auth: true,
          icon: "file-invoice",
          role: ['admin', 'manager', 'sales', 'accounting'],
        }
      },

      // === CUSTOMER MANAGEMENT ===
      {
        path: 'customers',
        name: `${slug}-customers`,
        component: () => import('./components/customer/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'customers',
          title: "Customer Master",
          type: 'page',
          auth: true,
          icon: "users",
          role: ['admin', 'manager', 'sales'],
        }
      },
      {
        path: 'customers/create',
        name: `${slug}-customer-create`,
        component: () => import('./components/customer/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'customer-create',
          title: "เพิ่มลูกค้าใหม่",
          type: 'page',
          auth: true,
          icon: "user-plus",
          role: ['admin', 'manager', 'sales'],
        }
      },
      {
        path: 'customers/new',
        name: `${slug}-customer-new`,
        component: () => import('./components/customer/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'customer-new',
          title: "เพิ่มลูกค้าใหม่",
          type: 'page',
          auth: true,
          icon: "user-plus",
          role: ['admin', 'manager', 'sales'],
        }
      },
      {
        path: 'customers/add',
        name: `${slug}-customer-add`,
        component: () => import('./components/customer/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'customer-add',
          title: "เพิ่มลูกค้าใหม่",
          type: 'page',
          auth: true,
          icon: "user-plus",
          role: ['admin', 'manager', 'sales'],
        }
      },
      {
        path: 'customers/:id',
        name: `${slug}-customer-detail`,
        component: () => import('./components/customer/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'customer-detail',
          title: "รายละเอียดลูกค้า",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'sales'],
        }
      },
      {
        path: 'customers/:id/edit',
        name: `${slug}-customer-edit`,
        component: () => import('./components/customer/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'customer-edit',
          title: "แก้ไขข้อมูลลูกค้า",
          type: 'page',
          auth: true,
          icon: "user-edit",
          role: ['admin', 'manager', 'sales'],
        }
      },

      // === WORKFLOW ACTIONS ===
      {
        path: 'quotation/:id/approve',
        name: `${slug}-quotation-approve`,
        component: () => import('./components/quotation/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'quotation-approve',
          title: "อนุมัติใบเสนอราคา → Sales Order",
          type: 'page',
          auth: true,
          icon: "check",
          role: ['admin', 'manager'],
        }
      },
      {
        path: 'sales-order/:id/invoice',
        name: `${slug}-so-invoice`,
        component: () => import('./components/sales-order/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'so-invoice',
          title: "สร้างใบแจ้งหนี้จาก Sales Order",
          type: 'page',
          auth: true,
          icon: "file-invoice",
          role: ['admin', 'manager', 'sales', 'accounting'],
        }
      },

      // === PRINT FUNCTIONS ===
      {
        path: 'quotation/:id/print',
        name: `${slug}-quotation-print`,
        component: () => import('./components/quotation/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'quotation-print',
          title: "พิมพ์ใบเสนอราคา",
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "print",
          role: ['admin', 'manager', 'sales'],
        }
      },
      {
        path: 'sales-order/:id/print',
        name: `${slug}-so-print`,
        component: () => import('./components/sales-order/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'so-print',
          title: "พิมพ์ Sales Order",
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "print",
          role: ['admin', 'manager', 'sales'],
        }
      },
      {
        path: 'sales-invoice/:id/print',
        name: `${slug}-invoice-print`,
        component: () => import('./components/sales-invoice/Detail.vue'),
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
          role: ['admin', 'manager', 'sales', 'accounting'],
        }
      }
    ]
  }
]