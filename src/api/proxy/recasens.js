/**
 * Recasens API Proxy
 * แก้ปัญหา CORS โดยทำ proxy request ผ่าน backend
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * POST /api/proxy/recasens/search-product-image
 * ค้นหารูปภาพสินค้าจาก Recasens API
 */
router.post('/search-product-image', async (req, res) => {
  try {
    const { ref } = req.body;
    
    if (!ref) {
      return res.status(400).json({
        success: false,
        error: 'Missing ref parameter'
      });
    }
    
    console.log('🔍 [Recasens Proxy] Searching for:', ref);
    
    // Build form data
    const params = new URLSearchParams({
      action: 'tejidos_s_ajax',
      lang: 'en',
      application: '',
      property: '',
      advantage: '',
      certificate: '',
      ref: ref,
      uso: '',
      tipo: '',
      gama: '',
      color: '',
      estampado: '',
      paged: '1'
    });
    
    // Make POST request to Recasens API using axios
    const apiUrl = 'https://recasens.com/wp-admin/admin-ajax.php';
    const response = await axios.post(apiUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    const htmlText = response.data;
    console.log('📄 [Recasens Proxy] Received HTML length:', htmlText.length);
    
    // Parse HTML to extract image URL using regex
    const imageUrlMatch = htmlText.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
    
    let imageUrl = null;
    let source = null;
    
    if (imageUrlMatch && imageUrlMatch[1]) {
      let imgSrc = imageUrlMatch[1];
      
      // Handle relative URLs
      if (!imgSrc.startsWith('http')) {
        imageUrl = `https://recasens.com${imgSrc.startsWith('/') ? '' : '/'}${imgSrc}`;
      } else {
        imageUrl = imgSrc;
      }
      
      source = 'Recasens API';
      console.log('✅ [Recasens Proxy] Found image:', imageUrl);
    } else {
      console.log('ℹ️ [Recasens Proxy] No image found for:', ref);
    }
    
    // Return structured response
    res.json({
      success: true,
      data: {
        ref: ref,
        imageUrl: imageUrl,
        source: source,
        found: !!imageUrl
      }
    });
    
  } catch (error) {
    console.error('❌ [Recasens Proxy] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
