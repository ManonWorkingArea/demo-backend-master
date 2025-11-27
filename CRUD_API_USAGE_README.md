# CRUD API Usage Guide

## Overview
Simple guide for API CRUD operations in this system. Two approaches: Legacy `RequestClient` and Modern `ApiRequest`.

## API Methods

### Setup
```javascript
// Legacy
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

// Modern
inject: ["apiRequest"],
```

### get() - Get All Resources
```javascript
// Legacy
const response = await Request.POST('user/query', { 
  method: 'find', 
  args: [{ active: true }] 
}, this.configs.key);
const users = response.data;

// Modern
const users = await this.makeApiCall('user/query', 'POST', { 
  method: 'find', 
  args: [{ active: true }] 
});
```

### get(id) - Get Single Resource
```javascript
// Legacy
const response = await Request.GET(`user/123`, this.configs.key);
const user = response.data;

// Modern
const user = await this.makeApiCall(`user/123`, 'GET');
```

### query() - Advanced Query
```javascript
// Legacy
const response = await Request.POST('user/query', {
  method: 'find',
  args: [{ 
    role: 'admin',
    createdAt: { $gte: '2024-01-01' }
  }]
}, this.configs.key);

// Modern
const users = await this.makeApiCall('user/query', 'POST', {
  method: 'find',
  args: [{ 
    role: 'admin',
    createdAt: { $gte: '2024-01-01' }
  }]
});
```

### add() - Create New Resource
```javascript
// Legacy
const response = await Request.POST('user/', { 
  data: { 
    name: 'John',
    email: 'john@example.com',
    unit: this.session.current._id
  } 
}, this.configs.key);

// Modern
const newUser = await this.makeApiCall('user/', 'POST', { 
  name: 'John',
  email: 'john@example.com',
  unit: this.session.current._id
});
```

### update() - Update Resource
```javascript
// Legacy
const response = await Request.PUT(`user/123`, { 
  data: { 
    name: 'John Updated',
    _id: undefined // Remove _id
  } 
}, this.configs.key);

// Modern
const updated = await this.makeApiCall(`user/123`, 'PUT', { 
  name: 'John Updated',
  _id: undefined // Remove _id
});
```

### delete() - Delete Resource
```javascript
// Legacy
const response = await Request.DELETE(`user/123`, {}, this.configs.key);

// Modern
const result = await this.makeApiCall(`user/123`, 'DELETE');
```

## Helper Method (Modern)
```javascript
async makeApiCall(endpoint, method = 'GET', body = null) {
  if (!this.apiRequest) {
    throw new Error('ApiRequest service not available');
  }

  let fullEndpoint = endpoint;
  if (!endpoint.startsWith('http') && !endpoint.startsWith('/api')) {
    fullEndpoint = `/api/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
  }

  try {
    const response = await this.apiRequest.apiCall(fullEndpoint, method, null, body);
    return response?.data || response;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}
```

## Key Differences
| Feature | Legacy | Modern |
|---------|--------|--------|
| **Auth** | Manual `this.configs.key` | Automatic |
| **Data** | `{ data: payload }` wrapper | Direct payload |
| **Response** | `response.data` | Direct response |
| **Error** | Manual handling | Built-in retry |

## Common Patterns
```javascript
// Resource endpoints
user/          // Users
post/          // Posts  
product/       // Products
calendar/      // Calendars
calendar_event/ // Events

// Query structure
{
  method: 'find',
  args: [{ field: 'value' }],
  options: { limit: 10, skip: 0, sort: { createdAt: -1 } }
}
```
