// builderItems.js

/**
 * Content items สำหรับ Builder
 * ระบบจะสร้าง validTypes จาก type property ของ items เหล่านี้โดยอัตโนมัติ
 * 
 * การเพิ่ม item ใหม่:
 * 1. เพิ่ม item object ในแต่ละ array ตามหมวดหมู่
 * 2. ระบุ type property ที่ unique
 * 3. ระบบจะอัพเดต validTypes ให้โดยอัตโนมัติ
 */

/**
 * Builder Items - Hierarchical Structure
 * กำหนดโครงสร้าง parent-child ไว้แล้วเพื่อง่ายต่อการใช้งาน
 */

// Main builder items with hierarchical structure
// ... existing code ...

// ============================================
// 🧰 UTILITY FUNCTIONS
// ============================================

export async function getAllItemTypes() {
  const types = new Set();
  const hierarchicalItems = await getHierarchicalItems();

  function collectTypes(items) {
    items.forEach(item => {
      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        collectTypes(item.children);
      } else if (item.type && item.type !== 'folder') {
        types.add(item.type);
      }
    });
  }

  collectTypes(hierarchicalItems);
  console.log('All item types:', Array.from(types));
  return Array.from(types);
}

import storageManager from '@/plugins/storage';

async function fetchBuilderItemsFromApi(clientTokenKey) {
  const queryBody = {
    method: 'find',
    args: [{}],
    sort: { sort_order: 1, created_at: -1 },
    paging: { page: 1, limit: 1000 }
  };

  const response = await fetch("https://gateway.cloudrestfulapi.com/api/builder_item/query", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'client-token-key': clientTokenKey
    },
    body: JSON.stringify(queryBody)
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  const data = await response.json();
  return data.data || [];
}

function toHierarchicalFormat(flatArray) {
  const map = {};
  flatArray.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });
  const roots = [];
  flatArray.forEach(item => {
    if (item.parent && map[item.parent]) {
      map[item.parent].children.push(map[item.id]);
    } else if (!item.parent) {
      roots.push(map[item.id]);
    }
  });
  return roots;
}

export async function getHierarchicalItems() {
  try {
    const configs = storageManager.get('configs');
    const clientTokenKey = configs?.key;
    if (!clientTokenKey) throw new Error('ไม่พบ client-token-key ใน configs');
    const flatArray = await fetchBuilderItemsFromApi(clientTokenKey);
    return toHierarchicalFormat(flatArray);
  } catch (e) {
    console.error('โหลด builder items ไม่สำเร็จ', e);
    return [];
  }
}

export async function getItemsByCategory(category) {
  const folders = await getHierarchicalItems();
  const folder = folders.find(item => item.category === category && item.isFolder);
  return folder && Array.isArray(folder.children) ? folder.children : [];
}

function flatten(items) {
  return items.reduce((acc, item) => {
    acc.push(item);
    if (item.children && item.children.length) {
      acc = acc.concat(flatten(item.children));
    }
    return acc;
  }, []);
}

export async function getQuickAccessItems() {
  try {
    const allItems = await getHierarchicalItems();
    const flatItems = flatten(allItems);
    return flatItems.filter(item => item.pin === true);
  } catch (e) {
    console.error('โหลด quick access items ไม่สำเร็จ', e);
    return [];
  }
}