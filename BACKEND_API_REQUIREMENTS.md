# Backend API Requirements for Corporate Config

## Overview
The frontend AccountingSettings service requires the following API endpoints to be implemented on the backend server.

## Required Endpoints

### 1. GET /api/corporate-config
**Purpose**: Retrieve configuration by config_key, module, or category

**Query Parameters**:
- `config_key` (optional): Unique key like "accounting.account_mapping"
- `module` (optional): Module name like "accounting"
- `category` (optional): Category like "account_mapping"

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "config_key": "accounting.account_types",
      "module": "accounting",
      "category": "account_types",
      "config_data": {
        "asset": { "name": "Asset", "name_th": "สินทรัพย์", ... },
        "liability": { ... }
      },
      "name": "Account Types Configuration",
      "description": "ประเภทบัญชีทั้งหมดในระบบ",
      "version": "1.0.0",
      "is_public": false,
      "is_system": false,
      "created_by": "user_id",
      "created_at": "2025-11-06T...",
      "updated_at": "2025-11-06T..."
    }
  ]
}
```

### 2. POST /api/corporate-config/upsert
**Purpose**: Create or update configuration (recommended endpoint)

**Request Body**:
```json
{
  "config_key": "accounting.account_types",
  "module": "accounting",
  "category": "account_types",
  "config_data": {
    "asset": { "name": "Asset", "name_th": "สินทรัพย์", ... }
  },
  "name": "Account Types Configuration",
  "description": "ประเภทบัญชีทั้งหมดในระบบ",
  "version": "1.0.0"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Configuration updated successfully",
  "data": { /* updated document */ }
}
```

### 3. POST /api/corporate-config
**Purpose**: Create new configuration

**Request Body**: Same as upsert

**Response**:
```json
{
  "success": true,
  "message": "Configuration created successfully",
  "data": { /* created document */ }
}
```

### 4. PUT /api/corporate-config/:id
**Purpose**: Update existing configuration by ID

**Request Body**: Same as upsert (without config_key)

**Response**:
```json
{
  "success": true,
  "message": "Configuration updated successfully",
  "data": { /* updated document */ }
}
```

### 5. DELETE /api/corporate-config/:id
**Purpose**: Delete configuration by ID

**Response**:
```json
{
  "success": true,
  "message": "Configuration deleted successfully"
}
```

## Database Schema

### Collection: `corporate_config`

**Fields**:
- `config_key` (String, required, unique) - Format: "module.category"
- `module` (String, required) - Module name
- `category` (String, required) - Category name
- `config_data` (Object, required) - Actual configuration data (JSON)
- `name` (String, optional) - Display name
- `description` (String, optional) - Description
- `version` (String, default: "1.0.0") - Configuration version
- `is_public` (Boolean, default: false) - Public access flag
- `is_system` (Boolean, default: false) - System config (prevent deletion)
- `created_by` (ObjectId, optional) - User who created
- `updated_by` (ObjectId, optional) - User who last updated
- `created_at` (Date, auto) - Creation timestamp
- `updated_at` (Date, auto) - Update timestamp

**Indexes**:
```javascript
db.corporate_config.createIndex({ config_key: 1 }, { unique: true })
db.corporate_config.createIndex({ module: 1, category: 1 })
db.corporate_config.createIndex({ module: 1 })
```

## Implementation Reference

The API route implementation is available at:
- `/api/corporate-config.js` - Complete Express.js route handlers

The schema definition is available at:
- `/src/extensions/modules/erp/schemas/CorporateConfig.js`

## Current Behavior

**Without Backend API**:
- Frontend makes API calls to `/api/corporate-config`
- Returns 404 error
- AccountingSettings catches error and uses default values
- System works with hardcoded defaults (no persistence)

**With Backend API**:
- Settings are saved to database
- Persists across sessions
- Can be shared across users (if is_public=true)
- Supports versioning and audit trail

## Testing

Once backend is deployed, test with:

```bash
# Get config
curl -X GET "https://gateway.cloudrestfulapi.com/api/corporate-config?config_key=accounting.account_types" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Save config
curl -X POST "https://gateway.cloudrestfulapi.com/api/corporate-config/upsert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "config_key": "accounting.account_types",
    "module": "accounting",
    "category": "account_types",
    "config_data": { ... }
  }'
```

## Next Steps

1. Deploy `/api/corporate-config.js` to backend server
2. Register route in Express app
3. Create MongoDB collection with indexes
4. Test endpoints with curl/Postman
5. Verify frontend can save/load settings
