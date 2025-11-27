# ERP Module – Scope & Core Concepts (Oct 2025)

เอกสารฉบับนี้สรุป “แนวคิดแกนกลาง + ความสามารถโดยรวม” ของ ERP Module เพื่อใช้เป็น Scope กลาง ไม่ต้องวิเคราะห์ซ้ำบ่อยๆ ทั้งฝั่งนักพัฒนาและ AI สามารถอ้างอิงได้ตรงนี้ และเจาะลึกต่อจากเอกสารใน `core/docs/*` เมื่อจำเป็น

—

## ทำอะไรได้บ้าง (What this module does)
- จัดการธุรกรรม (transactions) ของ ERP แบบรวมศูนย์ผ่าน Core Engine เดียว (Single Source of Truth)
- บังคับใช้ Schema/State Machine ต่อแต่ละประเภทธุรกรรม (masterdata เป็นแหล่งความจริง)
- เชื่อมโยงข้ามโมดูลด้วย event-driven workflow (afterCreate/afterUpdate hooks)
- มี Service/Driver แยก IO (LocalStorage ↔ API ↔ Database) เปลี่ยน driver ได้ runtime
- มี Audit Trail, Caching, Locking, Metrics ในตัว
- มี CodeManager สำหรับ “เลขที่เอกสาร/รหัสมาสเตอร์” แบบรวมศูนย์ ตาม pattern ของแต่ละโมดูล
- มี BalanceManager สำหรับ “ยอดคงเหลือสินค้า” แบบ product-centric และรองรับการ recalculation จาก movement

—

## ภาพรวมสถาปัตยกรรม
```
UI (Vue) ──> ERP_CORE
             ├─ TransactionEngine (CRUD, hooks, middleware, cache, audit)
             ├─ TransactionService (select driver: local/api)
             ├─ WorkflowEngine (cross-module flows)
             ├─ CodeManager (document/master code patterns + sequence)
             ├─ BalanceManager (product-centric inventory balance)
             └─ masterdata/* (schemas, states, transitions, pure functions)

Storage Layer: LocalStorage ↔ API ↔ Database
```
หลักการสำคัญ
- Single Source of Truth: โครงสร้างและกฎมาจาก `masterdata/*`
- Core-only access: เรียกทำงานผ่าน `ERP_CORE.engine/*` เท่านั้น ห้ามเรียกข้ามโมดูลโดยตรง
- Module isolation: ฟังก์ชันใน `masterdata/*/data.js` เป็น pure function ไม่มี side effects
- Event-driven: เชื่อมโยงข้ามโมดูลผ่าน hooks + WorkflowEngine
- Full audit: ทุกการเปลี่ยนแปลงมีประวัติและเมตริก

—

## ส่วนประกอบหลัก
- ERP_CORE (entry point ที่ใช้งานจากแอป)
  - `engine`, `service`, `workflow`, `codeManager`, `balance`, `types`, `masterdata`
  - ช็อตคัท: `executeModuleFunction`, `calculate`, `validate`, `showNotification`
- TransactionEngine
  - create/read/update/delete/list/search/upsert/changeState
  - hooks: before/after create/update, middleware pipeline, cache, audit, metrics, locks
  - dynamic import โมดูลผ่าน `getModule(type)` แบบ type-safe
- TransactionService + Drivers
  - คั่นกลางระหว่าง Engine ↔ Driver (local/api) และรองรับ batch/search fallback
- TransactionSchema + TransactionTypes
  - รวม schema/states/transitions/initial states/storage keys ต่อ type จาก masterdata
- TransactionValidator
  - ตรวจตาม schema/enum/min/array items + ตรวจ state transition
- WorkflowEngine
  - รับ event จาก Engine เพื่อรัน flow ข้ามโมดูล (เช่น Purchase→Inventory, Sales→Delivery→Finance ฯลฯ)
- BalanceManager (product-centric)
  - ensure/find/create/update/recalculate balance, summarize, alerts, validate
- CodeManager
  - โหลด pattern จาก storage + จาก `ERP_CORE.masterdata.*_CODE_CONFIG`
  - generateCode(module, { type? }) + เก็บ sequence แบบ persistent ใน type `code_sequence`

—

## ประเภทธุรกรรมที่รองรับ (ตัวอย่างสำคัญ)
- purchase, sales, production, work-order
- product, inventory, stock_location, inventory_balance
- delivery, returns, quotation, payment, finance
- receipt, invoice, tax-invoice
- supplier, customer
- codeManagement, code_sequence (สำหรับ sequence persistence)

—

## Data Flow (แกนกลาง)
- Create
  1) ตรวจ type → เติม defaults จาก schema → ใส่ id/status/timestamps/by
  2) validate → middleware.beforeCreate → hooks.beforeCreate → driver.create
  3) cache.set → audit → hooks.afterCreate → metrics
- Update
  1) read (cache-first) → รวม timestamps → validate fields/transition
  2) middleware.beforeUpdate → hooks.beforeUpdate → driver.update
  3) cache.update → audit → hooks.afterUpdate → metrics
- Read
  - cache-first → driver.read → ตรวจ type (ยกเว้นกรณีพิเศษ supplier) → cache → audit

ผลลัพธ์มาตรฐานจาก Engine
- สำเร็จ: `{ success: true, data, message, metadata }`
- ล้มเหลว: `{ success: false, error, data: null, metadata }`

—

## Cross-Module Workflows (สรุป)
- Purchase
  - approved → (PO) | received → เพิ่ม inventory | invoiced → สร้าง finance AP
- Production
  - in_progress → consume raw materials | completed → เพิ่ม finished goods | closed → คำนวณต้นทุนจริง
- Sales
  - confirmed → reserve inventory + create delivery | invoiced → สร้าง finance AR
- Delivery
  - shipped → consume reserved inventory | delivered → update sales
- Finance
  - posted → สร้าง journal entries ตามชนิดเอกสาร (AR/AP)

—

## รหัสเอกสาร/มาสเตอร์ (CodeManager)
- แหล่ง pattern: storage + `ERP_CORE.masterdata.<module>.<MODULE>_CODE_CONFIG`
- โครงรูปแบบทั่วไป: `{prefix}{year}{sequence}` (รองรับ month/custom)
- หา sequence ถัดไปจาก 1) stored sequence ใน `code_sequence` 2) สแกนรหัสใน records เดิมด้วย regex
- upsert sequence โดยใช้ key รายปี: `${module}_sequence_${YYYY}`

—

## ยอดคงเหลือสินค้า (BalanceManager, product-centric)
- มอง balance เป็นข้อมูล “สรุป” ที่คำนวณจาก movement จริง สามารถ recalculation ได้
- ฟังก์ชัน: ensure/find/create/update/recalculate/summary/alerts/validate + default location fallback

—

## สัญญาการใช้งาน (Contracts)
- type ต้องเป็นค่าใน `TRANSACTION_TYPES`
- data ต้องผ่าน `TransactionSchema` ของ type นั้น
- state transition ต้องผ่าน `TRANSACTION_TRANSITIONS`
- ค่าตอบกลับจาก Engine มีโครงมาตรฐาน (success/error + metadata)

—

## ขยายระบบ (How to extend)
1) เพิ่ม schema และ pure functions ใน `masterdata/<module>/schema.js` และ `data.js`
2) เพิ่ม mapping ใน `core/TransactionTypes.js` (STATES/TRANSITIONS/INITIAL_STATES/STORAGE_KEYS)
3) เพิ่ม schema mapping ใน `core/TransactionSchema.js` (TRANSACTION_SCHEMAS)
4) (ถ้ามี flow) ต่อที่ `core/WorkflowEngine.js` หรือ subscribe hooks ผ่าน `engine.on(...)`
5) (ถ้ามีเลขที่เอกสาร) ระบุ `<MODULE>_CODE_CONFIG` ใน `masterdata/<module>/data.js`
6) ฝั่ง UI เพิ่ม module router/components/plugins ตามต้องการ

—

## Do / Don’t (Iron Rules)
- Do: เรียกผ่าน `ERP_CORE.engine/*` และ `ERP_CORE.executeModuleFunction()` เท่านั้น
- Do: รวม userId กับทุก operation, รองรับ error handling ครบ
- Don’t: import module ข้ามกันโดยตรง, เข้าถึง storage โดยตรง, ข้าม validation/audit

—

## ใช้อย่างเร็ว (Quick usage)
> ตัวอย่างต่อไปนี้อธิบาย flow โดยรวม ใช้งานจริงดู interface และ fields จาก schema ของแต่ละ type

```js
// สร้างสินค้า
const p = await ERP_CORE.engine.create('product', {
  product_code: 'PRD-001',
  product_name: 'Example',
}, 'user01')

// สร้างเลขที่เอกสารสั่งซื้อ
const poCode = await ERP_CORE.codeManager.generateCode('purchase')

// ยืนยันออเดอร์ขายและสร้าง delivery อัตโนมัติผ่าน workflow
await ERP_CORE.engine.changeState('sales', 'SALES-123', 'confirmed', 'user01')

// ดูยอดคงเหลือสรุปของสินค้า
const summary = await ERP_CORE.balance.getProductBalanceSummary(p.data.id)
```

—

## เอกสารอ้างอิง
- `core/docs/SUMMARY.md` – ภาพรวมเร็ว
- `core/docs/QUICK_REFERENCE.md` – สูตรลัดสำหรับ dev รายวัน
- `core/docs/CORE_RULES.md` – กฎสถาปัตยกรรม
- `core/docs/DEVELOPMENT_CHECKLIST.md` – เช็กลิสต์ก่อนพัฒนา/รีวิว
- `core/docs/CODE_ENFORCEMENT.md` – เครื่องมือบังคับใช้กฎอัตโนมัติ
- `core/docs/AI_GUIDELINES.md` – แนวทางสำหรับ AI Assistants

—

## ขอบเขตที่ไม่ครอบคลุม (Out of scope)
- รายละเอียด endpoint ของ ApiDriver/Backend (ขึ้นกับบริการภายนอก)
- การเชื่อมต่อ DB จริง (ขึ้นกับสภาพแวดล้อม deployment)

—

## เวอร์ชันและการดูแลรักษา
- Core เวอร์ชันอ้างอิง: TransactionEngine 2.x
- เอกสารนี้จะอัปเดตเมื่อมีการเปลี่ยนแปลงที่กระทบ Scope/สถาปัตยกรรม

> หมายเหตุสภาพแวดล้อม: ฝั่ง CodeManager บางความสามารถคาดหวังให้มี `window.ERP_CORE` (กรณีรันในเบราว์เซอร์). หากใช้ใน Node ให้จัดเตรียม bridge/global ให้เหมาะสมหรือเรียกผ่านอ็อบเจกต์ ERP_CORE ที่ import มาโดยตรง
