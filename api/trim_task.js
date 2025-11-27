/**
 * API endpoints for video trim tasks
 * Separate from conversion_task to handle trim-specific operations
 */

const express = require('express');
const router = express.Router();

// In-memory storage for demo (replace with actual database)
let trimTasks = [];
let taskIdCounter = 1;

/**
 * GET /api/trim_task/query - Query trim tasks
 */
router.post('/query', (req, res) => {
  try {
    const { filters = {}, limit = 50, offset = 0 } = req.body;
    
    let filtered = [...trimTasks];
    
    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    
    if (filters.type) {
      filtered = filtered.filter(task => task.type === filters.type);
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.fileName?.toLowerCase().includes(search) ||
        task.taskId?.toLowerCase().includes(search)
      );
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);
    
    res.json({
      success: true,
      data: paginated,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error querying trim tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to query trim tasks'
    });
  }
});

/**
 * POST /api/trim_task/ - Create new trim task
 */
router.post('/', (req, res) => {
  try {
    const taskData = req.body;
    
    // Generate task ID
    const taskId = `trim_${Date.now()}_${taskIdCounter++}`;
    
    const newTask = {
      _id: taskId,
      taskId: taskId,
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    trimTasks.push(newTask);
    
    console.log('✅ Created trim task:', taskId);
    
    res.json({
      success: true,
      data: newTask
    });
  } catch (error) {
    console.error('Error creating trim task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create trim task'
    });
  }
});

/**
 * PUT /api/trim_task/:id - Update trim task
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const taskIndex = trimTasks.findIndex(task => task._id === id || task.taskId === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Trim task not found'
      });
    }
    
    // Update task
    trimTasks[taskIndex] = {
      ...trimTasks[taskIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ Updated trim task:', id);
    
    res.json({
      success: true,
      data: trimTasks[taskIndex]
    });
  } catch (error) {
    console.error('Error updating trim task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update trim task'
    });
  }
});

/**
 * DELETE /api/trim_task/:id - Delete trim task
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const taskIndex = trimTasks.findIndex(task => task._id === id || task.taskId === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Trim task not found'
      });
    }
    
    // Remove task
    const deletedTask = trimTasks.splice(taskIndex, 1)[0];
    
    console.log('✅ Deleted trim task:', id);
    
    res.json({
      success: true,
      data: deletedTask
    });
  } catch (error) {
    console.error('Error deleting trim task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete trim task'
    });
  }
});

/**
 * GET /api/trim_task/:id - Get specific trim task
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const task = trimTasks.find(task => task._id === id || task.taskId === id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Trim task not found'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error getting trim task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trim task'
    });
  }
});

/**
 * GET /api/trim_task/ - List all trim tasks
 */
router.get('/', (req, res) => {
  try {
    const { limit = 50, offset = 0, status, type } = req.query;
    
    let filtered = [...trimTasks];
    
    // Apply filters
    if (status) {
      filtered = filtered.filter(task => task.status === status);
    }
    
    if (type) {
      filtered = filtered.filter(task => task.type === type);
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const total = filtered.length;
    const paginated = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      success: true,
      data: paginated,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error listing trim tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list trim tasks'
    });
  }
});

module.exports = router;
