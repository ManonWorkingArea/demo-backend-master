# ERP Breadcrumb Component

## Overview
A responsive breadcrumb navigation component for Vue 3 applications with Tailwind CSS styling.

## Usage

### Basic Import
```javascript
import ErpBreadcrumb from '@/extensions/modules/erp/components/breadcrumb'
// or
import { ErpBreadcrumb } from '@/extensions/modules/erp/components/breadcrumb'
```

### Template Usage
```vue
<template>
  <ErpBreadcrumb :nav="breadcrumbItems" />
</template>

<script>
export default {
  data() {
    return {
      breadcrumbItems: [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Users', path: '/users' },
        { name: 'Profile', active: true }
      ]
    }
  }
}
</script>
```

## Props

### nav (required)
- **Type**: `Array`
- **Required**: `true`
- **Description**: Array of navigation items

#### Nav Item Structure
```javascript
{
  name: 'Item Name',     // Required: Display text
  path: '/path',         // Optional: Router path (if clickable)
  icon: 'fas fa-home',   // Optional: FontAwesome icon class
  active: true           // Optional: Mark as current page
}
```

## Features

- **Router Integration**: Automatic Vue Router links
- **Icon Support**: FontAwesome icons
- **Responsive Design**: Mobile-friendly layout
- **Accessibility**: Proper ARIA labels and semantic HTML
- **Validation**: Props validation for data integrity

## Examples

### Simple Breadcrumb
```javascript
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'Product Details', active: true }
]
```

### With Icons
```javascript
const breadcrumbs = [
  { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-tachometer-alt' },
  { name: 'Settings', path: '/settings', icon: 'fas fa-cog' },
  { name: 'Profile', active: true, icon: 'fas fa-user' }
]
```

### Dynamic Breadcrumbs
```javascript
computed: {
  breadcrumbItems() {
    return this.$route.matched.map((route, index) => ({
      name: route.meta.title || route.name,
      path: index < this.$route.matched.length - 1 ? route.path : null,
      icon: route.meta.icon,
      active: index === this.$route.matched.length - 1
    }))
  }
}
```

## Styling

Uses Tailwind CSS classes for styling:
- Background: `bg-gray-100`
- Text colors: `text-gray-500`, `text-gray-600`, `text-blue-600`
- Hover effects: `hover:text-gray-700`, `hover:text-blue-800`
- Transitions: Smooth color transitions

## Accessibility

- Proper semantic HTML with `<nav>` and `<ol>`
- ARIA label for breadcrumb navigation
- Clear visual hierarchy with hover states
- Keyboard navigation support through router links