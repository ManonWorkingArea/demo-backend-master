// duedate.js

export function toBangkokTime(date) {
    const options = { timeZone: 'Asia/Bangkok', hour12: false };
    return new Date(date.toLocaleString('en-US', options));
  }
  
  export function getDifference(start, end) {
    const diffMs = Math.abs(end - start);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days: diffDays, hours: diffHours };
  }
  
  export function checkDateStatus(startDate, endDate = null) {
    const start = toBangkokTime(new Date(startDate));
    const now = toBangkokTime(new Date());
    let status = '';
    let message = '';
  
    if (endDate) {
      const end = toBangkokTime(new Date(endDate));
  
      if (now >= start && now <= end) {
        const diffFromStart = getDifference(start, now);
        const diffToEnd = getDifference(now, end);
        status = 'in';
        message = `เริ่มมาแล้ว ${diffFromStart.days} วัน ${diffFromStart.hours} ชั่วโมง จะจบในอีก ${diffToEnd.days} วัน ${diffToEnd.hours} ชั่วโมง`;
      } else if (now < start) {
        const diff = getDifference(now, start);
        status = 'not';
        message = `จะถึงในอีก ${diff.days} วัน ${diff.hours} ชั่วโมง`;
      } else if (now > end) {
        const diff = getDifference(end, now);
        status = 'over';
        message = `เกินกำหนดมา ${diff.days} วัน ${diff.hours} ชั่วโมง`;
      }
    } else {
      if (now < start) {
        const diff = getDifference(now, start);
        status = 'not';
        message = `จะถึงในอีก ${diff.days} วัน ${diff.hours} ชั่วโมง`;
      } else if (now >= start) {
        const diff = getDifference(start, now);
        status = 'over';
        message = `เกินกำหนดมา ${diff.days} วัน ${diff.hours} ชั่วโมง`;
      }
    }
  
    return { status, message };
  }
  