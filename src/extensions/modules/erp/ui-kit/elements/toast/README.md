# ERP Toast Notification System

## Overview
A comprehensive toast notification system built with Vue 3 and Tailwind CSS. Provides various toast types, positions, and advanced features like progress bars and auto-dismiss.

## Installation & Usage

### Import Toast Service
```javascript
import { 
  successToast, 
  errorToast, 
  warningToast, 
  infoToast, 
  darkToast, 
  showToast,
  toast 
} from '@/extensions/modules/erp/components/ToastService.js'
```

## Quick Examples

### Basic Usage
```javascript
// Simple success toast
successToast('Operation completed successfully!')

// Error toast (stays until manually closed)
errorToast('Something went wrong!')

// Warning with custom duration
warningToast('Please check your input', { duration: 3000 })

// Info with title
infoToast('Here is some information', { 
  title: 'Information',
  position: 'center'
})
```

### Advanced Usage
```javascript
// Custom toast with all options
showToast({
  message: 'Custom toast message',
  title: 'Custom Title',
  type: 'success', // success, error, warning, info, dark
  position: 'top-right', // center, top-right, top-left, bottom-right
  duration: 5000, // milliseconds, 0 = permanent
  closable: true
})

// Clear all toasts
toast.clear()
```

## Toast Types

### 1. Success Toast
- **Color**: Green background
- **Icon**: Check circle
- **Use case**: Successful operations, confirmations
```javascript
successToast('Data saved successfully!')
```

### 2. Error Toast
- **Color**: Red background
- **Icon**: Exclamation circle
- **Default**: Permanent (duration: 0)
- **Use case**: Errors, failures
```javascript
errorToast('Failed to save data')
```

### 3. Warning Toast
- **Color**: Yellow background
- **Icon**: Exclamation triangle
- **Use case**: Warnings, cautions
```javascript
warningToast('Please fill all required fields')
```

### 4. Info Toast
- **Color**: Blue background
- **Icon**: Info circle
- **Use case**: Information, notifications
```javascript
infoToast('New update available')
```

### 5. Dark Toast
- **Color**: Dark gray background
- **Icon**: Bell
- **Use case**: General notifications, dark theme
```javascript
darkToast('System maintenance scheduled')
```

## Positions

### Available Positions
- `center` - Center of screen with overlay
- `top-right` - Top right corner (default)
- `top-left` - Top left corner
- `bottom-right` - Bottom right corner

### Position Examples
```javascript
// Center position (modal-like)
showToast({
  message: 'Important message',
  position: 'center',
  type: 'warning'
})

// Top right (default)
showToast({
  message: 'Notification',
  position: 'top-right'
})
```

## Advanced Features

### 1. Progress Bar
Toasts with duration > 0 show a progress bar indicating remaining time:
```javascript
showToast({
  message: 'Processing...',
  duration: 10000, // 10 seconds with progress bar
  type: 'info'
})
```

### 2. Permanent Toasts
Set duration to 0 for permanent toasts (must be manually closed):
```javascript
errorToast('Critical error occurred', { duration: 0 })
```

### 3. Custom Titles
Add titles for more detailed notifications:
```javascript
showToast({
  title: 'Upload Complete',
  message: 'Your file has been uploaded successfully.',
  type: 'success'
})
```

### 4. Non-closable Toasts
Disable the close button:
```javascript
showToast({
  message: 'Processing, please wait...',
  closable: false,
  duration: 0
})
```

## Component Architecture

### ErpToast.vue
- Vue 3 component with Composition API
- Teleport for portal rendering
- Smooth enter/exit animations
- Responsive design
- Accessibility support

### ToastService.js
- Singleton service for toast management
- Maximum toast limit (5 toasts)
- Auto-cleanup and memory management
- Convenient wrapper methods

## Styling & Customization

### Colors
- Success: `bg-green-500`
- Error: `bg-red-500`  
- Warning: `bg-yellow-500`
- Info: `bg-blue-500`
- Dark: `bg-gray-800`

### Animations
- **Center**: Scale in/out with fade
- **Corners**: Slide in from edge with fade
- **Duration**: 300ms enter, 200ms leave

### Mobile Responsive
- Adjusts width on small screens
- Maintains readability and usability
- Touch-friendly close buttons

## Integration Examples

### In Vue Components
```javascript
export default {
  methods: {
    async saveData() {
      try {
        await this.api.save()
        successToast('Data saved successfully!')
      } catch (error) {
        errorToast('Failed to save data: ' + error.message)
      }
    },
    
    showProgress() {
      const toast = showToast({
        message: 'Uploading file...',
        type: 'info',
        duration: 0,
        closable: false
      })
      
      // Close after async operation
      setTimeout(() => {
        toast.instance.close()
        successToast('Upload complete!')
      }, 3000)
    }
  }
}
```

### Global Usage
```javascript
// In main.js or plugin
import { toast } from '@/extensions/modules/erp/components'

app.config.globalProperties.$toast = toast
```

## Best Practices

### 1. Toast Types Usage
- **Success**: Confirmations, completed actions
- **Error**: Failures, validation errors (permanent)
- **Warning**: Cautions, non-critical issues
- **Info**: General information, updates
- **Dark**: System notifications, neutral messages

### 2. Duration Guidelines
- **Success**: 3-5 seconds
- **Warning/Info**: 5-7 seconds  
- **Error**: Permanent (0) or long duration (10+ seconds)
- **Progress operations**: 0 (manual close when done)

### 3. Position Strategy
- **top-right**: Default for most notifications
- **center**: Important messages requiring attention
- **top-left/bottom-right**: Alternative positions for variety

### 4. Message Guidelines
- Keep messages concise and clear
- Use titles for detailed notifications
- Include actionable information when relevant
- Use appropriate icons and colors for context

## Browser Support
- Modern browsers with CSS Grid and Flexbox support
- Vue 3 compatible environments
- Mobile responsive design
- Accessible with screen readers