# คู่มือการตั้งค่าปุ่ม Login - สำหรับทีม Frontend

## 📌 Overview
ระบบการตั้งค่าปุ่ม Login ช่วยให้ Admin สามารถปรับแต่งรูปลักษณ์ปุ่ม Login ของแต่ละ Service (Microsoft, Google, Facebook, Line) ได้อย่างละเอียด

## 🛠️ วิธีการตั้งค่าปุ่ม

### 1. เข้าสู่หน้าการตั้งค่า
```
Admin Panel → การตั้งค่าการเข้าสู่ระบบ → ปรับแต่งปุ่มทั้งหมด
```

### 2. เลือก Quick Templates (แนะนำ)
มี Template ที่สร้างไว้แล้ว 6 แบบ:

- **Default**: สีแบรนด์หลักของแต่ละบริการ
- **Minimal**: สีขาว เรียบง่าย เหมาะกับดีไザน์สะอาด
- **Dark Mode**: เหมาะกับธีมมืด
- **Compact**: ขนาดเล็ก สำหรับพื้นที่จำกัด
- **Professional**: ดีไซน์เป็นทางการ
- **Developer**: พร้อม debug info

### 3. ปรับแต่งด้วยตนเอง (Advanced)
สามารถปรับแต่งได้ทุกรายละเอียด:

#### Basic Settings:
- **Button Text**: ข้อความบนปุ่ม
- **Button Size**: small, medium, large, xl
- **Button Width**: auto, full

#### Colors:
- **Background Color**: สีพื้นหลังปุ่ม
- **Text Color**: สีข้อความ
- **Hover Background**: สีพื้นหลังเมื่อ hover
- **Hover Text**: สีข้อความเมื่อ hover

#### Icon Settings:
- **Icon Display**: left, right, none
- **Icon Size**: 16-32px
- **Icon Color**: สีของไอคอน (จะปรับ URL อัตโนมัติ)

#### Advanced:
- **Border Radius**: กำหนดมุมโค้ง
- **Debug Mode**: แสดงข้อมูลการ debug

## 📊 โครงสร้างข้อมูลที่บันทึก

### API Endpoint สำหรับดึงข้อมูล:
```
GET /api/hostname/{hostnameId}
```

### Response Structure:
```json
{
  "loginConfig": {
    "microsoftOffice365": true,
    "googleGSuit": true,
    "facebookLogin": true,
    "line": true,
    "buttonConfigs": {
      "microsoft": {
        "text": "เข้าสู่ระบบด้วย Microsoft",
        "subText": "",
        "enableDebug": false,
        "backgroundColor": "#ffffff",
        "textColor": "#374151",
        "hoverBackgroundColor": "#f9fafb",
        "hoverTextColor": "#111827",
        "size": "medium",
        "rounded": "true",
        "iconDisplay": "left",
        "iconSize": "18",
        "iconColor": "#6b7280",
        "width": "full",
        "completeConfig": {
          "icon": {
            "display": "left",
            "size": 18,
            "color": "#6b7280",
            "url": "https://img.icons8.com/ios-filled/50/6B7280/microsoft.png"
          },
          "serviceType": "microsoft",
          "serviceName": "Microsoft",
          "generatedAt": "2025-09-22T10:00:00.000Z",
          "cssClass": "login-button-microsoft",
          "computedStyles": {
            "padding": "0.5rem 1rem",
            "fontSize": "1rem",
            "borderRadius": "9999px"
          }
        }
      },
      "google": {
        // Google config structure similar to microsoft
      },
      "facebook": {
        // Facebook config structure similar to microsoft
      },
      "line": {
        // Line config structure similar to microsoft
      }
    }
  }
}
```

## 🎨 การนำไปใช้งานใน Frontend

### 1. ดึงข้อมูล Configuration
```javascript
// Fetch login configuration
const response = await fetch(`/api/hostname/${hostnameId}`);
const data = await response.json();
const buttonConfigs = data.loginConfig?.buttonConfigs || {};
```

### 2. แสดงปุ่ม Login
```javascript
// Example for Microsoft button
const microsoftConfig = buttonConfigs.microsoft;

if (microsoftConfig) {
  const button = createLoginButton({
    text: microsoftConfig.text,
    backgroundColor: microsoftConfig.backgroundColor,
    textColor: microsoftConfig.textColor,
    hoverBackgroundColor: microsoftConfig.hoverBackgroundColor,
    hoverTextColor: microsoftConfig.hoverTextColor,
    size: microsoftConfig.size,
    iconUrl: microsoftConfig.completeConfig?.icon?.url,
    iconDisplay: microsoftConfig.iconDisplay,
    borderRadius: microsoftConfig.rounded === 'true' ? '9999px' : '0.375rem',
    width: microsoftConfig.width === 'full' ? '100%' : 'auto'
  });
}
```

### 3. CSS Styling (แนะนำใช้ Tailwind CSS)
```css
.login-button {
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

/* Size variants */
.login-button-small { padding: 0.375rem 0.75rem; font-size: 0.875rem; }
.login-button-medium { padding: 0.5rem 1rem; font-size: 1rem; }
.login-button-large { padding: 0.75rem 1.5rem; font-size: 1.125rem; }
.login-button-xl { padding: 1rem 2rem; font-size: 1.25rem; }
```

### 4. React Component Example
```jsx
import React from 'react';

const LoginButton = ({ config, serviceType, onClick }) => {
  const {
    text,
    backgroundColor,
    textColor,
    hoverBackgroundColor,
    hoverTextColor,
    size,
    width,
    rounded,
    iconDisplay,
    completeConfig
  } = config;

  const buttonStyle = {
    backgroundColor,
    color: textColor,
    padding: completeConfig?.computedStyles?.padding,
    fontSize: completeConfig?.computedStyles?.fontSize,
    borderRadius: completeConfig?.computedStyles?.borderRadius,
    width: width === 'full' ? '100%' : 'auto'
  };

  const hoverStyle = {
    backgroundColor: hoverBackgroundColor,
    color: hoverTextColor
  };

  return (
    <button
      className={`login-button login-button-${serviceType}`}
      style={buttonStyle}
      onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
      onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
      onClick={onClick}
    >
      {iconDisplay === 'left' && completeConfig?.icon?.url && (
        <img 
          src={completeConfig.icon.url} 
          alt={serviceType}
          style={{ 
            width: `${completeConfig.icon.size}px`, 
            height: `${completeConfig.icon.size}px` 
          }}
        />
      )}
      
      <span>{text}</span>
      
      {iconDisplay === 'right' && completeConfig?.icon?.url && (
        <img 
          src={completeConfig.icon.url} 
          alt={serviceType}
          style={{ 
            width: `${completeConfig.icon.size}px`, 
            height: `${completeConfig.icon.size}px` 
          }}
        />
      )}
      
      {config.enableDebug && config.subText && (
        <div className="text-xs opacity-75">{config.subText}</div>
      )}
    </button>
  );
};

// Usage
const MicrosoftLoginButton = () => {
  const microsoftConfig = buttonConfigs.microsoft;
  
  return (
    <LoginButton
      config={microsoftConfig}
      serviceType="microsoft"
      onClick={() => window.location.href = '/auth/microsoft'}
    />
  );
};
```

## 🔧 Dynamic Icon URLs

ระบบใช้ Icons8 และปรับสีอัตโนมัติ:

```javascript
// Pattern: https://img.icons8.com/ios-filled/50/{COLOR}/{ICON_NAME}.png
// Example: https://img.icons8.com/ios-filled/50/6B7280/microsoft.png

const generateIconUrl = (iconName, color, size = 50) => {
  const cleanColor = color.replace('#', '');
  return `https://img.icons8.com/ios-filled/${size}/${cleanColor}/${iconName}.png`;
};
```

## ✅ Service Types และ Icon Names

| Service Type | Icon Name | Default Colors |
|--------------|-----------|----------------|
| `microsoft` | `microsoft` | #0078d4 |
| `google` | `google-logo` | #4285f4 |
| `facebook` | `facebook` | #1877f2 |
| `line` | `line` | #00c300 |

## 🚀 Best Practices

### 1. Fallback Values
```javascript
const getButtonConfig = (serviceType) => {
  const config = buttonConfigs[serviceType];
  
  return {
    text: config?.text || `Sign in with ${serviceType}`,
    backgroundColor: config?.backgroundColor || getDefaultColor(serviceType),
    textColor: config?.textColor || '#ffffff',
    size: config?.size || 'medium',
    // ... other fallbacks
  };
};
```

### 2. Caching
```javascript
// Cache button configs to reduce API calls
const CACHE_KEY = `button-configs-${hostnameId}`;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedButtonConfigs = async () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  const fresh = await fetchButtonConfigs();
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data: fresh,
    timestamp: Date.now()
  }));
  
  return fresh;
};
```

### 3. Responsive Design
```css
/* Mobile-first approach */
.login-button {
  width: 100%;
  margin-bottom: 0.75rem;
}

@media (min-width: 768px) {
  .login-button {
    width: auto;
    min-width: 200px;
    margin-right: 0.75rem;
    margin-bottom: 0;
  }
}
```

## 🐛 Debug Mode

เมื่อ `enableDebug: true` และมี `subText`:

```jsx
{config.enableDebug && config.subText && (
  <div className="debug-info">
    <small className="text-xs opacity-75 block">
      {config.subText}
    </small>
  </div>
)}
```

## 📞 Support

หากมีปัญหาหรือคำถาม:
1. ตรวจสอบ API response ก่อน
2. ดู browser console หา error
3. ทดสอบกับ default values
4. ติดต่อทีม Backend หากมีปัญหา configuration

---

**หมายเหตุ**: คู่มือนี้อัปเดตล่าสุด วันที่ 22 กันยายน 2025