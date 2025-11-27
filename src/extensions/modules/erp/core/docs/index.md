# 📚 ERP CORE DOCUMENTATION
*Complete guide for ERP Core architecture, rules, and development*

---

## 📖 **DOCUMENTATION INDEX**

### 🎯 **Quick Start**
- **[SUMMARY.md](./SUMMARY.md)** - Complete overview in one page ⚡
- **[AI_GUIDELINES.md](./AI_GUIDELINES.md)** - Rules for AI assistants 🤖

### 📋 **Complete Guides**
- **[CORE_RULES.md](./CORE_RULES.md)** - Architecture rules & patterns 🛡️
- **[DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md)** - Pre-flight checklist ✅
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Daily development guide 🚀
- **[CODE_ENFORCEMENT.md](./CODE_ENFORCEMENT.md)** - Automated checking tools 🔧
 - **[CODE_MANAGER_USAGE.md](./CODE_MANAGER_USAGE.md)** - Code Manager usage & patterns 🔢
 - **[INVENTORY_BALANCE_USAGE.md](./INVENTORY_BALANCE_USAGE.md)** - Inventory & Balance usage guide
- **[CENTRALIZED_EXPORT_USAGE.md](../CENTRALIZED_EXPORT_USAGE.md)** - Centralized Import/Export guide

---

## 🎭 **BY ROLE**

### 🏗️ **Core Architects**
1. [CORE_RULES.md](./CORE_RULES.md) - Full architecture principles
2. [CODE_ENFORCEMENT.md](./CODE_ENFORCEMENT.md) - Automated compliance tools
3. [SUMMARY.md](./SUMMARY.md) - Quick reference for reviews

### 🧩 **Module Developers**  
1. [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md) - Before you start
2. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Daily patterns
3. [CORE_RULES.md](./CORE_RULES.md) - Module development rules

### 🌊 **Workflow Engineers**
1. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Hook patterns
2. [CORE_RULES.md](./CORE_RULES.md) - Event-driven rules
3. [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md) - Testing workflows

### 🎨 **Frontend Integrators**
1. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Vue.js integration patterns
2. [SUMMARY.md](./SUMMARY.md) - Core API quick reference
3. [CORE_RULES.md](./CORE_RULES.md) - Frontend integration rules

### 🤖 **AI Assistants**
1. **[AI_GUIDELINES.md](./AI_GUIDELINES.md)** - Primary guidelines
2. [SUMMARY.md](./SUMMARY.md) - Quick rule reference
3. [CORE_RULES.md](./CORE_RULES.md) - Complete context

---

## 🚀 **GETTING STARTED**

### ⚡ **5-Minute Start**
1. Read **[SUMMARY.md](./SUMMARY.md)** - Get the big picture
2. Check **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Copy patterns
3. Follow **[DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md)** - Stay compliant

### 📚 **Deep Dive**
1. **[CORE_RULES.md](./CORE_RULES.md)** - Understand the WHY
2. **[CODE_ENFORCEMENT.md](./CODE_ENFORCEMENT.md)** - Set up tools
3. Practice with examples from **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**

---

## 🔒 **IRON RULES SUMMARY**

### 🚫 **NEVER**
- Import modules directly
- Access localStorage/fetch outside core
- Make module-to-module calls
- Skip validation or audit trails

### ✅ **ALWAYS**  
- Use `ERP_CORE.engine.*` for data
- Use `ERP_CORE.executeModuleFunction()` for logic
- Include userId in operations
- Handle errors gracefully

---

## 🎯 **ARCHITECTURE OVERVIEW**

```
┌─────────────────────────────────────────┐
│                 UI LAYER                │
├─────────────────────────────────────────┤
│              ERP_CORE                   │
│  ┌─────────────────────────────────────┐│
│  │         TransactionEngine          ││
│  │    ┌─────────────────────────────┐  ││
│  │    │     masterdata modules     │  ││
│  │    │   (Pure Functions Only)    │  ││
│  │    └─────────────────────────────┘  ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│            STORAGE LAYER                │
│     LocalStorage ↔ API ↔ Database      │
└─────────────────────────────────────────┘
```

### 📊 **Key Principles**
- **Single Source of Truth (SOT)** - masterdata is the authority
- **Core-Only Access** - all operations through ERP_CORE
- **Module Isolation** - pure functions, no side effects
- **Event-Driven** - hooks for cross-module integration
- **Complete Audit** - every change tracked

---

## 🛠️ **DEVELOPMENT WORKFLOW**

### 1. **Planning** 📋
- Check [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md)
- Identify transaction types needed
- Plan module structure

### 2. **Development** 🔧
- Follow patterns in [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- Use Core-only access patterns
- Implement error handling

### 3. **Testing** 🧪
- Run architecture compliance checks
- Test through ERP_CORE APIs only
- Verify audit trails

### 4. **Review** 👀
- Check against [CORE_RULES.md](./CORE_RULES.md)
- Use [CODE_ENFORCEMENT.md](./CODE_ENFORCEMENT.md) tools
- Verify persona compliance

---

## 📈 **QUALITY METRICS**

### ✅ **Success Criteria**
- 100% Core compliance
- 0 direct module imports
- 0 direct storage access
- Complete error handling
- Full audit trails
- Performance optimized

### 📊 **Monitoring**
- Architecture violation rate: 0%
- Test coverage: ≥95%
- Response time: <100ms
- Error rate: <1%
- Cache hit rate: >80%

---

## 🆘 **NEED HELP?**

### 📞 **Quick Support**
1. **Check [SUMMARY.md](./SUMMARY.md)** - Most common patterns
2. **Search [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Code examples
3. **Review [CORE_RULES.md](./CORE_RULES.md)** - Detailed rules

### 🚨 **Architecture Violations**
1. **Stop development** immediately
2. **Check [CODE_ENFORCEMENT.md](./CODE_ENFORCEMENT.md)** for tools
3. **Fix using patterns** from [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
4. **Verify compliance** before continuing

### 🎓 **Learning Path**
1. **Beginner**: SUMMARY.md → QUICK_REFERENCE.md
2. **Intermediate**: CORE_RULES.md → DEVELOPMENT_CHECKLIST.md  
3. **Advanced**: CODE_ENFORCEMENT.md → Create new modules
4. **Expert**: Contribute to documentation → Mentor others

---

## 🎯 **REMEMBER**

> **You are building an Enterprise ERP System**  
> **Every line of code matters**  
> **Architecture integrity is non-negotiable**  
> **Quality over speed, always**

**These documents exist to help you build something amazing while maintaining the highest standards of software architecture.** 🏢⚡

---

*📅 Updated: October 2025 | 🔄 Living Documentation | 👥 ERP Core Team*