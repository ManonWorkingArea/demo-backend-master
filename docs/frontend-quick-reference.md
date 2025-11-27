# Login Button Configuration - Quick Reference

## 🎯 สำหรับทีม Frontend (.oeditor)

### API Endpoint
```
GET /api/hostname/{hostnameId}
Response: { loginConfig: { buttonConfigs: { ... } } }
```

### Configuration Structure
```javascript
buttonConfigs: {
  microsoft: {
    // Basic Settings
    text: "เข้าสู่ระบบด้วย Microsoft",
    backgroundColor: "#ffffff",
    textColor: "#374151", 
    hoverBackgroundColor: "#f9fafb",
    hoverTextColor: "#111827",
    
    // Layout
    size: "medium",        // small|medium|large|xl
    width: "full",         // auto|full
    rounded: "true",       // true|false
    
    // Icon
    iconDisplay: "left",   // left|right|none
    iconSize: "18",
    iconColor: "#6b7280",
    
    // Debug (optional)
    enableDebug: false,
    subText: "",
    
    // Complete metadata
    completeConfig: {
      icon: {
        url: "https://img.icons8.com/ios-filled/50/6B7280/microsoft.png"
      },
      serviceType: "microsoft",
      computedStyles: { ... }
    }
  }
}
```

### React Implementation
```jsx
const LoginButton = ({ config, serviceType }) => {
  const style = {
    backgroundColor: config.backgroundColor,
    color: config.textColor,
    padding: config.size === 'large' ? '0.75rem 1.5rem' : '0.5rem 1rem',
    borderRadius: config.rounded === 'true' ? '9999px' : '0.375rem',
    width: config.width === 'full' ? '100%' : 'auto'
  };

  return (
    <button style={style} className="flex items-center gap-2">
      {config.iconDisplay === 'left' && (
        <img src={config.completeConfig.icon.url} width={config.iconSize} />
      )}
      {config.text}
    </button>
  );
};
```

### Template Types Available
- **Default**: Brand colors
- **Minimal**: Clean white design
- **Dark Mode**: Dark theme compatible
- **Compact**: Small size
- **Professional**: Corporate style
- **Developer**: With debug info

### Icon URL Pattern
```
https://img.icons8.com/ios-filled/50/{HEX_COLOR}/{ICON_NAME}.png

Services:
- microsoft → microsoft
- google → google-logo  
- facebook → facebook
- line → line
```

### Fallback Implementation
```javascript
const safeConfig = {
  text: config?.text || `Sign in with ${serviceType}`,
  backgroundColor: config?.backgroundColor || '#ffffff',
  textColor: config?.textColor || '#000000',
  size: config?.size || 'medium'
};
```

---
📋 **Quick Checklist**
- [ ] ดึงข้อมูลจาก `/api/hostname/{hostnameId}`
- [ ] ใช้ `buttonConfigs` object
- [ ] มี fallback values
- [ ] รองรับ hover states
- [ ] ใช้ dynamic icon URLs
- [ ] Handle responsive design