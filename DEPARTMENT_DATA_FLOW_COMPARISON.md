# การเปรียบเทียบการดึงข้อมูล Department และ Position

## ภาพรวม
มี 2 วิธีในการดึงข้อมูลจาก `department_position_permission`:

1. **`getOrganizationChart(departmentId)`** - ใช้ใน Detail.vue และ OrganizationChart.vue
2. **`getDepartmentsWithPositions()`** - ใช้ใน Form.vue (User Management)

---

## 1. getOrganizationChart(departmentId)

### ใช้งานใน:
- `/components/departments/Detail.vue` (line 678)
- `/components/departments/OrganizationChart.vue` (line 353)

### วัตถุประสงค์:
ดึงโครงสร้างองค์กร (Org Chart) ของ **แผนกเดียว** พร้อม hierarchy

### Pipeline:
```javascript
const pipeline = [
  {
    $match: {
      department_id: departmentId  // 🔍 Filter เฉพาะแผนกที่ระบุ
    }
  },
  {
    $sort: {
      hierarchy_level: 1,
      created_at: 1
    }
  }
]
```

### ผลลัพธ์:
```javascript
// Array ของ positions ในแผนกนั้น (flat)
[
  {
    _id: "691f24b531a07a0dda282971",
    department_id: "6914ae7dd04c13d4086ccbdd",
    position_id: "691eca99d04c13d4086cccf5",
    position_code: "POS91775063",
    position_name: "ผู้จัดการทั่วไป",
    level: "manager",
    parent_position_id: null,
    hierarchy_level: 1,
    permissions: [...]
  },
  {
    _id: "691f24b531a07a0dda282972",
    position_name: "หัวหน้าฝ่าย",
    parent_position_id: "691f24b531a07a0dda282971",
    hierarchy_level: 2,
    ...
  }
]

// ↓ ผ่าน buildOrgChartTree() ↓

// Tree structure
[
  {
    id: "node_691f24b531a07a0dda282971",
    db_id: "691f24b531a07a0dda282971",
    position_id: "691eca99d04c13d4086cccf5",
    position_name: "ผู้จัดการทั่วไป",
    children: [
      {
        id: "node_691f24b531a07a0dda282972",
        position_name: "หัวหน้าฝ่าย",
        children: [...]
      }
    ]
  }
]
```

### การใช้งาน:
```javascript
// Detail.vue / OrganizationChart.vue
async loadOrganizationChart() {
  const departmentId = this.department.id || this.department._id
  this.orgChart = await window.ERP_CORE.departments.getOrganizationChart(departmentId)
  // orgChart = tree structure ของแผนกนั้น
}
```

---

## 2. getDepartmentsWithPositions()

### ใช้งานใน:
- `/components/user-management/Form.vue` (line 445)

### วัตถุประสงค์:
ดึงข้อมูล **ทุกแผนก** พร้อมตำแหน่งทั้งหมด เพื่อให้ user เลือก department และ position

### Pipeline:
```javascript
const pipeline = [
  // Step 1: Join departments
  {
    $lookup: {
      from: 'departments',
      localField: 'department_id',
      foreignField: '_id',
      as: 'department'
    }
  },
  { $unwind: { path: '$department' } },
  
  // Step 2: Join positions
  {
    $lookup: {
      from: 'positions',
      localField: 'position_id',
      foreignField: '_id',
      as: 'position'
    }
  },
  { $unwind: { path: '$position' } },
  
  // Step 3: Filter active departments only
  {
    $match: {
      'department.status': 'active'  // 🔍 เฉพาะแผนกที่ active
    }
  },
  
  // Step 4: Project fields
  {
    $project: {
      _id: 1,
      department_id: 1,
      position_id: 1,
      position_code: 1,
      position_name: 1,
      level: 1,
      parent_position_id: 1,
      hierarchy_level: 1,
      permissions: 1,
      department_code: '$department.code',      // ข้อมูลจาก join
      department_name: '$department.name',
      department_description: '$department.description',
      position_level: '$position.level',
      position_status: '$position.status'
    }
  },
  
  {
    $sort: {
      department_name: 1,
      hierarchy_level: 1
    }
  }
]
```

### ผลลัพธ์:
```javascript
// Array ของทุก department_position_permission พร้อมข้อมูล join
[
  {
    _id: "691f24b531a07a0dda282971",
    department_id: "6914ae7dd04c13d4086ccbdd",
    position_id: "691eca99d04c13d4086cccf5",
    position_code: "POS91775063",
    position_name: "ผู้จัดการทั่วไป",
    level: "manager",
    parent_position_id: null,
    hierarchy_level: 1,
    permissions: [...],
    // ข้อมูลจาก join
    department_code: "DEPT04392904",
    department_name: "Human Resource",
    department_description: "Human Resource Department",
    position_level: "manager",
    position_status: "active"
  },
  {
    // แผนกอื่น...
    department_id: "6914ae7dd04c13d4086ccddd",
    department_name: "Accounting",
    ...
  }
]

// ↓ ผ่าน groupPositionsByDepartment() ↓

// Grouped by department with tree
[
  {
    _id: "6914ae7dd04c13d4086ccbdd",
    code: "DEPT04392904",
    name: "Human Resource",
    description: "Human Resource Department",
    positions: [...],  // flat array
    positions_tree: [  // tree structure
      {
        id: "node_691f24b531a07a0dda282971",
        db_id: "691f24b531a07a0dda282971",
        position_name: "ผู้จัดการทั่วไป",
        children: [...]
      }
    ]
  },
  {
    _id: "6914ae7dd04c13d4086ccddd",
    code: "DEPT04392905",
    name: "Accounting",
    positions: [...],
    positions_tree: [...]
  }
]
```

### การใช้งาน:
```javascript
// Form.vue (User Management)
async loadDepartments() {
  const result = await window.ERP_CORE.departments.getDepartmentsWithPositions()
  
  if (result && Array.isArray(result)) {
    this.departments = result  // Array of departments
    
    // Pre-populate positions cache
    this.departments.forEach(dept => {
      if (dept.positions_tree) {
        this.$set(this.departmentPositionsCache, dept._id, dept.positions_tree)
      }
    })
  }
}
```

---

## เปรียบเทียบ

| ฟีเจอร์ | getOrganizationChart | getDepartmentsWithPositions |
|---------|---------------------|----------------------------|
| **Scope** | แผนกเดียว | ทุกแผนก (active) |
| **Input** | departmentId | - |
| **Join** | ไม่มี | departments + positions |
| **Output** | Tree structure | Array of departments with tree |
| **ใช้สำหรับ** | แสดง org chart ของแผนก | เลือกแผนก+ตำแหน่งให้ user |
| **ข้อมูลเพิ่มเติม** | - | department_code, department_name, position status |

---

## Data Flow ใน User Management Form

### 1. โหลดข้อมูลแผนก (Component Mounted)
```javascript
async mounted() {
  await this.loadDepartments()  // ← getDepartmentsWithPositions()
}
```

### 2. User เลือกแผนก
```javascript
toggleDepartment(deptId) {
  // เพิ่ม department_id ลง jobAssignments
  this.jobAssignments.push({
    department_id: deptId,
    position_id: ''  // ยังไม่ได้เลือก position
  })
}
```

### 3. แสดงรายการ Position
```javascript
getDepartmentPositions(deptId) {
  // ดึงจาก cache ที่โหลดไว้แล้ว
  return this.departmentPositionsCache[deptId]
  // = dept.positions_tree (tree structure)
}
```

### 4. User เลือก Position
```javascript
updateAssignment(deptId, positionId) {
  // positionId = db_id จาก department_position_permission
  const assignment = this.getAssignment(deptId)
  assignment.position_id = positionId
}
```

### 5. บันทึก User
```javascript
const erpUserData = {
  username: "john.doe",
  email: "john.doe@company.com",
  job_assignments: [
    {
      department_id: "6914ae7dd04c13d4086ccbdd",
      position_id: "691f24b531a07a0dda282971"  // db_id จาก department_position_permission
    }
  ]
}
```

---

## ข้อแตกต่างสำคัญ

### 1. **Department List vs Organization Chart**

**List.vue** (Department List):
- ดึงข้อมูลจาก `departments` collection เท่านั้น
- ไม่ได้ใช้ `department_position_permission`
- แสดงเป็นตาราง (table)

```javascript
// List.vue
const departments = await window.ERP_CORE.departments.getDepartments()
// departments = [{ _id, code, name, status, employees_count, ... }]
```

**Detail.vue / OrganizationChart.vue**:
- ดึง department info จาก `departments`
- ดึง org chart จาก `department_position_permission` (แผนกเดียว)
- แสดงเป็น tree (hierarchy)

```javascript
// Detail.vue / OrganizationChart.vue
this.department = await getDepartmentById(id)  // departments collection
this.orgChart = await getOrganizationChart(id)  // department_position_permission
```

**Form.vue** (User Management):
- ดึงทุกแผนกพร้อม positions จาก `department_position_permission` (ทุกแผนก)
- Join กับ departments และ positions
- แสดงเป็น checkbox + tree select

```javascript
// Form.vue
this.departments = await getDepartmentsWithPositions()
// departments = [
//   { _id, code, name, positions_tree: [...] },
//   { _id, code, name, positions_tree: [...] }
// ]
```

---

## สรุป

### getOrganizationChart(departmentId)
✅ ใช้เมื่อต้องการ org chart ของแผนกเดียว  
✅ ไม่ต้อง join ข้อมูล  
✅ Focused และเร็ว  
❌ ไม่มีข้อมูล department/position master  

### getDepartmentsWithPositions()
✅ ใช้เมื่อต้องการทุกแผนกพร้อม positions  
✅ มีข้อมูล department/position master จาก join  
✅ Pre-grouped และ pre-build tree  
❌ ดึงข้อมูลเยอะกว่า (ทุกแผนก)  

### การเลือกใช้:
- **Department Detail/Org Chart** → `getOrganizationChart(id)` (แผนกเดียว)
- **User Assignment/Selection** → `getDepartmentsWithPositions()` (ทุกแผนก)
