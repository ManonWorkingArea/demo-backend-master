// Context Menu Functions for FileManager
import debug from '@/plugins/Logger.js';

export default function attachContextFunctions(ctx) {
  // Folder Context Menu
  ctx.onContextMenu = function(e, item, old, id, counting) {
    ctx.selectItem = id;
    e.preventDefault();

    // ค้นหาข้อมูลโฟลเดอร์
    const folder = ctx.fileListing.find(f => f._id === id);

    // สร้าง base menu items
    const menuItems = [
      {
        label: item,
        icon: "fa fa-folder",
        divided: true,
      }
    ];

    // เพิ่มเมนูเปลี่ยนชื่อเฉพาะเมื่อมีสิทธิ์เขียน
    if (!(ctx.isShareMode && ctx.shareRootPermission === 'read')) {
      menuItems.push({ 
        label: "เปลี่ยนชื่อโฟลเดอร์", 
        icon: "fa fa-pencil",
        onClick: () => {
          debug.log("Rename", item, id);
          return ctx.openRenameFolder(item, old, id);
        }
      });
    }

    // เพิ่มเมนูเพิ่มเติมเฉพาะในโหมด normal (ไม่ใช่ share mode)
    if (!ctx.isShareMode) {
      // กำหนดข้อความตามสถานะการแชร์
      debug.log("Folder context menu - folder data:", folder);
      debug.log("Folder share status:", folder && folder.share);
      const shareLabel = folder && folder.share ? "แก้ไขการแชร์" : "แชร์โฟลเดอร์";
      debug.log("Folder share label:", shareLabel);
      
      menuItems.push(
        { 
          label: shareLabel, 
          icon: "fa fa-share-alt",
          onClick: () => {
            debug.log("Share", item, id);
            return ctx.openShareFolder(item, id);
          }
        },
        { 
          label: "Assign Space", 
          icon: "fa fa-key",
          onClick: () => {
            debug.log("Assign Space", item, id);
            return ctx.assignSpace(id);
          }
        }
      );
    }

    // เพิ่มเมนูลบเฉพาะเมื่อมีสิทธิ์เขียน
    if (!(ctx.isShareMode && ctx.shareRootPermission === 'read')) {
      menuItems.push({ 
        label: "ลบโฟลเดอร์", 
        icon: "fa fa-trash",
        onClick: () => {
          debug.log("Delete", item);
          return ctx.deleteFolder(item, id, counting);
        }
      });
    }

    ctx.$contextmenu({
      zIndex: 99999,
      x: e.x,
      y: e.y,
      items: menuItems
    });
  };

  // Desktop/Empty Area Context Menu
  ctx.onContextDesktopMenu = function(e) {
    // ตรวจสอบว่าคลิกบนพื้นที่ว่างจริงๆ หรือไม่
    const target = e.target;
    const isEmptyArea = target.classList.contains('grid') || 
                       target.classList.contains('divide-y') ||
                       target.classList.contains('overflow-hidden') ||
                       target.classList.contains('overflow-y-auto') ||
                       target.classList.contains('min-h-96') ||
                       target.classList.contains('relative') ||
                       target.classList.contains('border-dashed') ||
                       target.tagName === 'UL' ||
                       target.tagName === 'DIV' && (
                         target.classList.contains('min-h-32') || 
                         target.classList.contains('min-h-full') ||
                         target.classList.contains('flex-col') ||
                         target.classList.contains('bg-gray-50')
                       );

    // ตรวจสอบว่าเป็น child element ของ empty area หรือไม่
    const isInEmptyArea = target.closest('.min-h-96') || 
                         target.closest('.bg-gray-50') ||
                         target.closest('[role="list"]') ||
                         target.closest('.grid');

    // ถ้าไม่ใช่พื้นที่ว่างและไม่ได้อยู่ใน empty area ให้ return
    if (!isEmptyArea && !isInEmptyArea) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    debug.log("Context menu on empty area triggered", {
      target: target.tagName,
      classes: target.className,
      isEmptyArea,
      isInEmptyArea
    });
    
    // ยกเลิกการเลือกไฟล์
    ctx.unselectItem();
    
    // สร้าง context menu items ตาม permission
    const contextMenuItems = [
      { 
        label: "รีเฟรช", 
        icon: "fa fa-refresh",
        onClick: () => {
          debug.log("Refresh from context menu");
          return ctx.listFile(ctx.prefix);
        }
      }
    ];

    // เพิ่มเมนูเพิ่มเติมเฉพาะเมื่อมีสิทธิ์เขียน
    if (!(ctx.isShareMode && ctx.shareRootPermission === 'read')) {
      contextMenuItems.push(
        { 
          label: "อัพโหลดไฟล์ใหม่", 
          icon: "fa fa-upload",
          onClick: () => {
            debug.log("Upload from context menu");
            return ctx.openUploadBox();
          }
        },
        { 
          label: "สร้างโฟลเดอร์", 
          icon: "fa fa-folder-plus",
          onClick: () => {
            debug.log("Create folder from context menu");
            return ctx.openCreateFolder();
          }
        }
      );
    }

    ctx.$contextmenu({
      zIndex: 99999,
      x: e.x,
      y: e.y,
      items: contextMenuItems
    });
  };

  // File Context Menu
  ctx.onFileContextMenu = function(e, item, old, id, path) {
    debug.log(path);
    ctx.selectItem = id;
    e.preventDefault();
    
    // ค้นหาข้อมูลไฟล์จาก fileListing
    const file = ctx.fileListing.find(f => f._id === id);
    
    const contextMenuItems = [
      {
        label: item,
        icon: "fa fa-file",
        divided: true,
      }
    ];

    // เพิ่มเมนูเปลี่ยนชื่อเฉพาะเมื่อมีสิทธิ์เขียน
    if (!(ctx.isShareMode && ctx.shareRootPermission === 'read')) {
      contextMenuItems.push({
        label: "เปลี่ยนชื่อ",
        icon: "fa fa-pencil",
        onClick: () => {
          debug.log("Rename", item, id);
          ctx.openRenameFolder(item, old, id);
        },
      });
    }

    // เพิ่มเมนูเพิ่มเติมเฉพาะในโหมด normal (ไม่ใช่ share mode)
    if (!ctx.isShareMode) {
      contextMenuItems.push({ 
        label: "Assign Space", 
        icon: "fa fa-key",
        onClick: () => {
          debug.log("Assign Space", item, id);
          return ctx.assignSpace(id);
        }
      });

      // เพิ่มตัวเลือกสำหรับไฟล์รูป
      if (file && file.type === 'image') {
        contextMenuItems.push({
          label: "สร้าง thumbnail ใหม่",
          icon: "fa fa-refresh",
          onClick: () => {
            debug.log("Regenerate thumbnail for", item, id);
            ctx.regenerateThumbnail(file);
          },
        });
      }

      // เพิ่มตัวเลือกสำหรับไฟล์วิดีโอ
      if (file && ctx.isVideoFile(file)) {
        contextMenuItems.push({
          label: "แปลงความละเอียดวิดีโอ",
          icon: "fa fa-cog",
          onClick: () => {
            debug.log("Open transcode panel for", item, id);
            ctx.openTranscodePanel(file);
          },
        });

        // เพิ่มปุ่ม Video Trimmer
        contextMenuItems.push({
          label: "ตัดต่อวิดีโอ",
          icon: "fa fa-cut",
          onClick: () => {
            debug.log("Open video trimmer for", item, id);
            ctx.openVideoTrimmer(file);
          },
        });

        // เพิ่มปุ่ม Video Subtitle  
        contextMenuItems.push({
          label: "จัดการซับไตเติล",
          icon: "fa fa-closed-captioning",
          onClick: () => {
            debug.log("Open video subtitle for", item, id);
            ctx.openVideoSubtitle(file);
          },
        });

        // เพิ่มปุ่ม Make Streaming
        contextMenuItems.push({
          label: "สร้าง Streaming",
          icon: "fa fa-stream",
          onClick: () => {
            debug.log("Make streaming for", item, id);
            const fileUrl = file.url || file.original || `${ctx.configs.s3Endpoint}${file.path}`;
            if (typeof ctx.makeStreaming === 'function') {
              ctx.makeStreaming(fileUrl, file.name, file);
            } else {
              console.error('makeStreaming function not available');
            }
          },
        });
      }

      contextMenuItems.push({
        label: "ย่อขนาดรูป",
        icon: "fa fa-crop",
        onClick: () => {
          debug.log("Resize image", path);
          ctx.resizeOption(path, id);
        },
      });

      contextMenuItems.push({
        label: "สร้างรูปหน้าปกวีดีโอ",
        icon: "fa fa-video",
        onClick: () => {
          debug.log("Video", ctx.configs.s3Endpoint + path);
          ctx.captureThumbnail(ctx.configs.s3Endpoint + path, id);
        },
      });

      // เพิ่มเมนูแชร์ไฟล์เฉพาะในโหมด normal
      // กำหนดข้อความตามสถานะการแชร์
      debug.log("File context menu - file data:", file);
      debug.log("File share status:", file && file.share);
      const shareLabel = file && file.share ? "แก้ไขการแชร์" : "แชร์ไฟล์";
      debug.log("Share label:", shareLabel);
      
      contextMenuItems.push({
        label: shareLabel,
        icon: "fa fa-share-alt",
        onClick: () => {
          debug.log("Share file", item, id);
          ctx.openShareFileModal(id, item);
        },
      });
    }

    // เพิ่มเมนูลบไฟล์เฉพาะเมื่อมีสิทธิ์เขียน
    if (!(ctx.isShareMode && ctx.shareRootPermission === 'read')) {
      contextMenuItems.push({
        label: "ลบไฟล์",
        icon: "fa fa-trash",
        onClick: () => {
          debug.log("Delete", path);
          ctx.deleteFile(item, id, path);
        },
      });
    }

    ctx.$contextmenu({
      zIndex: 99999,
      x: e.x,
      y: e.y,
      items: contextMenuItems,
    });
  };
}
