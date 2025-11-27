// API handlers for revision management - using existing API structure
const express = require('express');
const router = express.Router();

// CREATE: สร้าง revision ใหม่
router.post('/create', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || !data.post_id) {
      return res.status(400).json({
        status: 400,
        message: 'ข้อมูลไม่ครบถ้วน: ต้องมี post_id'
      });
    }

    // สร้างข้อมูล revision สำหรับเก็บใน post_revision collection
    const revisionData = {
      post_id: data.post_id,
      builder_data: data.builder_data || [],
      css_data: data.css_data || '',
      title: data.title || '',
      description: data.description || `Auto-save at ${new Date().toLocaleString()}`,
      created_at: new Date().toISOString(),
      user_id: data.user_id || 'unknown',
      user_name: data.user_name || 'ไม่ระบุ',
      is_current: false,
      version: Date.now() // เพิ่ม version number
    };

    // ใช้ API request แบบเดิมเพื่อเก็บข้อมูลใน post_revision collection
    const saveResponse = await req.app.locals.apiRequest({
      method: 'POST',
      endpoint: 'post_revision',
      data: {
        data: revisionData,
        options: {}
      }
    });

    if (saveResponse && saveResponse.status === 200) {
      console.log(`Created revision for post ${data.post_id}`);
      
      res.status(200).json({
        status: 200,
        message: 'สร้าง revision สำเร็จ',
        data: {
          revision: {
            ...revisionData,
            _id: saveResponse.data._id
          }
        }
      });
    } else {
      throw new Error('Failed to save revision to database');
    }

  } catch (error) {
    console.error('Error creating revision:', error);
    res.status(500).json({
      status: 500,
      message: 'เกิดข้อผิดพลาดในการสร้าง revision'
    });
  }
});

// READ: ดึงรายการ revisions ของ post
router.get('/list/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    
    if (!postId) {
      return res.status(400).json({
        status: 400,
        message: 'ต้องระบุ post ID'
      });
    }

    // ใช้ API request แบบเดิมเพื่อค้นหา revisions จาก post_revision collection
    const searchResponse = await req.app.locals.apiRequest({
      method: 'GET',
      endpoint: `post_revision/search`,
      params: {
        filter: JSON.stringify({ post_id: postId }),
        sort: JSON.stringify({ created_at: -1 }), // เรียงตามวันที่ล่าสุด
        limit: 50 // จำกัดจำนวน revisions
      }
    });

    if (searchResponse && searchResponse.status === 200) {
      const revisions = searchResponse.data || [];
      
      res.status(200).json({
        status: 200,
        data: {
          revisions: revisions,
          total: revisions.length
        }
      });
    } else {
      res.status(200).json({
        status: 200,
        data: {
          revisions: [],
          total: 0
        }
      });
    }

  } catch (error) {
    console.error('Error loading revisions:', error);
    res.status(500).json({
      status: 500,
      message: 'เกิดข้อผิดพลาดในการโหลด revisions'
    });
  }
});

// READ: ดึงข้อมูล revision เฉพาะ
router.get('/:revisionId', async (req, res) => {
  try {
    const { revisionId } = req.params;
    
    if (!revisionId) {
      return res.status(400).json({
        status: 400,
        message: 'ต้องระบุ revision ID'
      });
    }

    // ใช้ API request แบบเดิมเพื่อค้นหา revision จาก post_revision collection
    const getResponse = await req.app.locals.apiRequest({
      method: 'GET',
      endpoint: `post_revision/${revisionId}`
    });

    if (getResponse && getResponse.status === 200 && getResponse.data) {
      res.status(200).json({
        status: 200,
        data: {
          revision: getResponse.data
        }
      });
    } else {
      res.status(404).json({
        status: 404,
        message: 'ไม่พบ revision ที่ระบุ'
      });
    }

  } catch (error) {
    console.error('Error loading revision:', error);
    res.status(500).json({
      status: 500,
      message: 'เกิดข้อผิดพลาดในการโหลด revision'
    });
  }
});

// DELETE: ลบ revision
router.delete('/:revisionId', async (req, res) => {
  try {
    const { revisionId } = req.params;
    
    if (!revisionId) {
      return res.status(400).json({
        status: 400,
        message: 'ต้องระบุ revision ID'
      });
    }

    // ใช้ API request แบบเดิมเพื่อลบ revision จาก post_revision collection
    const deleteResponse = await req.app.locals.apiRequest({
      method: 'DELETE',
      endpoint: `post_revision/${revisionId}`
    });

    if (deleteResponse && deleteResponse.status === 200) {
      res.status(200).json({
        status: 200,
        message: 'ลบ revision สำเร็จ'
      });
    } else {
      res.status(404).json({
        status: 404,
        message: 'ไม่พบ revision ที่ต้องการลบ'
      });
    }

  } catch (error) {
    console.error('Error deleting revision:', error);
    res.status(500).json({
      status: 500,
      message: 'เกิดข้อผิดพลาดในการลบ revision'
    });
  }
});

// COMPARE: เปรียบเทียบ revisions
router.post('/compare', async (req, res) => {
  try {
    const { revision1_id, revision2_id } = req.body;
    
    if (!revision1_id || !revision2_id) {
      return res.status(400).json({
        status: 400,
        message: 'ต้องระบุ revision ID ทั้งสอง'
      });
    }

    // ดึงข้อมูล revision ทั้งสอง
    const [response1, response2] = await Promise.all([
      req.app.locals.apiRequest({
        method: 'GET',
        endpoint: `post_revision/${revision1_id}`
      }),
      req.app.locals.apiRequest({
        method: 'GET',
        endpoint: `post_revision/${revision2_id}`
      })
    ]);

    if (!response1?.data || !response2?.data) {
      return res.status(404).json({
        status: 404,
        message: 'ไม่พบ revision หนึ่งหรือทั้งสอง'
      });
    }

    const revision1 = response1.data;
    const revision2 = response2.data;

    // สร้างการเปรียบเทียบ
    const comparison = {
      revision1: {
        id: revision1._id,
        description: revision1.description,
        created_at: revision1.created_at,
        builder_rows: revision1.builder_data?.length || 0,
        css_length: revision1.css_data?.length || 0
      },
      revision2: {
        id: revision2._id,
        description: revision2.description,
        created_at: revision2.created_at,
        builder_rows: revision2.builder_data?.length || 0,
        css_length: revision2.css_data?.length || 0
      },
      differences: {
        builder_rows_diff: (revision2.builder_data?.length || 0) - (revision1.builder_data?.length || 0),
        css_length_diff: (revision2.css_data?.length || 0) - (revision1.css_data?.length || 0),
        time_diff: new Date(revision2.created_at) - new Date(revision1.created_at)
      }
    };

    res.status(200).json({
      status: 200,
      data: {
        comparison: comparison
      }
    });

  } catch (error) {
    console.error('Error comparing revisions:', error);
    res.status(500).json({
      status: 500,
      message: 'เกิดข้อผิดพลาดในการเปรียบเทียบ revisions'
    });
  }
});

// GET: ดึงรายการ revisions แบบ paginated
router.get('/list/:postId/paginated', async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    if (!postId) {
      return res.status(400).json({
        status: 400,
        message: 'ต้องระบุ post ID'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ใช้ API request แบบเดิมเพื่อค้นหา revisions แบบ paginated
    const searchResponse = await req.app.locals.apiRequest({
      method: 'GET',
      endpoint: `post_revision/search`,
      params: {
        filter: JSON.stringify({ post_id: postId }),
        sort: JSON.stringify({ created_at: -1 }),
        skip: skip,
        limit: parseInt(limit)
      }
    });

    // นับจำนวนทั้งหมด
    const countResponse = await req.app.locals.apiRequest({
      method: 'GET',
      endpoint: `post_revision/count`,
      params: {
        filter: JSON.stringify({ post_id: postId })
      }
    });

    if (searchResponse && searchResponse.status === 200) {
      const revisions = searchResponse.data || [];
      const total = countResponse?.data?.count || 0;
      
      res.status(200).json({
        status: 200,
        data: {
          revisions: revisions,
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: total,
            total_pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } else {
      res.status(200).json({
        status: 200,
        data: {
          revisions: [],
          pagination: {
            current_page: 1,
            per_page: parseInt(limit),
            total: 0,
            total_pages: 0
          }
        }
      });
    }

  } catch (error) {
    console.error('Error loading paginated revisions:', error);
    res.status(500).json({
      status: 500,
      message: 'เกิดข้อผิดพลาดในการโหลด revisions'
    });
  }
});

module.exports = router; 