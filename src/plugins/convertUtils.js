class ConvertUtils {
  timeToSeconds(time) {
    const [hours, minutes, seconds] = time.split(":");
    return (+hours * 60 * 60) + (+minutes * 60) + (+seconds);
  }

  secondsToTime(seconds) {
    const date = new Date(seconds * 1000);
    return date.toISOString().substr(11, 8);
  }

  formatCurrency(number) {
    return number.toLocaleString('th-TH', {
      style: 'currency',
      currency: 'THB',
    });
  }

  formatNumber(number) {
    // Check if 'number' is undefined or not a finite number
    if (number === undefined || !isFinite(number)) {
      return "0"; // or return ""; for an empty string if you prefer
    }
    
    // Proceed with formatting the number
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  getFileType(mimeType) {
    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType.startsWith('video/')) {
      return 'media';
    } else if (mimeType.startsWith('audio/')) {
      return 'media';
    } else if (mimeType.startsWith('application/')) {
      return 'document';
    }
    else if (mimeType.startsWith('text/')) {
      return 'document';
    } else {
      // Add more checks for other types as needed
      return 'unknown';
    }
  }

  toThaiDatetime(dateString, option = 'full') {
    const date = new Date(dateString);
    let dayNames, monthNames;
    if (option === 'full'||option === 'datefull') {
      dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
      monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    } else {
      dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
      monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    }
    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear() + 543;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    if (option === 'full') {
      return `วัน ${dayName} ที่ ${day} ${monthName} พ.ศ. ${year} เวลา ${hours}:${minutes}:${seconds}`;
    } else if (option === 'datefull') {
      return `${day} เดือน ${monthName} พ.ศ. ${year}`;
    } else if (option === 'date')  {
      return `${day} ${monthName} ${year}`;
    }else if (option === 'time')  {
      return `${hours}:${minutes}:${seconds}`;
    }else if (option === 'short')  {
      return `${day} ${monthName} ${year} ${hours}:${minutes}:${seconds}`;
    }
  }
  
  formatPrice(regular, sale) {
    regular = Number(regular); // Convert string to number if possible
    sale = Number(sale); // Convert string to number if possible

    if (typeof regular === 'number' && !isNaN(regular) && regular !== undefined) {
      if (typeof sale === 'number' && !isNaN(sale) && sale !== undefined) {
        if (regular > 0 || sale > 0) {
          if (sale > 0) {
            const discount = ((regular - sale) / regular) * 100;
            return `
            <span class="price-sale text-[24px] font-semibold">
              ${sale.toLocaleString()} 
              <span class="font-normal text-[16px]">บาท</span>
              <small class="font-normal text-[16px]">
                (${discount.toFixed(0)}% <span class="font-normal">off</span>)
              </small>
              </span><br>
              <span class="price-regular text-[18px] text-gray-500 line-through">${regular.toLocaleString()} <span class="font-normal text-[16px]">บาท</span>
            </span>`;
          } else {
            return `<span class="price-regular text-[24px] font-semibold">${regular.toLocaleString()} <span class="font-normal text-[16px]">บาท</span></span>`;
          }
        } else {
          return 'เรียนฟรี ไม่มีค่าใช้จ่าย';
        }
      } else {
        return `<span class="price-regular text-[24px] font-semibold">${regular.toLocaleString()} span class="font-normal text-[16px]">บาท</span></span>`;
      }
    } else {
      return '';
    }
  }

  formatPriceCompact(regular, sale) {
    regular = Number(regular); // Convert string to number if possible
    sale = Number(sale); // Convert string to number if possible

    if (typeof regular === 'number' && !isNaN(regular) && regular !== undefined) {
      if (typeof sale === 'number' && !isNaN(sale) && sale !== undefined) {
        if (regular > 0 || sale > 0) {
          if (sale > 0) {
            const discount = ((regular - sale) / regular) * 100;
            return `<span class="text-[16px]">${sale.toLocaleString()} บาท</span> <span class="line-through text-[10px]">${regular.toLocaleString()} บาท </span>  (${discount.toFixed(0)}% off)`;
          } else {
            return `${regular.toLocaleString()} บาท`;
          }
        } else {
          return 'เรียนฟรี ไม่มีค่าใช้จ่าย';
        }
      } else {
        return `${regular.toLocaleString()} บาท`;
      }
    } else {
      return '';
    }
  }

  formatPriceRaw(regular, sale) {
    regular = Number(regular); // Convert string to number if possible
    sale = Number(sale); // Convert string to number if possible

    if (typeof regular === 'number' && !isNaN(regular) && regular !== undefined) {
      if (typeof sale === 'number' && !isNaN(sale) && sale !== undefined) {
        if (regular > 0 || sale > 0) {
          if (sale > 0) {
            const discount = ((regular - sale) / regular) * 100;
            return [
              {
                text: ` ฿${regular.toLocaleString()}`,
                size: 'line-through text-[18px] text-gray-600 mr-1',
              },
              {
                text: `฿${sale.toLocaleString()}`,
                size: 'text-red-500 text-[28px]',
              },
              {
                text: `${discount.toFixed(0)}% ส่วนลด`,
                size: 'relative bg-red-500 rounded-sm text-white pl-[5px] pr-[5px] pt-[2px] pb-[2px] ml-1 mr-3 text-[12px] -top-[3px]',
              },
            ];
          } else {
            return [
              {
                text: `฿${regular.toLocaleString()}`,
                size: 'text-[28px]',
              },
            ];
          }
        } else {
          return [
            {
              text: 'ฟรี ไม่มีค่าใช้จ่าย',
              size: 'text-[16px]',
            },
          ];
        }
      } else {
        return [
          {
            text: `${regular.toLocaleString()} บาท`,
            size: 'text-[28px]',
          },
        ];
      }
    } else {
      return [];
    }
  }
}

const convertUtilsInstance = new ConvertUtils();
export default convertUtilsInstance;
