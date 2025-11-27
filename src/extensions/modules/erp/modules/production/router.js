const slug = "production";
const title = "Production";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "ระบบควบคุมงานผลิต ตั้งแต่แผนจนถึงสินค้าเสร็จ",
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
      icon: "industry",
      role: ['admin', 'manager', 'production', 'manufacturing', 'quality'],
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
          role: ['admin', 'manager', 'production'],
        }
      },

      // === PRODUCTION PLAN ===
      {
        path: 'production-plan',
        name: `${slug}-production-plan`,
        component: () => import('./components/production-plan/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'production-plan',
          title: "Production Plan",
          type: 'page',
          auth: true,
          icon: "calendar-alt",
          role: ['admin', 'manager', 'production'],
        }
      },
      {
        path: 'production-plan/create',
        name: `${slug}-plan-create`,
        component: () => import('./components/production-plan/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'plan-create',
          title: "สร้างแผนผลิต",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'production'],
        }
      },
      {
        path: 'production-plan/:id',
        name: `${slug}-plan-detail`,
        component: () => import('./components/production-plan/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'plan-detail',
          title: "รายละเอียดแผนผลิต",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'production'],
        }
      },
      {
        path: 'production-plan/:id/edit',
        name: `${slug}-plan-edit`,
        component: () => import('./components/production-plan/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'plan-edit',
          title: "แก้ไขแผนผลิต",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager', 'production'],
        }
      },

      // === WORK ORDER ===
      {
        path: 'work-orders',
        name: `${slug}-work-orders`,
        component: () => import('./components/work-order/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'work-orders',
          title: "Work Orders",
          type: 'page',
          auth: true,
          icon: "clipboard-list",
          role: ['admin', 'manager', 'production', 'manufacturing'],
        }
      },
      {
        path: 'work-orders/manage',
        name: `${slug}-work-orders-manage`,
        component: () => import('./shared/WorkOrderManager.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'work-orders-manage',
          title: "จัดการ Work Orders",
          type: 'page',
          auth: true,
          icon: "tasks",
          role: ['admin', 'manager', 'production', 'manufacturing'],
        }
      },
      {
        path: 'work-order',
        name: `${slug}-work-order`,
        component: () => import('./shared/WorkOrderList.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'work-order',
          title: "Work Order",
          type: 'page',
          auth: true,
          icon: "clipboard-list",
          role: ['admin', 'manager', 'production', 'manufacturing'],
        }
      },
      {
        path: 'work-order/create',
        name: `${slug}-wo-create`,
        component: () => import('./components/work-order/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'wo-create',
          title: "สร้างคำสั่งผลิต",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'production'],
        }
      },
      {
        path: 'work-order/:id',
        name: `${slug}-wo-detail`,
        component: () => import('./components/work-order/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'wo-detail',
          title: "รายละเอียดคำสั่งผลิต",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'production', 'manufacturing'],
        }
      },
      {
        path: 'work-order/:id/edit',
        name: `${slug}-wo-edit`,
        component: () => import('./components/work-order/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'wo-edit',
          title: "แก้ไขคำสั่งผลิต",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager', 'production'],
        }
      },
      {
        path: 'work-order/:id/materials',
        name: `${slug}-wo-materials`,
        component: () => import('./components/work-order/Materials.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'wo-materials',
          title: "วัตถุดิบคำสั่งผลิต",
          type: 'page',
          auth: true,
          icon: "boxes",
          role: ['admin', 'manager', 'production', 'warehouse'],
        }
      },

      // === PRODUCTION PROGRESS ===
      {
        path: 'production-progress',
        name: `${slug}-production-progress`,
        component: () => import('./components/production-progress/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'production-progress',
          title: "Production Progress",
          type: 'page',
          auth: true,
          icon: "tasks",
          role: ['admin', 'manager', 'production', 'manufacturing'],
        }
      },
      {
        path: 'production-progress/:workOrderId',
        name: `${slug}-progress-detail`,
        component: () => import('./components/production-progress/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'progress-detail',
          title: "ความคืบหน้าการผลิต",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'production', 'manufacturing'],
        }
      },
      {
        path: 'production-progress/:workOrderId/update',
        name: `${slug}-progress-update`,
        component: () => import('./components/production-progress/Update.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'progress-update',
          title: "อัปเดตความคืบหน้า",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager', 'production', 'manufacturing'],
        }
      },
      {
        path: 'production-progress/step/:stepId',
        name: `${slug}-step-detail`,
        component: () => import('./shared/ProductionManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'step-detail',
          title: "รายละเอียดขั้นตอน",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'production', 'manufacturing'],
        }
      },

      // === PRODUCTION RESULT / FG OUTPUT ===
      {
        path: 'production-result',
        name: `${slug}-production-result`,
        component: () => import('./components/production-result/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'production-result',
          title: "Production Result / FG Output",
          type: 'page',
          auth: true,
          icon: "check-circle",
          role: ['admin', 'manager', 'production', 'quality'],
        }
      },
      {
        path: 'production-result/:workOrderId',
        name: `${slug}-result-detail`,
        component: () => import('./components/production-result/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'result-detail',
          title: "ผลผลิตรายการ",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'production', 'quality'],
        }
      },
      {
        path: 'production-result/:workOrderId/fg-lot',
        name: `${slug}-fg-lot`,
        component: () => import('./shared/ProductionManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'fg-lot',
          title: "FG Lot Management",
          type: 'page',
          auth: true,
          icon: "tag",
          role: ['admin', 'manager', 'production', 'warehouse'],
        }
      },
      {
        path: 'production-result/defect-analysis',
        name: `${slug}-defect-analysis`,
        component: () => import('./shared/ProductionManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'defect-analysis',
          title: "Defect Rate Analysis",
          type: 'page',
          auth: true,
          icon: "exclamation-triangle",
          role: ['admin', 'manager', 'production', 'quality'],
        }
      },

      // === PRODUCTION QC ===
      {
        path: 'production-qc',
        name: `${slug}-production-qc`,
        component: () => import('./components/production-qc/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'production-qc',
          title: "Production QC",
          type: 'page',
          auth: true,
          icon: "search",
          role: ['admin', 'manager', 'quality'],
        }
      },
      {
        path: 'production-qc/inspection',
        name: `${slug}-qc-inspection`,
        component: () => import('./components/production-qc/Inspection.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'qc-inspection',
          title: "ตรวจคุณภาพ",
          type: 'page',
          auth: true,
          icon: "search-plus",
          role: ['admin', 'manager', 'quality'],
        }
      },
      {
        path: 'production-qc/:inspectionId',
        name: `${slug}-qc-detail`,
        component: () => import('./components/production-qc/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'qc-detail',
          title: "รายละเอียดการตรวจ",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'quality'],
        }
      },
      {
        path: 'production-qc/:inspectionId/certificate',
        name: `${slug}-qc-certificate`,
        component: () => import('./shared/ProductionManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'qc-certificate',
          title: "ใบ QC Certificate",
          type: 'page',
          auth: true,
          icon: "certificate",
          role: ['admin', 'manager', 'quality'],
        }
      },
      {
        path: 'production-qc/standards',
        name: `${slug}-qc-standards`,
        component: () => import('./shared/ProductionManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'qc-standards',
          title: "มาตรฐานคุณภาพ",
          type: 'page',
          auth: true,
          icon: "ruler",
          role: ['admin', 'manager', 'quality'],
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
          role: ['admin', 'manager', 'production'],
        }
      },

      // === SETTINGS ===
      {
        path: 'settings',
        name: `${slug}-settings`,
        component: () => import('./components/settings/List.vue'),
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
        path: 'production-plan/:id/approve',
        name: `${slug}-plan-approve`,
        component: () => import('./shared/ProductionManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'plan-approve',
          title: "อนุมัติแผนผลิต",
          type: 'page',
          auth: true,
          icon: "check",
          role: ['admin', 'manager'],
        }
      },
      {
        path: 'work-order/:id/release',
        name: `${slug}-wo-release`,
        component: () => import('./shared/ProductionManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'wo-release',
          title: "ปล่อยคำสั่งผลิต",
          type: 'page',
          auth: true,
          icon: "play",
          role: ['admin', 'manager', 'production'],
        }
      },
      {
        path: 'work-order/:id/complete',
        name: `${slug}-wo-complete`,
        component: () => import('./shared/ProductionManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'wo-complete',
          title: "ปิดคำสั่งผลิต",
          type: 'page',
          auth: true,
          icon: "flag-checkered",
          role: ['admin', 'manager', 'production'],
        }
      },

      // === PRINT & EXPORT ===
      {
        path: 'work-order/:id/print',
        name: `${slug}-wo-print`,
        component: () => import('./shared/ProductionManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'wo-print',
          title: "พิมพ์คำสั่งผลิต",
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "print",
          role: ['admin', 'manager', 'production', 'manufacturing'],
        }
      },
      {
        path: 'production-qc/:inspectionId/print',
        name: `${slug}-qc-print`,
        component: () => import('./shared/ProductionManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'qc-print',
          title: "พิมพ์ใบ QC",
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "print",
          role: ['admin', 'manager', 'quality'],
        }
      },

      // === SEARCH & FILTER ===
      {
        path: 'search/:keyword',
        name: `${slug}-search`,
        component: () => import('./shared/ProductionManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'search',
          title: "ผลการค้นหา",
          type: 'page',
          auth: false,
          icon: "search",
          role: ['admin', 'manager', 'production', 'manufacturing', 'quality'],
        }
      }
    ]
  }
]