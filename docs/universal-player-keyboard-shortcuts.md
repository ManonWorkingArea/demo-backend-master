# UniversalPlayer Keyboard Shortcuts

UniversalPlayer รองรับ keyboard shortcuts ที่หลากหลายเพื่อให้ผู้ใช้สามารถควบคุม video player ได้อย่างรวดเร็วและสะดวก

## เบื้องต้น (Basic Controls)

| Key | Action | Description |
|-----|--------|-------------|
| `Space` | Play/Pause | เล่น/หยุดวิดีโอ |
| `K` | Play/Pause | เล่น/หยุดวิดีโอ (YouTube style) |
| `←` | Seek Backward | เลื่อนหลัง 10 วินาทีน |
| `→` | Seek Forward | เลื่อนหน้า 10 วินาที |
| `↑` | Volume Up | เพิ่มเสียง 10% |
| `↓` | Volume Down | ลดเสียง 10% |
| `M` | Mute/Unmute | เปิด/ปิดเสียง |
| `F` | Fullscreen | เข้า/ออกจากโหมดเต็มจอ |

## ขั้นสูง (Advanced Controls)

### Navigation
| Key | Action | Description |
|-----|--------|-------------|
| `J` | Seek Back | เลื่อนหลัง 10 วินาที (YouTube style) |
| `L` | Seek Forward | เลื่อนหน้า 10 วินาที (YouTube style) |
| `,` | Frame Back | เลื่อนหลัง 1 วินาที (precision seeking) |
| `.` | Frame Forward | เลื่อนหน้า 1 วินาที (precision seeking) |
| `0` | Jump to Start | กระโดดไปจุดเริ่มต้น |
| `Home` | Jump to Start | กระโดดไปจุดเริ่มต้น |
| `End` | Jump to End | กระโดดไปจุดสิ้นสุด |

### Percentage Seeking
| Key | Action | Description |
|-----|--------|-------------|
| `1` | Jump to 10% | กระโดดไป 10% ของวิดีโอ |
| `2` | Jump to 20% | กระโดดไป 20% ของวิดีโอ |
| `3` | Jump to 30% | กระโดดไป 30% ของวิดีโอ |
| `4` | Jump to 40% | กระโดดไป 40% ของวิดีโอ |
| `5` | Jump to 50% | กระโดดไป 50% ของวิดีโอ |
| `6` | Jump to 60% | กระโดดไป 60% ของวิดีโอ |
| `7` | Jump to 70% | กระโดดไป 70% ของวิดีโอ |
| `8` | Jump to 80% | กระโดดไป 80% ของวิดีโอ |
| `9` | Jump to 90% | กระโดดไป 90% ของวิดีโอ |

### Playback Speed
| Key | Action | Description |
|-----|--------|-------------|
| `<` | Decrease Speed | ลดความเร็ว 0.25x (minimum 0.25x) |
| `>` | Increase Speed | เพิ่มความเร็ว 0.25x (maximum 2x) |

### Special
| Key | Action | Description |
|-----|--------|-------------|
| `Escape` | Exit Fullscreen | ออกจากโหมดเต็มจอ |

## การใช้งาน

### แสดง UI Controls
เมื่อใช้ keyboard shortcuts UI controls จะแสดงขึ้นมาชั่วคราวเพื่อให้ผู้ใช้เห็น feedback

### Input Field Protection
Keyboard shortcuts จะไม่ทำงานเมื่อ focus อยู่ใน input fields (INPUT, TEXTAREA, SELECT) เพื่อป้องกันการรบกวนการพิมพ์

## ตัวอย่างการใช้งาน

### การดู Video แบบรวดเร็ว
1. กด `Space` เพื่อเล่นวิดีโอ
2. กด `5` เพื่อข้ามไปครึ่งหนึ่งของวิดีโอ
3. กด `>` เพื่อเร่งความเร็วเป็น 1.25x
4. กด `F` เพื่อดูแบบเต็มจอ

### การควบคุมแบบละเอียด
1. กด `,` และ `.` เพื่อเลื่อนทีละวินาที
2. กด `↑` และ `↓` เพื่อปรับเสียง
3. กด `M` เพื่อปิดเสียงชั่วคราว

## Compatibility

Keyboard shortcuts ทำงานร่วมกับ:
- ✅ Chrome/Chromium browsers
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (ถ้ามี physical keyboard)

## Features

- **Smart Focus Detection**: ไม่ทำงานเมื่อพิมพ์ใน input fields
- **Visual Feedback**: แสดง UI controls เมื่อใช้ keyboard
- **YouTube Compatible**: รองรับ shortcuts แบบ YouTube
- **Precision Control**: ควบคุมได้ละเอียดทั้งเวลาและเสียง
- **Speed Control**: ปรับความเร็วได้ตามต้องการ

## การกำหนดค่าเพิ่มเติม

สามารถปิด keyboard shortcuts ได้โดยการ:

```javascript
// ใน component ที่ใช้ UniversalPlayer
<UniversalPlayer
  :enableKeyboardControls="false"
  // props อื่นๆ
/>
```

หรือแก้ไขใน composable โดยตรง:

```javascript
// ใน useUniversalPlayer.js
const enableKeyboardControls = props.enableKeyboardControls !== false;

if (enableKeyboardControls) {
  document.addEventListener('keydown', onKeyDown);
}
```
