// ==========================================
// Extensions Module Loader
// ==========================================

// ==========================================
// Starter Modules
// ==========================================
import homeRoutes from '@/extensions/modules/starter/home/router'

// ==========================================
// Multiverse Modules
// ==========================================
import originRoutes from '@/extensions/modules/multiverse/origin/router'
import assetRoutes from '@/extensions/modules/multiverse/asset/router'
import collectionRoutes from '@/extensions/modules/multiverse/collection/router'
import resourceRoutes from '@/extensions/modules/multiverse/resource/router'

// ==========================================
// E-Learning Modules
// ==========================================
import enrollRoutes from '@/extensions/modules/elearning/enroll/router'
import schoolRoutes from '@/extensions/modules/elearning/school/router'
import studentRoutes from '@/extensions/modules/elearning/student/router'
import lessonRoutes from '@/extensions/modules/elearning/lesson/router'
import categoryRoutes from '@/extensions/modules/elearning/category/router'
import seminarRoutes from '@/extensions/modules/elearning/seminar/router'

// ==========================================
// E-Commerce Modules
// ==========================================
import shopRoutes from '@/extensions/modules/ecommerce/shop/router'
import orderRoutes from '@/extensions/modules/ecommerce/order/router'
import billingRoutes from '@/extensions/modules/ecommerce/billing/router'
import marketplaceRoutes from '@/extensions/modules/ecommerce/marketplace/router'
import branchRoutes from '@/extensions/modules/ecommerce/branch/router'
import websiteRoutes from '@/extensions/modules/ecommerce/website/router'
import walletRoutes from '@/extensions/modules/ecommerce/wallet/router'
import redeemRoutes from '@/extensions/modules/ecommerce/redeem/router'

// ==========================================
// Blog Modules
// ==========================================
import cmsRoutes from '@/extensions/modules/blog/cms/router'

// ==========================================
// System Modules
// ==========================================
import appointmentRoutes from '@/extensions/modules/system/appointment/router'
import supportRoutes from '@/extensions/modules/system/livesupport/router'
import noteRoutes from '@/extensions/modules/system/note/router'
import configRoutes from '@/extensions/modules/system/config/router'
import setupRoutes from '@/extensions/modules/system/setup/router'
import installRoutes from '@/extensions/modules/system/install/router'
import memberRoutes from '@/extensions/modules/system/member/router' // Backend Member
import userRoutes from '@/extensions/modules/system/user/router'
import debugRoutes from '@/extensions/modules/system/debug/router'
import ticketRoutes from '@/extensions/modules/system/ticket/router'

// ==========================================
// Untitle Modules
// ==========================================
import messageRoutes from '@/extensions/modules/untitle/message/router'
import testRoutes from '@/extensions/modules/untitle/test/router'
import aiRoutes from '@/extensions/modules/untitle/ai/router'
// ==========================================
// Standard Application Modules
// ==========================================
import institutionRoutes from '@/extensions/modules/standard/institution/router'
import applicationRoutes from '@/extensions/modules/standard/application/router'
import formRoutes from '@/extensions/modules/standard/form/router'
import applyRoutes from '@/extensions/modules/standard/apply/router'

// ==========================================
// Extra Modules - BQCLP
// ==========================================
import bqclp_access from '@/extensions/modules/extra/bqclp/access/router'
import bqclp_create from '@/extensions/modules/extra/bqclp/create/router'
import bqclp_request from '@/extensions/modules/extra/bqclp/request/router'
import bqclp_send from '@/extensions/modules/extra/bqclp/send/router'
import bqclp_status from '@/extensions/modules/extra/bqclp/status/router'
import bqclp_website from '@/extensions/modules/extra/bqclp/website/router'

// ==========================================
// Extra Modules - Vote
// ==========================================
import eventRoutes from '@/extensions/modules/extra/vote/router'

// ==========================================
// ERP Modules
// ==========================================
import purchaseRoutes from '@/extensions/modules/erp/modules/purchase/router'
import inventoryRoutes from '@/extensions/modules/erp/modules/inventory/router'
import salesRoutes from '@/extensions/modules/erp/modules/sales/router'
import productionRoutes from '@/extensions/modules/erp/modules/production/router'
import deliveryRoutes from '@/extensions/modules/erp/modules/delivery/router'
import financeRoutes from '@/extensions/modules/erp/modules/finance/router'
import dummyRoutes from '@/extensions/modules/erp/modules/dummy/router'
import hrRoutes from '@/extensions/modules/erp/modules/hr/router'
import accountingRoutes from '@/extensions/modules/erp/modules/accounting/router'

import driveRoutes from '@/extensions/modules/standard/drive/router'
// ==========================================
// Plugin Routes Collection
// ==========================================
const pluginRoutes = [
  // Starter
  ...homeRoutes,
  
  // Standard Application
  ...applyRoutes,
  ...institutionRoutes,
  ...applicationRoutes,
  ...formRoutes,
  
  // Multiverse
  ...originRoutes,
  ...resourceRoutes,
  ...collectionRoutes,
  ...assetRoutes,
  
  // E-Learning
  ...enrollRoutes,
  ...lessonRoutes,
  ...schoolRoutes,
  ...categoryRoutes,
  ...studentRoutes,
  ...seminarRoutes,
  
  // E-Commerce
  ...orderRoutes,
  ...shopRoutes,
  ...walletRoutes,
  ...redeemRoutes,
  ...billingRoutes,
  ...branchRoutes,
  ...marketplaceRoutes,
  ...websiteRoutes,
  

  
  // Blog
  ...cmsRoutes,
  
  // Untitle
  ...messageRoutes,
  ...testRoutes,
  ... aiRoutes,
  
  // Extra - BQCLP
  ...bqclp_create,
  ...bqclp_request,
  ...bqclp_send,
  ...bqclp_status,
  ...bqclp_website,
  ...bqclp_access,
  
  // Extra - Vote
  ...eventRoutes,
  
  ...driveRoutes,
  
  // ERP
  ...purchaseRoutes,
  ...inventoryRoutes,
  ...salesRoutes,
  ...productionRoutes,
  ...deliveryRoutes,
  ...financeRoutes,
  ...dummyRoutes,
  ...hrRoutes,
  ...accountingRoutes,

  // System
  ...userRoutes,
  ...debugRoutes,
  ...memberRoutes,
  ...appointmentRoutes,
  ...noteRoutes,
  ...configRoutes,
  ...setupRoutes,
  ...installRoutes,
  ...supportRoutes,
  ...ticketRoutes,
]

export default pluginRoutes