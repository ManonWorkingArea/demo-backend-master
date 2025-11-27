# User Department & Position Integration Guide

## ภาพรวม
ระบบจัดการ User โดยดึงข้อมูลจาก `department_position_permission` collection และ join กับ `departments` และ `positions` เพื่อแสดงตำแหน่งพร้อม permissions ในแต่ละแผนก

## โครงสร้างข้อมูล

### 1. department_position_permission Collection
```json
{
  "_id": "691f24b531a07a0dda282971",
  "department_id": "6914ae7dd04c13d4086ccbdd",
  "position_id": "691eca99d04c13d4086cccf5",
  "position_code": "POS91775063",
  "position_name": "ผู้จัดการทั่วไป",
  "level": "manager",
  "parent_position_id": null,
  "hierarchy_level": 1,
  "permissions": [
    {
      "module": "hr",
      "menu_key": "employees",
      "menu_title": "employees",
      "read": true,
      "write": true,
      "visible": true
    }
    // ... more permissions
  ],
  "createdAt": "2025-11-20T14:24:53.400Z",
  "updatedAt": "2025-11-20T14:28:48.024Z"
}
```

### 2. departments Collection
```json
{
  "_id": "6914ae7dd04c13d4086ccbdd",
  "code": "DEPT04392904",
  "name": "Human Resource",
  "description": "Human Resource Department",
  "status": "active",
  "module_access": [
    {
      "module": "hr",
      "access": true,
      "menus": ["employees", "user-management", "departments", ...]
    }
  ]
}
```

### 3. positions Collection
```json
{
  "_id": "691eca99d04c13d4086cccf5",
  "code": "POS91775063",
  "name": "ผู้จัดการทั่วไป",
  "level": "manager",
  "status": "active"
}
```

## การทำงาน

### Backend Service - DepartmentService.js

#### getDepartmentsWithPositions()
ดึงข้อมูลแผนกพร้อมตำแหน่งทั้งหมดผ่าน aggregate pipeline:

```javascript
const pipeline = [
  // Step 1: Lookup departments
  {
    $lookup: {
      from: 'departments',
      localField: 'department_id',
      foreignField: '_id',
      as: 'department'
    }
  },
  {
    $unwind: {
      path: '$department',
      preserveNullAndEmptyArrays: false
    }
  },
  // Step 2: Lookup positions
  {
    $lookup: {
      from: 'positions',
      localField: 'position_id',
      foreignField: '_id',
      as: 'position'
    }
  },
  {
    $unwind: {
      path: '$position',
      preserveNullAndEmptyArrays: false
    }
  },
  // Step 3: Filter active departments
  {
    $match: {
      'department.status': 'active'
    }
  },
  // Step 4: Project needed fields
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
      department_code: '$department.code',
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

#### ผลลัพธ์ที่ได้
```javascript
[
  {
    _id: "6914ae7dd04c13d4086ccbdd",
    code: "DEPT04392904",
    name: "Human Resource",
    description: "Human Resource Department",
    positions: [
      {
        _id: "691f24b531a07a0dda282971",
        db_id: "691f24b531a07a0dda282971",
        position_id: "691eca99d04c13d4086cccf5",
        position_code: "POS91775063",
        position_name: "ผู้จัดการทั่วไป",
        level: "manager",
        parent_position_id: null,
        hierarchy_level: 1,
        permissions: [...]
      }
    ],
    positions_tree: [
      {
        id: "node_691f24b531a07a0dda282971",
        db_id: "691f24b531a07a0dda282971",
        position_id: "691eca99d04c13d4086cccf5",
        position_code: "POS91775063",
        position_name: "ผู้จัดการทั่วไป",
        level: "manager",
        permissions: [...],
        children: [...]
      }
    ]
  }
]
```

### Frontend - Form.vue

#### การโหลดข้อมูล
```javascript
async loadDepartments() {
  const result = await window.ERP_CORE.departments.getDepartmentsWithPositions()
  
  if (result && Array.isArray(result)) {
    this.departments = result
    
    // Pre-populate positions cache
    this.departments.forEach(dept => {
      if (dept.positions_tree) {
        this.$set(this.departmentPositionsCache, dept._id, dept.positions_tree)
      }
    })
  }
}
```

#### การจัดการ Department Assignment
```javascript
// เลือก/ยกเลิกแผนก
toggleDepartment(deptId) {
  const index = this.jobAssignments.findIndex(ja => ja.department_id === deptId)
  if (index === -1) {
    // Add
    this.jobAssignments.push({
      department_id: deptId,
      position_id: ''
    })
    this.loadDepartmentPositions(deptId)
  } else {
    // Remove
    this.jobAssignments.splice(index, 1)
  }
}

// อัพเดทตำแหน่ง
updateAssignment(deptId, positionId) {
  const assignment = this.getAssignment(deptId)
  if (assignment) {
    assignment.position_id = positionId
  }
}
```

#### การบันทึกข้อมูล User
```javascript
const erpUserData = {
  user_id: result.data._id,
  username: userData.username,
  email: userData.email,
  firstname: userData.firstname,
  lastname: userData.lastname,
  phone: userData.phone,
  role: userData.role,
  // Department assignments with positions
  job_assignments: this.jobAssignments, // [{ department_id, position_id }, ...]
  status: 'active'
}
```

## API Endpoints

### GET /department_position_permission/aggregate
ดึงข้อมูล department + position + permissions

**Request:**
```json
{
  "pipeline": [...],
  "collection": "department_position_permission"
}
```

**Response:**
```json
[
  {
    "_id": "691f24b531a07a0dda282971",
    "department_id": "6914ae7dd04c13d4086ccbdd",
    "position_id": "691eca99d04c13d4086cccf5",
    "position_code": "POS91775063",
    "position_name": "ผู้จัดการทั่วไป",
    "permissions": [...],
    "department_code": "DEPT04392904",
    "department_name": "Human Resource"
  }
]
```

## Template Structure

```vue
<template>
  <div class="department-selection">
    <div 
      v-for="dept in departments" 
      :key="dept._id" 
      class="department-item"
    >
      <!-- Department Checkbox -->
      <label class="department-checkbox">
        <input 
          type="checkbox" 
          :checked="isDepartmentSelected(dept._id)"
          @change="toggleDepartment(dept._id)"
        />
        <span>{{ dept.name }} ({{ dept.code }})</span>
      </label>

      <!-- Position Selection (Only if selected) -->
      <div v-if="isDepartmentSelected(dept._id)">
        <position-tree
          :nodes="getDepartmentPositions(dept._id)"
          :value="getAssignment(dept._id).position_id"
          @input="updateAssignment(dept._id, $event)"
        />
      </div>
    </div>
  </div>
</template>
```

## ข้อมูลที่เก็บในระบบ

### ERP users Collection
```json
{
  "_id": "user123",
  "username": "john.doe@company.com",
  "email": "john.doe@company.com",
  "firstname": "John",
  "lastname": "Doe",
  "job_assignments": [
    {
      "department_id": "6914ae7dd04c13d4086ccbdd",
      "position_id": "691f24b531a07a0dda282971"  // db_id from department_position_permission
    }
  ]
}
```

## ประโยชน์

1. **Permissions-Based**: ตำแหน่งที่แสดงมี permissions ที่กำหนดไว้แล้ว
2. **Hierarchical Structure**: แสดงโครงสร้างตำแหน่งแบบ tree (parent-child)
3. **Department Context**: รู้ว่าแต่ละตำแหน่งอยู่ในแผนกไหน
4. **Pre-configured Access**: เมื่อ assign ตำแหน่งให้ user จะได้ permissions มาด้วยอัตโนมัติ

## การใช้งาน

1. เมื่อสร้าง/แก้ไข user ระบบจะดึงข้อมูลจาก `department_position_permission`
2. แสดงรายการแผนกพร้อมตำแหน่งในรูปแบบ tree
3. User เลือกแผนกและตำแหน่งที่ต้องการ
4. บันทึกเป็น `job_assignments` array
5. เมื่อ user login ระบบสามารถดึง permissions จาก position ที่ assign มาใช้งานได้

## ไฟล์ที่เกี่ยวข้อง

- `/src/services/DepartmentService.js` - Backend service สำหรับดึงข้อมูล
- `/src/extensions/modules/erp/modules/hr/components/user-management/Form.vue` - UI Form
- `/src/extensions/modules/erp/modules/hr/components/user-management/PositionTree.vue` - Tree component
- `/src/extensions/modules/erp/core/index.js` - ERP Core initialization
