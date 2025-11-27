/**
 * Corporate Configuration API
 * จัดการการตั้งค่าทั้งหมดของบริษัท
 * Collection: erp_corporate_config
 */

const express = require('express');
const router = express.Router();

/**
 * GET /api/erp_corporate_config
 * ดึงการตั้งค่าตาม config_key หรือ module
 */
router.get('/', async (req, res) => {
  try {
    const { config_key, module, category } = req.query;
    
    let query = {};
    
    if (config_key) {
      query.config_key = config_key;
    } else if (module && category) {
      query.module = module;
      query.category = category;
    } else if (module) {
      query.module = module;
    }
    
    const configs = await req.db.collection('erp_corporate_config').find(query).toArray();
    
    res.json({
      success: true,
      data: configs,
      total: configs.length
    });
    
  } catch (error) {
    console.error('Error fetching corporate config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configuration',
      error: error.message
    });
  }
});

/**
 * GET /api/erp_corporate_config/:id
 * ดึงการตั้งค่าตาม ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const config = await req.db.collection('erp_corporate_config').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }
    
    res.json({
      success: true,
      data: config
    });
    
  } catch (error) {
    console.error('Error fetching corporate config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configuration',
      error: error.message
    });
  }
});

/**
 * POST /api/corporate-config
 * สร้างการตั้งค่าใหม่
 */
router.post('/', async (req, res) => {
  try {
    const { config_key, module, category, config_data, name, description, version, is_public, is_system } = req.body;
    
    // Validation
    if (!config_key || !module || !category || !config_data) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: config_key, module, category, config_data'
      });
    }
    
    // Validate config_key format
    if (!/^[a-z_]+\.[a-z_]+$/.test(config_key)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid config_key format. Use: module.category (e.g., accounting.account_mapping)'
      });
    }
    
    // Check if already exists
    const existing = await req.db.collection('erp_corporate_config').findOne({ config_key });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Configuration with this key already exists'
      });
    }
    
    const configDoc = {
      config_key,
      module,
      category,
      config_data,
      name: name || null,
      description: description || null,
      version: version || '1.0.0',
      is_public: is_public || false,
      is_system: is_system || false,
      created_by: req.user?.username || 'system',
      updated_by: req.user?.username || 'system',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await req.db.collection('erp_corporate_config').insertOne(configDoc);
    
    res.json({
      success: true,
      message: 'Configuration created successfully',
      data: { _id: result.insertedId, ...configDoc }
    });
    
  } catch (error) {
    console.error('Error creating corporate config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create configuration',
      error: error.message
    });
  }
});

/**
 * PUT /api/erp_corporate_config/:id
 * อัพเดทการตั้งค่า
 */
router.put('/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const { module, category, config_data, name, description, version, is_public, is_system } = req.body;
    
    const updateDoc = {
      $set: {
        updated_by: req.user?.username || 'system',
        updated_at: new Date()
      }
    };
    
    if (module !== undefined) updateDoc.$set.module = module;
    if (category !== undefined) updateDoc.$set.category = category;
    if (config_data !== undefined) updateDoc.$set.config_data = config_data;
    if (name !== undefined) updateDoc.$set.name = name;
    if (description !== undefined) updateDoc.$set.description = description;
    if (version !== undefined) updateDoc.$set.version = version;
    if (is_public !== undefined) updateDoc.$set.is_public = is_public;
    if (is_system !== undefined) updateDoc.$set.is_system = is_system;
    
    const result = await req.db.collection('erp_corporate_config').updateOne(
      { _id: new ObjectId(req.params.id) },
      updateDoc
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
    
  } catch (error) {
    console.error('Error updating corporate config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update configuration',
      error: error.message
    });
  }
});

/**
 * DELETE /api/erp_corporate_config/:id
 * ลบการตั้งค่า
 */
router.delete('/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    
    // Check if system config
    const config = await req.db.collection('erp_corporate_config').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }
    
    if (config.is_system) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete system configuration'
      });
    }
    
    const result = await req.db.collection('erp_corporate_config').deleteOne({
      _id: new ObjectId(req.params.id)
    });
    
    res.json({
      success: true,
      message: 'Configuration deleted successfully',
      data: {
        deleted: result.deletedCount
      }
    });
    
  } catch (error) {
    console.error('Error deleting corporate config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete configuration',
      error: error.message
    });
  }
});

module.exports = router;
