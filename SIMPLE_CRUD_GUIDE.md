# Simple CRUD Guide - `this.$Request` Style

คู่มือการใช้งาน CRUD operations แบบง่ายๆ ด้วยรูปแบบ `this.$Request`

## การตั้งค่าพื้นฐาน

ต้องมีตัวแปรเหล่านี้ใน component:
```javascript
this.session = storageManager.get('session');
this.hostkey = this.$Key;
```

**หมายเหตุ:** `collection_name` คือชื่อ collection ที่ต้องการทำงานด้วย (เช่น `user`, `product`, `post`, `hostname`)

## CRUD Operations

### 1. READ (GET) - อ่านข้อมูล

**ดึงข้อมูลทั้งหมด:**
```javascript
const { data, status } = await this.$Request.GET(`collection_name/${this.session.current._id}`, this.hostkey);
```

**ดึงข้อมูลเฉพาะ ID:**
```javascript
const { data, status } = await this.$Request.GET(`collection_name/${itemId}`, this.hostkey);
```

### 2. CREATE (POST) - สร้างข้อมูลใหม่

```javascript
const requestBody = { data: { field1: 'value1', field2: 'value2' } };
const { data, status } = await this.$Request.POST(`collection_name/`, requestBody, this.hostkey);
```

### 3. UPDATE (PUT) - อัปเดตข้อมูล

```javascript
const requestBody = { data: { field1: 'new_value', lastUpdated: new Date().toISOString() } };
const { data, status } = await this.$Request.PUT(`collection_name/${itemId}`, requestBody, this.hostkey);
```

### 4. DELETE - ลบข้อมูล

```javascript
const { data, status } = await this.$Request.DELETE(`collection_name/${itemId}`, this.hostkey);
```

### 5. AGGREGATE - การรวมข้อมูล (MongoDB Pipeline)

```javascript
const payload = { pipeline: [...your_pipeline...] };
const { data } = await this.$Request.POST('collection_name/aggregate', payload, this.hostkey);
```

### 6. QUERY - การค้นหาข้อมูลแบบซับซ้อน

```javascript
const { data, status } = await this.$Request.POST(
  'collection_name/query',
  {
    method: 'find',
    args: [{ ...search_conditions... }],
    options: { limit: 10, skip: 0, sort: { createdAt: -1 } }
  },
  this.hostkey
);
```

## รูปแบบ Request Body

**สำหรับ POST/PUT:**
```javascript
const requestBody = { data: { field1: 'value1', field2: 'value2' } };
```

## รูปแบบ Response

```javascript
{ data: {...}, status: 200 }
```

## การตรวจสอบ Status

```javascript
if (status === 200) { /* สำเร็จ (GET, PUT, DELETE) */ }
if (status === 201) { /* สำเร็จ (POST - สร้างใหม่) */ }
```

## Error Handling

```javascript
try {
  const { data, status } = await this.$Request.GET(...);
  // ใช้งาน data
} catch (error) {
  console.error('Error:', error);
}
```