import { attachFunctions } from '../function/function.js';
import attachMediaFunctions from '../function/media.js';

export function initMainController(ctx) {
  // ผูกเมธอดทั้งหมดกลับเข้า ctx
  attachFunctions(ctx);
  attachMediaFunctions(ctx);
  
  // สร้าง debouncedList ถ้ายังไม่มี
  if (!ctx.debouncedList) {
    ctx.debouncedList = (() => {
      let t; 
      return () => { 
        clearTimeout(t); 
        t = setTimeout(() => ctx.listFile(ctx.prefix), 200); 
      };
    })();
  }
}

export default initMainController;
