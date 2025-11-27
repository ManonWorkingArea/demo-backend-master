# 📋 ERP CORE SUMMARY
*Quick reference for all rules, patterns, and guidelines*

---

## 🔒 **IRON RULES (กฎเหล็ก)**

### 🚫 **FORBIDDEN (ห้ามเด็ดขาด)**
```javascript
// ❌ Direct module imports
import { InventoryUtils } from './masterdata/inventory/data.js'

// ❌ Direct storage access  
localStorage.getItem('anything')

// ❌ Direct API calls
fetch('/api/anything')

// ❌ Module-to-module calls
ModuleA.callModuleB()
```

### ✅ **REQUIRED (บังคับใช้)**
```javascript
// ✅ All data through Core
await ERP_CORE.engine.read(type, id)
await ERP_CORE.engine.create(type, data, userId)

// ✅ All module functions through Core
await ERP_CORE.executeModuleFunction(module, function, ...args)

// ✅ All business logic centralized
await ERP_CORE.calculate(module, function, ...args)
```

---

## 🎭 **DEVELOPER PERSONAS**

### 🏗️ **CORE ARCHITECT**
- **Focus:** SOT integrity, module isolation
- **Mantra:** *"Everything through Core"*
- **Responsibility:** Enforce architecture rules

### 🧩 **MODULE DEVELOPER**  
- **Focus:** Pure functions, no data access
- **Mantra:** *"Pure functions only"*
- **Responsibility:** Create isolated business logic

### 🌊 **WORKFLOW ENGINEER**
- **Focus:** Event hooks, cross-module flows
- **Mantra:** *"Event-driven integration"*
- **Responsibility:** Business process automation

### 🎨 **FRONTEND INTEGRATOR**
- **Focus:** ERP_CORE APIs, user experience
- **Mantra:** *"Core-only access"*
- **Responsibility:** Clean UI integration

---

## 📊 **ARCHITECTURE SUMMARY**

### 🎯 **Core Components**
- **TransactionEngine**: Central data controller
- **masterdata modules**: Pure function libraries
- **Hook System**: Event-driven integration
- **Validation**: Schema-based data integrity
- **State Machine**: Controlled transitions

### 🔄 **Data Flow**
```
UI → ERP_CORE → TransactionEngine → Driver → Storage
    ↓
    executeModuleFunction → Module → Pure Logic
```

### 🛡️ **Security Model**
- All operations require userId
- Complete audit trail
- Validation mandatory
- State machine controlled
- Permission-based access

---

## 🚀 **QUICK PATTERNS**

### 📦 **Data Operations**
```javascript
// Create
const result = await ERP_CORE.engine.create('inventory', data, userId)

// Read  
const item = await ERP_CORE.engine.read('inventory', id)

// Update
const updated = await ERP_CORE.engine.update('inventory', id, data, userId)

// Delete
const deleted = await ERP_CORE.engine.delete('inventory', id, userId)

// List with filters
const items = await ERP_CORE.engine.list('inventory', { status: 'active' })
```

### 🔧 **Module Functions**
```javascript
// Calculate EOQ
const eoq = await ERP_CORE.calculate('inventory', 'calculateEOQ', demand, cost, holding)

// Validate data
const validation = await ERP_CORE.validate('inventory', data)

// Format for display
const formatted = await ERP_CORE.executeModuleFunction('sales', 'formatForDisplay', data)
```

### 🎣 **Event Hooks**
```javascript
// Register hooks
engine.on('afterCreate', async (type, data) => {
  if (type === 'sales') {
    await updateInventoryLevels(data)
  }
})

engine.on('stateChange', async (type, id, oldState, newState) => {
  await notifyStakeholders(type, id, newState)
})
```

---

## 🎯 **MODULE STRUCTURE**

### 📁 **Standard Pattern**
```
module/
├── schema.js    # Constants, States, Transitions
├── data.js      # Pure Functions, Business Logic
└── index.js     # Unified Exports
```

### 🧩 **schema.js Template**
```javascript
export const MODULE_TYPES = { ... }
export const MODULE_STATUS = { ... }
export const MODULE_STATES = ['draft', 'active', 'completed']
export const MODULE_TRANSITIONS = { 'draft': ['active'], ... }
export const MODULE_INITIAL_STATE = 'draft'
export const MODULE_STORAGE_KEY = 'erp_module_transactions'
```

### 🔧 **data.js Template**
```javascript
export const ModuleUtils = {
  // Pure business logic
  calculateSomething(input1, input2) {
    return input1 * input2
  },
  
  // Pure validation
  validateData(data) {
    const errors = []
    // validation logic
    return { isValid: errors.length === 0, errors }
  },
  
  // Pure formatting
  formatForDisplay(data) {
    return formatted
  }
}
```

---

## 📋 **TRANSACTION TYPES**

| Type | Thai | Usage |
|------|------|-------|
| `inventory` | สินค้าคงคลัง | Stock management |
| `purchase` | การสั่งซื้อ | Procurement |
| `sales` | การขาย | Sales orders |
| `delivery` | การจัดส่ง | Shipping |
| `workorder` | ใบสั่งงาน | Work orders |
| `production` | การผลิต | Manufacturing |
| `returns` | การส่งคืน | Returns/refunds |
| `quotation` | ใบเสนอราคา | Price quotes |
| `payment` | การชำระเงิน | Payments |

---

## 🚨 **VIOLATION DETECTION**

### 🔍 **Red Flag Patterns**
```bash
# These patterns trigger immediate review:
grep -r "import.*masterdata.*data.js" src/     # Direct imports
grep -r "localStorage\." src/ --exclude-dir=core  # Direct storage
grep -r "fetch\|axios" src/ --exclude-dir=core    # Direct API
```

### 🛠️ **Quick Fixes**
```javascript
// ❌ Wrong
import { InventoryUtils } from './masterdata/inventory/data.js'
const eoq = InventoryUtils.calculateEOQ(1000, 50, 10)

// ✅ Correct  
const eoq = await ERP_CORE.calculate('inventory', 'calculateEOQ', 1000, 50, 10)
```

---

## 🎯 **SUCCESS CHECKLIST**

### ✅ **Code Quality**
```bash
□ No direct module imports
□ No direct storage access
□ No direct API calls  
□ All operations through Core
□ Complete error handling
□ Proper audit trails
□ User ID included
□ Validation implemented
```

### ✅ **Architecture Compliance**
```bash
□ SOT principles followed
□ Module isolation maintained
□ Hook system utilized
□ State machine respected
□ Performance optimized
□ Security considered
```

---

## 📚 **DOCUMENTATION INDEX**

| File | Purpose |
|------|---------|
| **AI_GUIDELINES.md** | Rules for AI assistants |
| **CORE_RULES.md** | Complete architecture rules |
| **DEVELOPMENT_CHECKLIST.md** | Pre-flight checklist |
| **QUICK_REFERENCE.md** | Daily development guide |
| **CODE_ENFORCEMENT.md** | Automated checking tools |
| **CODE_MANAGER_USAGE.md** | Code Manager usage & patterns |
| **INVENTORY_BALANCE_USAGE.md** | Inventory & Balance usage guide |

---

## 🤖 **FOR AI ASSISTANTS**

### 🎯 **Always Remember**
1. **Verify Core compliance** before suggesting code
2. **Use ERP_CORE patterns** in all examples  
3. **Explain architecture** when teaching
4. **Fix violations** immediately when found
5. **Include error handling** in all code
6. **Add audit trails** to operations

### 🚨 **Never Suggest**
- Direct module imports
- localStorage/fetch usage
- Module-to-module calls
- Hardcoded values
- Operations without userId
- Code without validation

---

## 🎯 **FINAL PRINCIPLES**

> **Single Source of Truth (SOT)**  
> **Core-Only Access**  
> **Module Isolation**  
> **Event-Driven Integration**  
> **Complete Audit Trail**

**The system is designed for enterprise-grade reliability, security, and maintainability. Every rule serves this purpose.** 🏢⚡

---

*📅 Created: October 2025 | 🔄 Always Current | 🎯 ERP Core Team*