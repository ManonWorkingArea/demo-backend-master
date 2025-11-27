// Collection Utilities - helper functions
export const CollectionUtils = {
  
  // Format ข้อมูลสำหรับแสดงผล
  formatCollectionData(collection) {
    return {
      ...collection,
      displayName: collection.siteName || 'ไม่มีชื่อ',
      displayHostname: collection.hostname || 'ไม่มีโดเมน',
      imageUrl: collection.loginBg || 'https://picsum.photos/seed/picsum/200/300',
      assetsCountText: `${collection.assetsCount || 0} Assets`
    };
  },

  // ตรวจสอบสถานะ Collection
  getCollectionStatus(collection) {
    if (!collection.hostname) return 'incomplete';
    if (!collection.siteName) return 'incomplete';
    if ((collection.assetsCount || 0) === 0) return 'empty';
    return 'active';
  },

  // สร้าง CSS class สำหรับสถานะ
  getStatusClass(status) {
    const statusClasses = {
      'active': 'border-green-200 bg-green-50',
      'empty': 'border-yellow-200 bg-yellow-50',
      'incomplete': 'border-red-200 bg-red-50'
    };
    return statusClasses[status] || 'border-gray-200 bg-white';
  },

  // สร้าง tooltip text
  getStatusTooltip(status) {
    const tooltips = {
      'active': 'Collection พร้อมใช้งาน',
      'empty': 'Collection ไม่มี Assets',
      'incomplete': 'Collection ข้อมูลไม่ครบถ้วน'
    };
    return tooltips[status] || '';
  },

  // เรียงลำดับ Collections
  sortCollections(collections, sortBy = 'name') {
    return [...collections].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.siteName || '').localeCompare(b.siteName || '');
        case 'assets':
          return (b.assetsCount || 0) - (a.assetsCount || 0);
        case 'created':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });
  },

  // กรองข้อมูล Collections
  filterCollections(collections, searchTerm = '', status = 'all') {
    return collections.filter(collection => {
      const matchesSearch = !searchTerm || 
        (collection.siteName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (collection.hostname || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = status === 'all' || 
        this.getCollectionStatus(collection) === status;
      
      return matchesSearch && matchesStatus;
    });
  },

  // สร้างสถิติ Collections
  getCollectionStats(collections) {
    const stats = {
      total: collections.length,
      active: 0,
      empty: 0,
      incomplete: 0,
      totalAssets: 0
    };

    collections.forEach(collection => {
      const status = this.getCollectionStatus(collection);
      stats[status]++;
      stats.totalAssets += collection.assetsCount || 0;
    });

    return stats;
  },

  // สร้าง breadcrumb navigation
  generateBreadcrumb(currentPage = 'list', collectionData = null) {
    const breadcrumbs = [
      { name: 'Origin', link: '/origin', icon: 'warehouse' },
      { name: 'Collections', link: '/origin/collection', icon: 'boxes' }
    ];

    if (currentPage === 'detail' && collectionData) {
      breadcrumbs.push({
        name: collectionData.siteName || 'Collection Detail',
        link: `/origin/collection/detail/${collectionData._id}`,
        icon: 'info-circle'
      });
    } else if (currentPage === 'add') {
      breadcrumbs.push({
        name: 'เพิ่ม Collection',
        link: '/origin/collection/add',
        icon: 'plus'
      });
    } else if (currentPage === 'edit' && collectionData) {
      breadcrumbs.push({
        name: `แก้ไข ${collectionData.siteName || 'Collection'}`,
        link: `/origin/collection/edit/${collectionData._id}`,
        icon: 'edit'
      });
    }

    return breadcrumbs;
  }
};

// Export สำหรับ ES6 modules
export default CollectionUtils;
