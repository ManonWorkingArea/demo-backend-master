const slug = "delivery";
const title = "Delivery";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "ระบบจัดการการจัดส่งสินค้า ครอบคลุมกระบวนการ Delivery Request → Pick & Pack → Shipment Tracking → Delivery Confirmation",
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
      icon: "truck",
      role: ['admin', 'manager', 'delivery', 'warehouse', 'sales'],
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
          role: ['admin', 'manager', 'delivery', 'warehouse', 'sales'],
        }
      },

      // === DELIVERY REQUEST ===
      {
        path: 'delivery-request',
        name: `${slug}-delivery-request`,
        component: () => import('./components/delivery-request/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'delivery-request',
          title: "Delivery Request",
          type: 'page',
          auth: true,
          icon: "file-plus",
          role: ['admin', 'manager', 'delivery', 'warehouse', 'sales'],
        }
      },
      {
        path: 'detail/:id',
        name: `${slug}-detail`,
        component: () => import('./components/delivery-request/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'delivery-detail',
          title: "รายละเอียดใบจัดส่ง",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'delivery', 'warehouse', 'sales'],
        }
      },
      {
        path: 'delivery-queue',
        name: `${slug}-delivery-queue`,
        component: () => import('./components/delivery-queue/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'delivery-queue',
          title: "คิวจัดส่งสินค้า",
          type: 'page',
          auth: true,
          icon: "truck-loading",
          role: ['admin', 'manager', 'delivery', 'warehouse'],
        }
      },
      {
        path: 'delivery-request/create',
        name: `${slug}-request-create`,
        component: () => import('./components/delivery-request/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'request-create',
          title: "สร้างคำสั่งจัดส่ง",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'delivery', 'warehouse', 'sales'],
        }
      },
      {
        path: 'delivery-request/from-do/:doId',
        name: `${slug}-request-from-do`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'request-from-do',
          title: "สร้างจาก Delivery Order",
          type: 'page',
          auth: true,
          icon: "file-import",
          role: ['admin', 'manager', 'delivery', 'warehouse'],
        }
      },
      {
        path: 'delivery-request/:id',
        name: `${slug}-request-detail`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'request-detail',
          title: "รายละเอียดคำสั่งจัดส่ง",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'delivery', 'warehouse', 'sales'],
        }
      },
      {
        path: 'delivery-request/:id/edit',
        name: `${slug}-request-edit`,
        component: () => import('./components/delivery-request/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'request-edit',
          title: "แก้ไขคำสั่งจัดส่ง",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager', 'delivery', 'warehouse'],
        }
      },
      {
        path: 'delivery-request/:id/approve',
        name: `${slug}-request-approve`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'request-approve',
          title: "อนุมัติคำสั่งจัดส่ง",
          type: 'page',
          auth: true,
          icon: "check",
          role: ['admin', 'manager'],
        }
      },

      // === PICK & PACK ===
      {
        path: 'pick-pack',
        name: `${slug}-pick-pack`,
        component: () => import('./components/pick-pack/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'pick-pack',
          title: "Pick & Pack",
          type: 'page',
          auth: true,
          icon: "boxes",
          role: ['admin', 'manager', 'delivery', 'warehouse'],
        }
      },
      {
        path: 'pick-pack/queue',
        name: `${slug}-pick-queue`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'pick-queue',
          title: "คิวการเบิกสินค้า",
          type: 'page',
          auth: true,
          icon: "list-alt",
          role: ['admin', 'manager', 'delivery', 'warehouse'],
        }
      },
      {
        path: 'pick-pack/:id/picking',
        name: `${slug}-picking`,
        component: () => import('./components/pick-pack/Picking.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'picking',
          title: "เบิกสินค้า",
          type: 'page',
          auth: true,
          icon: "hand-paper",
          role: ['admin', 'manager', 'delivery', 'warehouse'],
        }
      },
      {
        path: 'pick-pack/:id/packing',
        name: `${slug}-packing`,
        component: () => import('./components/pick-pack/Packing.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'packing',
          title: "แพ็กสินค้า",
          type: 'page',
          auth: true,
          icon: "box",
          role: ['admin', 'manager', 'delivery', 'warehouse'],
        }
      },
      {
        path: 'pick-pack/:id/scan',
        name: `${slug}-scan-items`,
        component: () => import('./components/pick-pack/Scan.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'scan-items',
          title: "สแกนสินค้า",
          type: 'page',
          auth: true,
          icon: "qrcode",
          role: ['admin', 'manager', 'delivery', 'warehouse'],
        }
      },
      {
        path: 'pick-pack/:id/tracking-setup',
        name: `${slug}-tracking-setup`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'tracking-setup',
          title: "ระบุ Tracking Number",
          type: 'page',
          auth: true,
          icon: "barcode",
          role: ['admin', 'manager', 'delivery', 'warehouse'],
        }
      },

      // === SHIPMENT TRACKING ===
      {
        path: 'shipment-tracking',
        name: `${slug}-shipment-tracking`,
        component: () => import('./components/shipment-tracking/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'shipment-tracking',
          title: "Shipment Tracking",
          type: 'page',
          auth: true,
          icon: "map-marked-alt",
          role: ['admin', 'manager', 'delivery', 'warehouse', 'sales', 'customer'],
        }
      },
      {
        path: 'shipment-tracking/:trackingNumber',
        name: `${slug}-tracking-detail`,
        component: () => import('./components/shipment-tracking/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'tracking-detail',
          title: "รายละเอียดการจัดส่ง",
          type: 'page',
          auth: false,
          icon: "route",
          role: ['admin', 'manager', 'delivery', 'warehouse', 'sales', 'customer'],
        }
      },
      {
        path: 'shipment-tracking/:id/update-status',
        name: `${slug}-update-status`,
        component: () => import('./components/shipment-tracking/Update.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'update-status',
          title: "อัพเดทสถานะ",
          type: 'page',
          auth: true,
          icon: "sync-alt",
          role: ['admin', 'manager', 'delivery'],
        }
      },
      {
        path: 'shipment-tracking/:id/shipped',
        name: `${slug}-mark-shipped`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'mark-shipped',
          title: "ระบุส่งแล้ว",
          type: 'page',
          auth: true,
          icon: "shipping-fast",
          role: ['admin', 'manager', 'delivery'],
        }
      },
      {
        path: 'shipment-tracking/:id/in-transit',
        name: `${slug}-in-transit`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'in-transit',
          title: "กำลังขนส่ง",
          type: 'page',
          auth: true,
          icon: "truck-moving",
          role: ['admin', 'manager', 'delivery'],
        }
      },
      {
        path: 'shipment-tracking/:id/out-for-delivery',
        name: `${slug}-out-for-delivery`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'out-for-delivery',
          title: "ออกจัดส่ง",
          type: 'page',
          auth: true,
          icon: "truck",
          role: ['admin', 'manager', 'delivery'],
        }
      },

      // === DELIVERY CONFIRMATION ===
      {
        path: 'delivery-confirmation',
        name: `${slug}-delivery-confirmation`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'delivery-confirmation',
          title: "Delivery Confirmation",
          type: 'page',
          auth: true,
          icon: "check-circle",
          role: ['admin', 'manager', 'delivery', 'customer'],
        }
      },
      {
        path: 'delivery-confirmation/:id',
        name: `${slug}-confirmation-detail`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'confirmation-detail',
          title: "รายละเอียดการรับสินค้า",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'delivery', 'customer'],
        }
      },
      {
        path: 'delivery-confirmation/:id/confirm',
        name: `${slug}-confirm-delivery`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'confirm-delivery',
          title: "ยืนยันการรับสินค้า",
          type: 'page',
          auth: true,
          icon: "signature",
          role: ['admin', 'manager', 'delivery', 'customer'],
        }
      },
      {
        path: 'delivery-confirmation/:id/signature',
        name: `${slug}-signature`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'signature',
          title: "ลายเซ็นรับสินค้า",
          type: 'page',
          auth: true,
          icon: "pen-fancy",
          role: ['admin', 'manager', 'delivery', 'customer'],
        }
      },
      {
        path: 'delivery-confirmation/:id/photo-proof',
        name: `${slug}-photo-proof`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'photo-proof',
          title: "หลักฐานภาพถ่าย",
          type: 'page',
          auth: true,
          icon: "camera",
          role: ['admin', 'manager', 'delivery'],
        }
      },
      {
        path: 'delivery-confirmation/:id/close-job',
        name: `${slug}-close-job`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'close-job',
          title: "ปิดงานจัดส่ง",
          type: 'page',
          auth: true,
          icon: "check-double",
          role: ['admin', 'manager', 'delivery'],
        }
      },

      // === ROUTE PLANNING & OPTIMIZATION ===  
      {
        path: 'route-planning',
        name: `${slug}-route-planning`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'route-planning',
          title: "Route Planning",
          type: 'page',
          auth: true,
          icon: "route",
          role: ['admin', 'manager', 'delivery'],
        }
      },
      {
        path: 'route-planning/create',
        name: `${slug}-route-create`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'route-create',
          title: "สร้างเส้นทาง",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager', 'delivery'],
        }
      },
      {
        path: 'route-planning/:id/optimize',
        name: `${slug}-route-optimize`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'route-optimize',
          title: "เพิ่มประสิทธิภาพเส้นทาง",
          type: 'page',
          auth: true,
          icon: "magic",
          role: ['admin', 'manager', 'delivery'],
        }
      },

      // === VEHICLE & DRIVER MANAGEMENT ===
      {
        path: 'vehicle-management',
        name: `${slug}-vehicle-management`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'vehicle-management',
          title: "Vehicle & Driver",
          type: 'page',
          auth: true,
          icon: "car",
          role: ['admin', 'manager', 'delivery'],
        }
      },
      {
        path: 'vehicle-management/vehicles',
        name: `${slug}-vehicles`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'vehicles',
          title: "จัดการรถขนส่ง",
          type: 'page',
          auth: true,
          icon: "truck",
          role: ['admin', 'manager'],
        }
      },
      {
        path: 'vehicle-management/drivers',
        name: `${slug}-drivers`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'drivers',
          title: "จัดการคนขับ",
          type: 'page',
          auth: true,
          icon: "user-tie",
          role: ['admin', 'manager'],
        }
      },

      // === REPORTS & ANALYTICS ===
      {
        path: 'reports',
        name: `${slug}-reports`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'reports',
          title: "Reports & Analytics",
          type: 'page',
          auth: true,
          icon: "chart-bar",
          role: ['admin', 'manager', 'delivery'],
        }
      },

      // === SETTINGS ===
      {
        path: 'settings',
        name: `${slug}-settings`,
        component: () => import('./shared/DeliveryManager.vue'),
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

      // === PRINT & EXPORT ===
      {
        path: 'delivery-request/:id/print',
        name: `${slug}-request-print`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'request-print',
          title: "พิมพ์คำสั่งจัดส่ง",
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "print",
          role: ['admin', 'manager', 'delivery', 'warehouse'],
        }
      },
      {
        path: 'pick-pack/:id/pick-list-print',
        name: `${slug}-pick-list-print`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'pick-list-print',
          title: "พิมพ์ใบเบิกสินค้า",
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "print",
          role: ['admin', 'manager', 'delivery', 'warehouse'],
        }
      },
      {
        path: 'shipment-tracking/:id/label-print',
        name: `${slug}-label-print`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'label-print',
          title: "พิมพ์ป้ายจัดส่ง",
          type: 'page',
          auth: false,
          mode: 'blank',
          icon: "print",
          role: ['admin', 'manager', 'delivery', 'warehouse'],
        }
      },

      // === PUBLIC TRACKING (Customer Access) ===
      {
        path: 'track/:trackingNumber',
        name: `${slug}-public-tracking`,
        component: () => import('./shared/DeliveryManager.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'public-tracking',
          title: "ติดตามพัสดุ",
          type: 'page',
          auth: false,
          icon: "search",
          role: ['admin', 'manager', 'delivery', 'warehouse', 'sales', 'customer'],
        }
      }
    ]
  }
]