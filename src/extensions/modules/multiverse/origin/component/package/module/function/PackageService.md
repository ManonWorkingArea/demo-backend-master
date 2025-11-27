# PackageService - API Guidelines & Architecture

🔥 **IMPORTANT: READ BEFORE MODIFYING THIS SERVICE** 🔥

## 🏗️ NEW MODULAR ARCHITECTURE (V3)

**Updated Service Architecture:**
```
ServiceManager (Main Orchestrator - 778 lines)
├── BusinessFlowManager (1,200 lines) - Core business flows
├── LifecycleManager (1,000 lines) - Contract lifecycle management  
└── DataAnalyticsManager (726 lines) - Data analytics & reporting
```

### 🎯 ServiceManager - Main Orchestrator
- **Factory Pattern**: Uses ServiceFactory for service creation
- **Delegation Pattern**: Delegates to specialized managers
- **100% Backward Compatible**: All existing APIs work unchanged
- **Comprehensive Error Handling**: Uses ErrorHandler throughout
- **Input Validation**: Uses InputValidator for all inputs

### 📦 Specialized Managers:

#### 🔥 BusinessFlowManager
**Core Business Flows:**
- `getOwnershipForDocuments()` - ดึงข้อมูลเจ้าของสำหรับเอกสาร
- `validateOwnershipForContract()` - ตรวจสอบความพร้อมข้อมูลเจ้าของ
- `renewSubscription()` - ต่ออายุ subscription
- `assignPackageToCollection()` - กำหนด package ให้ collection
- `activateSubscription()` - เปิดใช้งาน subscription
- `activateContract()` - เปิดใช้งาน contract

#### 🔄 LifecycleManager  
**Contract & Subscription Lifecycle:**
- `cancelContractAndRelatedData()` - ยกเลิก contract และข้อมูลที่เกี่ยวข้อง
- `cancelContract()` - ยกเลิก contract (soft delete)
- `calculateContractLifecycle()` - คำนวณอายุและสถานะ contract
- `editContract()` - แก้ไข contract พร้อม version history
- `updateContractPricing()` - เปลี่ยนราคา contract
- `pauseSubscription()` - หยุด subscription ชั่วคราว
- `resumeSubscription()` - เริ่ม subscription ใหม่หลังหยุด
- `getSingleContractWithSubscriptions()` - ดึงข้อมูล contract เดียวพร้อม subscriptions

#### 📊 DataAnalyticsManager
**Data Analytics & Reporting:**
- `getContractWithSubscriptions()` - ดึงข้อมูล contract พร้อม subscriptions, invoices, receipts
- `calculateContractStatistics()` - คำนวณสถิติ contract และ subscription
- `getContractStatistics()` - ดึงสถิติ contract สำหรับ collection
- `getFinancialHealthReport()` - รายงานสุขภาพทางการเงิน
- `calculateMultipleContractLifecycles()` - วิเคราะห์ lifecycle หลาย contracts
- `validateContractBusinessRules()` - ตรวจสอบกฎธุรกิจ contract
- `validateSubscriptionBusinessRules()` - ตรวจสอบกฎธุรกิจ subscription

## 🆕 ENHANCED PACKAGE MANAGEMENT FLOW (V3)

**Complete Business Flow:**
1. **Package Selection** → Create **Contract** for Collection
2. **Contract** → Generate **Subscription** + **Invoice** (status: `pending_payment`)
3. **Subscription Confirmation** → Activate Subscription + Mark Invoice as `paid` + Create Receipt
4. **Subscription Renewal** → Create new Subscription + Cancel old one (only 1 active per contract)
5. **Analytics & Reporting** → Generate financial health reports and lifecycle analytics

### 🔥 Enhanced Collections Structure:
- **contract**: Package assignments to collections (with lifecycle management)
- **subscription**: Individual subscription periods (with pause/resume capability)
- **invoice**: Bills for each subscription period (with business rule validation)
- **receipt**: Payment confirmations (with comprehensive item tracking)
- **ownership**: Customer ownership data (integrated with document generation)

### 🔥 New Advanced Methods:

#### 🎯 Complex Activation Flow:
- `activateRenewalSubscription()` - Complete renewal flow with remaining days transfer
- `cancelContractAndRelatedData()` - Complete cancellation with data cleanup
- `pauseSubscription()` / `resumeSubscription()` - Subscription lifecycle management

#### 📊 Analytics & Reporting:
- `getFinancialHealthReport()` - Comprehensive financial health analysis
- `calculateMultipleContractLifecycles()` - Bulk lifecycle analysis
- `getContractStatistics()` - Statistical analysis with health scoring

#### 🔧 Contract Management:
- `editContract()` - Contract modification with version history
- `updateContractPricing()` - Dynamic pricing updates
- `calculateContractLifecycle()` - Lifecycle status calculation

### 🔥 Enhanced Data Flow:
```
[Package Selection] 
    ↓
[Contract Created with Ownership Validation] 
    ↓
[Subscription Created (pending_payment)] + [Invoice Created (pending_payment)]
    ↓
[Business Rules Validation]
    ↓
[User Confirms Payment]
    ↓
[Subscription → active] + [Invoice → paid] + [Receipt Created] + [Old Subscription → cancelled]
    ↓
[Analytics & Health Monitoring]
    ↓
[Lifecycle Management (pause/resume/renew)]
```

## 🏭 Factory Pattern Integration

### ServiceFactory Features:
- **Service Creation**: Creates all services with consistent configuration
- **Environment Management**: Supports multiple environments (production, development)
- **Metrics & Logging**: Optional metrics and logging enablement
- **Service Statistics**: Tracks service creation and usage statistics

### Usage Example:
```javascript
// ServiceManager automatically uses ServiceFactory
const serviceManager = new ServiceManager(hostkey, {
  environment: 'production',
  enableLogging: true,
  enableMetrics: true
});

// Access specialized managers
await serviceManager.businessFlow.renewSubscription(renewalData);
await serviceManager.lifecycle.pauseSubscription(subscriptionId);
await serviceManager.analytics.getFinancialHealthReport(collectionId);
```

## 📊 Enhanced Analytics Capabilities

### Financial Health Scoring:
- **Health Score**: 0-100 calculation based on payment rates, cancellation rates
- **Status Classification**: healthy (80+), warning (60-79), critical (<60)
- **Automated Alerts**: High overdue rates, cancellation rates, pending payments
- **Recommendations**: Automated business recommendations

### Lifecycle Analytics:
- **Multi-Contract Analysis**: Bulk lifecycle analysis for collections
- **Remaining Days Calculation**: Accurate remaining days with averages
- **Expiration Monitoring**: Contracts expiring soon alerts
- **Status Distribution**: Active, trial, expired, inactive breakdowns

### Business Rule Validation:
- **Contract Validation**: Comprehensive business rule checking
- **Subscription Validation**: Cross-referential validation with contracts and packages
- **Error Classification**: Errors, warnings, suggestions categorization

## API Endpoints Structure

This service ONLY uses these 2 endpoints:
1. `/aggregate` - For complex queries with pipelines
2. `/{id}` - For simple CRUD operations (GET, POST, PUT, DELETE)

### ❌ DO NOT USE:
- `/query` with method: 'find' 
- `/query` with method: 'findOneAndUpdate'
- `/query` with method: 'insertOne'
- `/query` with method: 'updateOne'

### ✅ CORRECT PATTERNS:

#### 1. COMPLEX QUERIES → Use aggregateCall():
```javascript
const pipeline = [
  { $match: { status: true } },
  { 
    $lookup: {
      from: 'subscription',
      let: { contractId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $or: [
                { $eq: ['$contractId', '$$contractId'] },
                { $eq: ['$contractId', { $toString: '$$contractId' }] }
              ]
            }
          }
        }
      ],
      as: 'subscriptions'
    }
  },
  { $sort: { createdAt: -1 } }
];
const result = await this.aggregateCall('contract', pipeline);
```

#### 2. SIMPLE CRUD → Use helper functions:
- `await this.getById('collection', id)`
- `await this.create('collection', data)`
- `await this.update('collection', id, data)`
- `await this.delete('collection', id)`

#### 3. UPDATES → Use aggregate with $merge:
```javascript
const pipeline = [
  { $match: { _id: documentId } },
  { $addFields: { 
    status: 'active',
    activatedAt: new Date().toISOString(),
    'metadata.activatedBy': userId
  }},
  { $merge: { into: 'subscription', whenMatched: 'replace' } }
];
await this.aggregateCall('subscription', pipeline);
```

## 🛡️ Error Handling & Validation

### ErrorHandler Integration:
- **Structured Error Handling**: Consistent error handling across all managers
- **Context-Aware Logging**: Detailed context for debugging
- **Severity Classification**: CRITICAL, HIGH, MEDIUM, LOW severity levels
- **Error Recovery**: Graceful fallbacks for non-critical errors

### InputValidator Integration:
- **Comprehensive Validation**: All inputs validated before processing
- **Business Rule Validation**: Domain-specific validation rules
- **Error Aggregation**: Multiple validation errors collected and reported
- **Type Safety**: Ensures data type consistency

## Caching Strategy

- **Cache duration**: 5 minutes
- **Clear cache after mutations**
- **Use collection-specific cache keys**
- **Cross-manager cache coordination**

## API Call Patterns

Two supported formats:
1. `this.apiCall(endpoint, method, collection, body)`
2. `this.apiCall(endpoint, options)` // legacy support

## Collections Used

- **package**: Package definitions
- **contract**: Package assignments (with lifecycle tracking)
- **subscription**: Subscription periods (with pause/resume states)
- **invoice**: Billing invoices (with business rule validation)
- **receipt**: Payment receipts (with comprehensive item tracking)
- **payment**: Payment records
- **ownership**: Customer ownership data (integrated with contracts)

## 🚨 Breaking Changes History

### V3 (Current - Modular Architecture):
- Introduced ServiceManager as main orchestrator
- Added specialized managers (BusinessFlow, Lifecycle, Analytics)
- Enhanced error handling and input validation
- Added comprehensive analytics and reporting
- Introduced Factory Pattern for service creation

### V2 (Previous):
- Removed all /query methods (find, findOneAndUpdate, etc.)
- Replaced with aggregate pipelines for consistency
- Simplified API surface to 2 endpoints only

---

# API Capabilities & Features

## 🏗️ Enhanced API Architecture

- **Base URL**: https://gateway.cloudrestfulapi.com/api
- **Authentication**: hostkey-based
- **Response Format**: JSON
- **Timeout**: 30 seconds
- **Architecture**: Modular with specialized managers
- **Error Handling**: Comprehensive with ErrorHandler
- **Validation**: Input validation with InputValidator

## 📊 Supported Operations

### 1. AGGREGATE PIPELINE QUERIES (/aggregate):
✅ Complex filtering with `$match`  
✅ Sorting with `$sort`  
✅ Data transformation with `$project`, `$addFields`  
✅ Joins with `$lookup` (cross-collection references)  
✅ Grouping and statistics with `$group`  
✅ Pagination with `$skip`, `$limit`  
✅ Conditional logic with `$cond`, `$filter`  
✅ Date operations with `$dateFromString`, `$dateToString`  
✅ Array operations with `$arrayElemAt`, `$size`, `$push`  
✅ Data updates with `$merge` (upsert/replace)  
✅ Mathematical operations (`$sum`, `$avg`, `$divide`)  
✅ String operations (`$concat`, `$substr`)  
✅ Faceted search with `$facet`  
✅ **NEW**: Multi-collection joins for analytics
✅ **NEW**: Lifecycle status calculations
✅ **NEW**: Financial health scoring

### 2. CRUD OPERATIONS (RESTful endpoints):
✅ `GET /{collection}/{id}` - Retrieve single document  
✅ `POST /{collection}` - Create new document  
✅ `PUT /{collection}/{id}` - Update existing document  
✅ `DELETE /{collection}/{id}` - Delete document  
✅ **NEW**: Bulk operations through specialized managers
✅ **NEW**: Transaction-safe operations
✅ **NEW**: Validation-first operations

## 📁 Enhanced Collections & Data Models

### 🎁 PACKAGE (Package Definitions):
- Package metadata (name, description, pricing)
- Billing cycles (monthly, quarterly, yearly)
- Feature limits and quotas
- Status management (active/inactive)
- **NEW**: Business rule definitions

### 📋 CONTRACT (Package Assignments):
- Collection-to-package bindings
- Assignment lifecycle (active, trial, cancelled, paused)
- Customer information integration
- Assignment history tracking
- **NEW**: Version history support
- **NEW**: Pricing modification tracking
- **NEW**: Lifecycle analytics

### 📅 SUBSCRIPTION (Billing Periods):
- Time-based subscription periods
- Usage tracking per period
- Payment status and history
- Period extensions and modifications
- **NEW**: Pause/resume functionality
- **NEW**: Remaining days calculation
- **NEW**: Renewal tracking

### 🧾 INVOICE (Billing Documents):
- Invoice generation and management
- Line items and pricing calculations
- Due dates and payment tracking
- PDF document generation
- **NEW**: Business rule validation
- **NEW**: Comprehensive item tracking

### 🧾 RECEIPT (Payment Confirmations):
- Payment receipt generation
- Payment method tracking
- Receipt document management
- Email delivery capabilities
- **NEW**: Detailed item breakdown
- **NEW**: Cross-reference tracking

### 💳 PAYMENT (Transaction Records):
- Payment processing records
- Transaction status tracking
- Payment method information
- Refund and chargeback handling

### 👤 OWNERSHIP (Customer Data):
- Customer ownership information
- Document generation data
- Contact information
- **NEW**: Integrated with contract validation
- **NEW**: Document preparation utilities

## 🔧 Advanced Features

### 📈 ENHANCED ANALYTICS & REPORTING:
- **Financial Health Reports**: Comprehensive health scoring (0-100)
- **Multi-Contract Analytics**: Bulk lifecycle analysis
- **Usage Trend Analysis**: Historical usage patterns
- **Growth Rate Calculations**: Period-over-period growth
- **Utilization Rate Monitoring**: Resource utilization tracking
- **Statistical Aggregations**: Advanced statistical operations
- **Automated Recommendations**: AI-driven business insights

### 💾 ENHANCED CACHING SYSTEM:
- In-memory caching (5-minute TTL)
- Collection-specific cache keys
- **NEW**: Cross-manager cache coordination
- **NEW**: Selective cache invalidation
- Performance optimization

### 🔄 DATA MIGRATION:
- Legacy data structure support
- Automatic migration detection
- Backward compatibility
- Data normalization
- **NEW**: Version-aware migrations

### 📧 DOCUMENT MANAGEMENT:
- PDF generation (invoices/receipts)
- Email delivery system
- Document sharing capabilities
- Template-based generation
- **NEW**: Ownership-integrated documents
- **NEW**: Multi-language support

### 🔍 ENHANCED QUERY CAPABILITIES:
- Multi-collection joins
- Complex filtering conditions
- Date range queries
- Status-based filtering
- **NEW**: Lifecycle-based queries
- **NEW**: Health-based filtering
- **NEW**: Analytics-driven queries

### 💰 ADVANCED BILLING FEATURES:
- Multiple billing cycles
- Prorated billing
- Usage-based pricing
- Discount management
- Tax calculations
- Payment processing
- **NEW**: Pause/resume billing
- **NEW**: Remaining days transfer
- **NEW**: Dynamic pricing updates

### 🎯 ENHANCED BUSINESS LOGIC:
- Package limit validation
- Subscription renewals
- Automatic billing
- Usage monitoring
- Overage calculations
- Service provisioning
- **NEW**: Multi-level validation
- **NEW**: Business rule engine
- **NEW**: Automated workflows

### 🔐 SECURITY & RELIABILITY:
- Hostkey authentication
- Request timeout handling
- **NEW**: Comprehensive error handling with ErrorHandler
- **NEW**: Input validation with InputValidator
- **NEW**: Transaction integrity
- **NEW**: Audit trail support
- Data validation
- **NEW**: Security-first design

## 🎯 Migration Guide

### From V2 to V3:
1. **ServiceManager Integration**: Replace direct service calls with ServiceManager
2. **Specialized Managers**: Use appropriate manager for specific operations
3. **Error Handling**: Update error handling to use ErrorHandler
4. **Input Validation**: Add InputValidator for all inputs
5. **Analytics Integration**: Leverage new analytics capabilities

### Example Migration:
```javascript
// OLD (V2)
const packageService = new PackageService(hostkey);
await packageService.assignPackageToCollection(data);

// NEW (V3)
const serviceManager = new ServiceManager(hostkey);
await serviceManager.businessFlow.assignPackageToCollection(data);

// Access analytics
const healthReport = await serviceManager.analytics.getFinancialHealthReport(collectionId);
``` 