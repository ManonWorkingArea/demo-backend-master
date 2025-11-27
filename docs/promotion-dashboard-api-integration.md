# Promotion Dashboard API Integration

## การเชื่อมต่อ API สำหรับ PromotionDashboard.vue

ไฟล์ `PromotionDashboard.vue` ได้รับการอัปเดตให้ใช้ข้อมูลจาก API จริงแทนการใช้ข้อมูล mock

## API Endpoints ที่ใช้งาน

### 1. Promotion Management

#### GET - ดึงข้อมูลโปรโมชั่น
```javascript
const { data, status } = await this.$Request.GET(
  `promotion/${this.session.current._id}`,
  this.hostkey
);
```

#### POST - สร้างโปรโมชั่นใหม่
```javascript
const { data, status } = await this.$Request.POST(
  'promotion/',
  { data: promotionData },
  this.hostkey
);
```

#### PUT - อัปเดตโปรโมชั่น
```javascript
const { data, status } = await this.$Request.PUT(
  `promotion/${promotionId}`,
  { data: updateData },
  this.hostkey
);
```

#### DELETE - ลบโปรโมชั่น
```javascript
const { status } = await this.$Request.DELETE(
  `promotion/${promotionId}`,
  this.hostkey
);
```

### 2. FTI Academy Campaign Analytics

สำหรับแคมเปญ FTI Academy (ID = '1') ระบบจะดึงข้อมูลผู้เรียนและความคืบหน้าจาก collection `enroll` และ `user`

#### เรียก Aggregation Pipeline
```javascript
const pipeline = [
  {
    $match: {
      courseID: { $in: campaignCourseIds }, // หลักสูตรทั้ง 5 ที่กำหนด
      'analytics.status': { $exists: true }
    }
  },
  {
    $lookup: {
      from: 'user',
      localField: 'userID', 
      foreignField: '_id',
      as: 'userInfo'
    }
  },
  {
    $unwind: '$userInfo'
  },
  {
    $group: {
      _id: '$userID',
      userInfo: { $first: '$userInfo' },
      enrollments: {
        $push: {
          courseId: '$courseID',
          progress: '$analytics.percent',
          status: '$analytics.status',
          completedAt: '$completeDateAt',
          enrolledAt: '$createdAt'
        }
      },
      totalCourses: { $sum: 1 },
      completedCourses: {
        $sum: {
          $cond: [{ $eq: ['$analytics.status', 'complete'] }, 1, 0]
        }
      }
    }
  }
];

const { data, status } = await this.$Request.POST(
  'enroll/aggregate',
  { pipeline },
  this.hostkey
);
```

## หลักสูตรในแคมเปญ FTI Academy

แคมเปญ FTI Academy ประกอบด้วย 5 หลักสูตร:

```javascript
const campaignCourseIds = [
  '67ebb7a72740d3df3f37dc69', // องค์กรสุขภาวะในโครงการป้องกันโรค
  '6899b93319dfbc0079a10894', // การสร้างแรงบันดาลใจในการป้องกันโรค NCDs และระบบสุขภาพ
  '6899bf5194605e1513c55e74', // สุขภาพดี... เริ่มต้นจากอาหาร
  '6899c3e2fe396063e3cf648b', // โภชนาการกับการจัดการ NCDs
  '6899c9b419dfbc0079a108a4'  // Workshop ฉลาดกิน ฉลาดเลือก ฉลาดอยู่ ห่างไกลโรค NCDs
];
```

## โครงสร้างข้อมูลที่ได้จาก API

### ข้อมูลผู้เข้าร่วมแคมเปญ
```javascript
{
  id: 'P001',
  name: 'ชื่อ นามสกุล',
  email: 'email@example.com',
  phone: '0123456789', 
  totalProgress: 75, // ความคืบหน้ารวม (%)
  completedCourses: 3, // จำนวนหลักสูตรที่เรียนจบ
  status: 'in_progress', // สถานะ: completed, near_completion, in_progress, just_started
  rewardClaimed: false,
  enrolledDate: '2025-09-26',
  completedDate: null,
  courseProgress: [
    {
      courseId: 1,
      actualCourseId: '67ebb7a72740d3df3f37dc69',
      progress: 100,
      status: 'complete',
      completedAt: '2025-09-28T17:08:22.497Z',
      courseName: 'องค์กรสุขภาวะในโครงการป้องกันโรค'
    },
    // ... หลักสูตรอื่นๆ
  ]
}
```

## การจัดการ Error และ Fallback

ระบบมีการจัดการ error และใช้ข้อมูล mock เป็น fallback:

```javascript
try {
  // เรียก API
} catch (apiError) {
  console.warn('API not available, using sample data:', apiError);
  this.promotions = this.samplePromotions;
}
```

## ฟีเจอร์ที่เพิ่มขึ้น

1. **การส่งออกข้อมูล**: ส่งออกข้อมูลผู้เข้าร่วมแคมเปญเป็น CSV
2. **การติดตามความคืบหน้า**: แสดงความคืบหน้าแต่ละหลักสูตรของผู้เรียน
3. **สถิติแคมเปญ**: แสดงสถิติการเรียนจบและความคืบหน้ารวม
4. **การจัดการโปรโมชั่น**: CRUD operations สำหรับจัดการโปรโมชั่น

## การตั้งค่าที่จำเป็น

ใน component ต้องมีการตั้งค่า:

```javascript
data() {
  return {
    session: storageManager.get('session'), // ข้อมูล session ผู้ใช้
    hostkey: null, // จะถูกตั้งค่าใน mounted()
    // ...
  }
},

mounted() {
  this.hostkey = this.$Key; // ตั้งค่า hostkey สำหรับการเรียก API
  this.getPromotionData();
}
```

## Testing

สำหรับการทดสอบ หากไม่มี API หรือข้อมูลไม่ครบ ระบบจะใช้ข้อมูล mock ที่มีอยู่ใน component โดยอัตโนมัติ

## Error Handling

ระบบจัดการ error ในหลายระดับ:

1. **API Level**: จับ error จากการเรียก API และใช้ fallback data
2. **Component Level**: แสดงข้อความ error และป้องกัน crash
3. **User Level**: แสดง alert หรือ notification เมื่อมี error

## การใช้งาน

1. เปิดแท็บ "แดชบอร์ดโปรโมชั่น" ใน Dashboard
2. เลือกโปรโมชั่น FTI Academy เพื่อดูรายละเอียด
3. ดูสถิติและรายชื่อผู้เข้าร่วม
4. ส่งออกข้อมูลเป็น CSV ได้ตามต้องการ

## หมายเหตุ

- ข้อมูล mock ยังคงอยู่เป็น backup
- การเรียก API ใช้รูปแบบตาม SIMPLE_CRUD_GUIDE.md
- สามารถปรับแต่งหลักสูตรในแคมเปญได้โดยแก้ไข `campaignCourseIds`