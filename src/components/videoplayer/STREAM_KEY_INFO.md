# ข้อมูลใน One-Time Stream Key (15 วินาที)

## 🔑 One-Time Stream Key Structure

```javascript
// รูปแบบ One-Time Stream Key
streamKey = "1725987654321.a1b2c3d4e5f6789..."

// โครงสร้าง:  
// <timestamp>.<hash>
```

### ข้อมูลใน Stream Key:
- **Timestamp**: เวลาที่สร้าง stream key (milliseconds)
- **Hash**: SHA-256 hash ของ (timestamp + salt)
- **Salt**: `"UniversalPlayer2024"` (shared secret)
- **Expiry**: หมดอายุใน 15 วินาที

---

## � One-Time Token Generation Process

```javascript
// 1. Get current timestamp
const timestamp = Date.now(); // เช่น 1725987654321

// 2. Create payload (แค่ timestamp)
const payload = timestamp.toString(); // "1725987654321"

// 3. Hash with salt
const dataToHash = payload + "UniversalPlayer2024";
const hash = await crypto.subtle.digest('SHA-256', dataToHash);

// 4. Create stream key
const streamKey = `${timestamp}.${hash}`;
// Result: "1725987654321.a1b2c3d4e5f6..."
```

### ✅ Server-side Validation:

```javascript
// 1. Split stream key
const [timestampStr, receivedHash] = streamKey.split('.');

// 2. Check expiry (15 seconds)
const timestamp = parseInt(timestampStr);
const age = Date.now() - timestamp;
if (age > 15000) {
  return { valid: false, error: 'Expired' };
}

// 3. Verify hash
const expectedHash = await generateHash(timestampStr + salt);
if (receivedHash !== expectedHash) {
  return { valid: false, error: 'Invalid hash' };
}

// 4. Allow access
return { valid: true };
```

---

## 🏗️ Token Generation Process

```javascript
// 1. สร้าง Payload
const payload = {
  ...eventData,        // ข้อมูลที่ส่งเข้ามา
  timestamp: Date.now(),
  sessionId: this.sessionId
};

// 2. สร้าง Hash
const payloadString = JSON.stringify(payload);
const dataToHash = payloadString + "UniversalPlayer2024"; // SHARED_SALT
const hash = await crypto.subtle.digest('SHA-256', dataToHash);

// 3. สร้าง Token
const encodedPayload = btoa(payloadString);
const token = `${encodedPayload}.${hash}`;
```

---

## 🔍 การใช้งานใน Service Worker

เมื่อ Service Worker intercept request จะได้:

### URL Parameters:
```
?stream=secure_1725987654321_abc123
```

### Headers:
```
x-stream-token: eyJldmVudCI6InZpZGVvLXBsYXlpbmciL...
```

---

## 🛡️ Security Features

### 1. **Timestamp Validation**
- Token หมดอายุใน 5 นาที
- ป้องกัน replay attacks

### 2. **SHA-256 Hash**
- ใช้ shared salt: `"UniversalPlayer2024"`
- Verify integrity ของ payload

### 3. **Session Management**
- แต่ละ session มี unique ID
- Track การใช้งานแยกตาม session

---

## 📊 ตัวอย่างข้อมูลจริง

```javascript
// ตัวอย่าง One-Time Stream Key
streamKey: "1725987654321.a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789"

// การ decode stream key
const decoded = secureManager.decodeOneTimeStreamKey(streamKey);
console.log(decoded);
/*
{
  success: true,
  timestamp: 1725987654321,
  hash: "a1b2c3d4e5...",
  age: 5000,  // 5 วินาทีที่ผ่านมา
  ageSeconds: 5,
  isExpired: false,
  remainingSeconds: 10,  // เหลือ 10 วินาที
  issuedAt: "2024-09-11T10:14:14.321Z",
  expiresAt: "2024-09-11T10:14:29.321Z"
}
*/

// การ verify บน server
const verification = await verifyOneTimeStreamKey(streamKey);
/*
{
  valid: true,
  timestamp: 1725987654321,
  age: 5000,
  remainingTime: 10000,
  issuedAt: "2024-09-11T10:14:14.321Z",
  expiresAt: "2024-09-11T10:14:29.321Z"
}
*/
```

---

## 🧪 Debug Functions

```javascript
// ใน SecureStreamManager มี function สำหรับ debug
const result = secureManager.decodeToken(token);
console.log('Token contents:', result.payload);
console.log('Token structure:', result.structure);
```

ใช้เพื่อดูข้อมูลใน token ขณะ development!
