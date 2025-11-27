exports.player = [
    {code: "demand", slug: "On-Demand", name: "ไฟล์วีดีโอ"},
    {code: "streaming", slug: "Streaming", name: "ลิงค์สตรีมมิ่ง"},
    {code: "live", slug: "live", name: "ไลฟ์"},
    {code: "youtube", slug: "Youtube", name: "Youtube"},
    {code: "document", slug: "Document", name: "เอกสาร"},
    {code: "exam", slug: "Exam", name: "แบบทดสอบ"},
    {code: "folder", slug: "Folder", name: "บทเรียนแบบกลุ่ม"}
];

exports.player_sub = [
    {code: "demand", slug: "On-Demand", name: "ไฟล์วีดีโอ"},
    {code: "streaming", slug: "Streaming", name: "ลิงค์สตรีมมิ่ง"},
    {code: "live", slug: "LIVE", name: "ไลฟ์"},
    {code: "youtube", slug: "Youtube", name: "ฝั่ง Youtube Embed"},
    {code: "document", slug: "Document", name: "เอกสาร"},
    {code: "exam", slug: "Exam", name: "แบบทดสอบ"},
];

exports.exam = [
    {code: "general", name: "ข้อสอบทั่วไป"},
    {code: "pre", name: "ข้อสอบก่อนเรียน"},
    {code: "post", name: "ข้อสอบหลังเรียน"}
];

exports.mode = [
    {code: "standard", name: "คอร์สธรรมดา", description: "คอร์สเรียนตามปกติ จำกัดการเรียนด้วยเงื่อนไข"},
    {code: "buffe", name: "คอร์สบุฟเฟต์", description: "เรียนได้ไม่จำกัดภายในเงื่อนไขที่กำหนด"},
    {code: "seminar", name: "คอร์สสัมนนา", description: "หลักสูตรสัมมนา"},
];

exports.display = [
    {code: "step", name: "เรียนตามลำดับ", description: "ต้องเรียนให้จบเป็นลำดับไปทีละบท"},
    {code: "full", name: "เรียนได้ทั้งหมด", description: "สามารถเลือกเรียนได้เองทุกบท"},
    {code: "onsite", name: "อบรมในสสถานที่", description: "ฝึกอบรมในสถานที่"},
];

exports.view = [
    {code: "single", name: "หลักสูตรเดี่ยว (Single Course)", description: "เรียนแบบหลักสูตรเดี่ยว"},
    {code: "multiple", name: "หลักสูตรรวม (Multiple Course)", description: "เรียนแบบหลักสูตรรวม"},
];

exports.kind = [
    {code: "e_learning", name: "หลักสูตร e-Learning", description: "ศูนย์รวมหลักสูตรออนไลน์"},
    {code: "onsite", name: "หลักสูตร Onsite", description: "ศูนย์รวมหลักสูตรสัมมนา"},
    {code: "public_course", name: "หลักสูตร Public Course", description: "รวมหลักสูตรที่เผนแพร่จากสาธารณะ"},
    {code: "online_course", name: "หลักสูตร Online Course", description: "งานอบรมผ่านการสัมมนาออนไลน์"},
    {code: "premium_course", name: "หลักสูตร Premium Course", description: "หลักสูตรพิเศษเฉพาะสำหรับสมาชิก"},
];

exports.budget = [
    {code: "pre", name: "สำรองที่นั่ง", description: "สำรองที่นั่งล่วงหน้า"},
    {code: "free", name: "เรียนฟรี", description: "เรียนฟรีไม่มีเงื่อนไข"},
    {code: "paid", name: "จ่ายเงิน", description: "มีค่าใช้จ่ายในกาเรลงทะเบียน"},
];