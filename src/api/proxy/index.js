/**
 * API Proxy Routes
 * จัดการ proxy requests เพื่อแก้ปัญหา CORS
 */

const express = require('express');
const router = express.Router();

// Import proxy routers
const recasensProxy = require('./recasens');

// Mount proxy routes
router.use('/recasens', recasensProxy);

module.exports = router;
