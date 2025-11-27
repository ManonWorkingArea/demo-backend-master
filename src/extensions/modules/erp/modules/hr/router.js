const slug = "hr";
const title = "Human Resources";

export default [
  {
    path: `/${slug}`,
    name: `${slug}`,
    redirect: `/${slug}/dashboard`,
    description: "ระบบจัดการทรัพยากรบุคคล ครอบคลุม Employee Management → User Management → Departments → Positions → Settings",
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
      icon: "users",
      role: ['admin', 'manager', 'hr', 'supervisor'],
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
          role: ['admin', 'manager', 'hr', 'supervisor'],
        }
      },

      // === EMPLOYEE MANAGEMENT ===
      {
        path: 'employees',
        name: `${slug}-employees`,
        component: () => import('./components/employees/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'employees',
          title: "Employee Management",
          type: 'page',
          auth: true,
          icon: "id-badge",
          role: ['admin', 'manager', 'hr'],
        }
      },
      {
        path: 'employees/create',
        name: `${slug}-employee-create`,
        component: () => import('./components/employees/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'employee-create',
          title: "เพิ่มพนักงานใหม่",
          type: 'page',
          auth: true,
          icon: "user-plus",
          role: ['admin', 'manager', 'hr'],
        }
      },
      {
        path: 'employees/:id',
        name: `${slug}-employee-detail`,
        component: () => import('./components/employees/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'employee-detail',
          title: "รายละเอียดพนักงาน",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'hr', 'supervisor'],
        }
      },
      {
        path: 'employees/:id/edit',
        name: `${slug}-employee-edit`,
        component: () => import('./components/employees/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'employee-edit',
          title: "แก้ไขข้อมูลพนักงาน",
          type: 'page',
          auth: true,
          icon: "user-edit",
          role: ['admin', 'manager', 'hr'],
        }
      },

      // === USER MANAGEMENT ===
      {
        path: 'user-management',
        name: `${slug}-user-management`,
        component: () => import('./components/user-management/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'user-management',
          title: "User Management",
          type: 'page',
          auth: true,
          icon: "users-cog",
          role: ['admin', 'manager'],
        }
      },
      {
        path: 'user-management/create',
        name: `${slug}-user-create`,
        component: () => import('./components/user-management/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'user-create',
          title: "สร้าง User Account",
          type: 'page',
          auth: true,
          icon: "user-plus",
          role: ['admin', 'manager'],
        }
      },
      {
        path: 'user-management/:id',
        name: `${slug}-user-detail`,
        component: () => import('./components/user-management/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'user-detail',
          title: "รายละเอียด User",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager'],
        }
      },
      {
        path: 'user-management/:id/edit',
        name: `${slug}-user-edit`,
        component: () => import('./components/user-management/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'user-edit',
          title: "แก้ไข User Account",
          type: 'page',
          auth: true,
          icon: "user-edit",
          role: ['admin', 'manager'],
        }
      },
      {
        path: 'user-management/:id/permissions',
        name: `${slug}-user-permissions`,
        component: () => import('./components/user-management/Permissions.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'user-permissions',
          title: "จัดการสิทธิ์ User",
          type: 'page',
          auth: true,
          icon: "key",
          role: ['admin'],
        }
      },

      // === DEPARTMENTS & POSITIONS ===
      {
        path: 'departments',
        name: `${slug}-departments`,
        component: () => import('./components/departments/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'departments',
          title: "Department Management",
          type: 'page',
          auth: true,
          icon: "sitemap",
          role: ['admin', 'manager', 'hr'],
        }
      },
      {
        path: 'departments/create',
        name: `${slug}-department-create`,
        component: () => import('./components/departments/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'department-create',
          title: "เพิ่มแผนก/ฝ่าย",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager'],
        }
      },
      {
        path: 'departments/:id',
        name: `${slug}-department-detail`,
        component: () => import('./components/departments/Detail.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'department-detail',
          title: "รายละเอียดแผนก/ฝ่าย",
          type: 'page',
          auth: true,
          icon: "eye",
          role: ['admin', 'manager', 'hr'],
        }
      },
      {
        path: 'departments/:id/edit',
        name: `${slug}-department-edit`,
        component: () => import('./components/departments/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'department-edit',
          title: "แก้ไขแผนก/ฝ่าย",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager'],
        }
      },
      {
        path: 'departments/:id/org-chart',
        name: `${slug}-department-org-chart`,
        component: () => import('./components/departments/OrganizationChart.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'department-org-chart',
          title: "จัดผังองค์กร",
          type: 'page',
          auth: true,
          icon: "sitemap",
          role: ['admin', 'manager'],
        }
      },

      {
        path: 'positions',
        name: `${slug}-positions`,
        component: () => import('./components/positions/List.vue'),
        meta: {
          inMenu: true,
          parent: slug,
          main: title,
          key: 'positions',
          title: "Position Management",
          type: 'page',
          auth: true,
          icon: "briefcase",
          role: ['admin', 'manager', 'hr'],
        }
      },
      {
        path: 'positions/create',
        name: `${slug}-position-create`,
        component: () => import('./components/positions/Create.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'position-create',
          title: "เพิ่มตำแหน่งงาน",
          type: 'page',
          auth: true,
          icon: "plus",
          role: ['admin', 'manager'],
        }
      },
      {
        path: 'positions/:id/edit',
        name: `${slug}-position-edit`,
        component: () => import('./components/positions/Edit.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'position-edit',
          title: "แก้ไขตำแหน่งงาน",
          type: 'page',
          auth: true,
          icon: "edit",
          role: ['admin', 'manager'],
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
          title: "HR Settings",
          type: 'page',
          auth: true,
          icon: "cog",
          role: ['admin'],
        }
      },
      {
        path: 'settings/work-schedule',
        name: `${slug}-work-schedule`,
        component: () => import('./components/settings/WorkSchedule.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'work-schedule',
          title: "ตั้งค่าเวลาทำงาน",
          type: 'page',
          auth: true,
          icon: "clock",
          role: ['admin'],
        }
      },
      {
        path: 'settings/salary-structure',
        name: `${slug}-salary-structure`,
        component: () => import('./components/settings/SalaryStructure.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'salary-structure',
          title: "โครงสร้างเงินเดือน",
          type: 'page',
          auth: true,
          icon: "money-check",
          role: ['admin'],
        }
      },
      {
        path: 'settings/holidays',
        name: `${slug}-holidays`,
        component: () => import('./components/settings/Holidays.vue'),
        meta: {
          inMenu: false,
          parent: slug,
          main: title,
          key: 'holidays',
          title: "วันหยุดนักขัตฤกษ์",
          type: 'page',
          auth: true,
          icon: "calendar",
          role: ['admin'],
        }
      }
    ]
  }
]