/**
 * Accounting Service - Centralized Service สำหรับบันทึกรายการบัญชีทุกประเภท
 * รับประกันว่าทุก Transaction จะถูกบันทึกเป็น Journal Entry
 * 
 * Design Pattern: Service Layer + Repository Pattern
 * - แต่ละฟังก์ชันทำงานอิสระ สามารถเรียกใช้ได้จากทุกที่
 * - มี Validation และ Error Handling ครบถ้วน
 * - มีการ Log เพื่อ Debug และ Audit Trail
 */

import WorkflowEngine from '@/services/WorkflowEngine'
import { MODULE_UTILS } from '@/constants/module-utils'
import accountingSettings from '@/services/AccountingSettings'

class AccountingService {
  constructor() {
    this.engine = WorkflowEngine
    this.moduleName = 'accounting'
    this.collectionPrefix = 'accounting_'
    this.settings = accountingSettings
    this.initialized = false
  }

  /**
   * Initialize AccountingService - โหลด Settings ก่อนใช้งาน
   * ควรเรียกครั้งเดียวตอน App Start
   */
  async initialize() {
    if (!this.initialized) {
      await this.settings.loadSettings()
      this.initialized = true
      console.log('✅ AccountingService Initialized with Settings')
    }
    return this.initialized
  }

  /**
   * ดึง Account Code + Name จาก Settings
   */
  getAccount(key) {
    if (!this.initialized) {
      console.warn('⚠️ AccountingService not initialized. Using default settings.')
    }
    return this.settings.getAccount(key)
  }

  /**
   * ดึง Payment Account (Cash/Bank) ตาม Payment Method
   */
  getPaymentAccount(paymentMethod) {
    return paymentMethod === 'cash' 
      ? this.getAccount('cash')
      : this.getAccount('bank')
  }

  /**
   * ดึง Fixed Asset Account ตามประเภท
   */
  getFixedAssetAccount(assetType) {
    const typeMap = {
      'land': 'land',
      'building': 'building',
      'machinery': 'machinery',
      'equipment': 'equipment',
      'vehicle': 'vehicle',
      'furniture': 'furniture',
      'computer': 'computer'
    }
    const key = typeMap[assetType] || 'fixed_assets'
    return this.getAccount(key)
  }

  /**
   * ดึง Expense Account ตามประเภทค่าใช้จ่าย
   */
  getExpenseAccount(expenseType, category = 'selling') {
    const sellingMap = {
      'advertising': 'advertising',
      'commission': 'commission',
      'travel': 'travel',
      'marketing': 'marketing',
      'promotion': 'promotion'
    }

    const adminMap = {
      'rent': 'rent',
      'utilities': 'utilities',
      'office_supplies': 'office_supplies',
      'insurance': 'insurance',
      'professional_fees': 'professional_fees',
      'maintenance': 'maintenance',
      'communication': 'communication'
    }

    if (category === 'selling') {
      const key = sellingMap[expenseType] || 'selling_expense'
      return this.getAccount(key)
    } else if (category === 'administrative') {
      const key = adminMap[expenseType] || 'admin_expense'
      return this.getAccount(key)
    }

    return this.getAccount('miscellaneous_expense')
  }

  /**
   * ========================================
   * CORE FUNCTIONS - บันทึกรายการบัญชี
   * ========================================
   */

  /**
   * บันทึก Journal Entry ลง Database
   * @param {Object} journalEntry - รายการบัญชี { date, description, items: [{account, debit, credit}] }
   * @returns {Promise<Object>} - Journal Entry ที่บันทึกแล้ว
   */
  async saveJournalEntry(journalEntry) {
    try {
      // เตรียมระบบก่อนใช้งาน
      await this.initialize()

      // Validation
      if (!journalEntry || !journalEntry.items || journalEntry.items.length === 0) {
        throw new Error('Journal Entry must have at least one item')
      }

      // 🔒 ตรวจสอบว่างวดบัญชีเปิดอยู่หรือไม่
      const entryDate = journalEntry.date || new Date().toISOString().split('T')[0]
      const currentPeriod = await this.settings.getCurrentPeriodFromDate(entryDate)
      
      if (currentPeriod) {
        if (currentPeriod.status === 'closed') {
          throw new Error(
            `❌ ไม่สามารถบันทึกรายการได้\n` +
            `งวดบัญชี "${currentPeriod.name}" (${currentPeriod.start_date} - ${currentPeriod.end_date}) ถูกปิดแล้ว\n` +
            `กรุณาเปิดงวดก่อนหรือเลือกวันที่ในงวดที่เปิดอยู่`
          )
        }
        
        console.log(`✅ บันทึกรายการในงวด: ${currentPeriod.name} (Status: ${currentPeriod.status})`)
      } else {
        console.warn(`⚠️ ไม่พบข้อมูลงวดบัญชีสำหรับวันที่ ${entryDate}`)
        console.warn('⚠️ จะดำเนินการบันทึกต่อ แต่แนะนำให้ตั้งค่า Fiscal Periods ก่อน')
      }

      // คำนวณยอดรวม Debit และ Credit
      let totalDebit = 0
      let totalCredit = 0
      
      journalEntry.items.forEach(item => {
        totalDebit += parseFloat(item.debit || 0)
        totalCredit += parseFloat(item.credit || 0)
      })

      // ตรวจสอบว่า Debit = Credit (Double-Entry Rule)
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error(`Journal Entry not balanced: Debit ${totalDebit} != Credit ${totalCredit}`)
      }

      // เพิ่ม metadata
      const entry = {
        ...journalEntry,
        id: journalEntry.id || `JE${Date.now()}`,
        entry_number: journalEntry.entry_number || this.generateEntryNumber(),
        date: journalEntry.date || new Date().toISOString().split('T')[0],
        status: journalEntry.status || 'posted',
        created_at: new Date().toISOString(),
        created_by: journalEntry.created_by || 'system',
        total_debit: totalDebit,
        total_credit: totalCredit
      }

      // บันทึกลง Database
      await this.engine.saveData(this.moduleName, 'journal_entries', entry.id, entry)

      // Log สำหรับ Audit Trail
      console.log('✅ Journal Entry Saved:', {
        id: entry.id,
        number: entry.entry_number,
        description: entry.description,
        amount: totalDebit
      })

      return entry

    } catch (error) {
      console.error('❌ Failed to save Journal Entry:', error.message)
      throw error
    }
  }

  /**
   * สร้างเลขที่รายการบัญชีอัตโนมัติ
   * Format: JE-YYYYMM-XXXX
   */
  generateEntryNumber() {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    return `JE-${year}${month}-${random}`
  }

  /**
   * ========================================
   * SALES MODULE - ขาย
   * ========================================
   */

  /**
   * 1. บันทึกบัญชีเมื่อสร้างใบสั่งขาย (Sales Order)
   * Dr: ลูกหนี้การค้า (Accounts Receivable)
   * Cr: รายได้จากการขาย (Sales Revenue)
   * Cr: ภาษีขาย VAT (Output VAT)
   */
  async postSalesOrder(salesOrder) {
    try {
      await this.initialize() // Auto-initialize ถ้ายังไม่ได้ทำ

      const subtotal = parseFloat(salesOrder.subtotal || 0)
      const vatAmount = parseFloat(salesOrder.vat_amount || 0)
      const total = parseFloat(salesOrder.total || 0)

      // ดึง Account จาก Settings
      const ar = this.getAccount('accounts_receivable')
      const revenue = this.getAccount('sales_revenue')
      const outputVat = this.getAccount('output_vat')

      const journalEntry = {
        reference_type: 'sales_order',
        reference_id: salesOrder.id,
        reference_number: salesOrder.order_number,
        date: salesOrder.order_date,
        description: `ขายสินค้าให้ลูกค้า: ${salesOrder.customer_name} (${salesOrder.order_number})`,
        items: [
          {
            account_code: ar.code,
            account_name: ar.name,
            debit: total,
            credit: 0,
            description: `ลูกหนี้: ${salesOrder.customer_name}`
          },
          {
            account_code: revenue.code,
            account_name: revenue.name,
            debit: 0,
            credit: subtotal,
            description: 'รายได้จากการขายสินค้า'
          },
          {
            account_code: outputVat.code,
            account_name: outputVat.name,
            debit: 0,
            credit: vatAmount,
            description: `VAT 7% (${MODULE_UTILS.formatCurrency(vatAmount)})`
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Sales Order:', error.message)
      throw error
    }
  }

  /**
   * 2. บันทึกบัญชีเมื่อรับชำระเงินจากลูกค้า (Receipt)
   * Dr: เงินสด/ธนาคาร (Cash/Bank)
   * Cr: ลูกหนี้การค้า (Accounts Receivable)
   */
  async postReceipt(receipt) {
    try {
      await this.initialize()

      const amount = parseFloat(receipt.amount || 0)
      
      // ดึง Account จาก Settings ตาม Payment Method
      const paymentAccount = receipt.payment_method === 'cash' 
        ? this.getAccount('cash') 
        : this.getAccount('bank')
      const ar = this.getAccount('accounts_receivable')

      const journalEntry = {
        reference_type: 'receipt',
        reference_id: receipt.id,
        reference_number: receipt.receipt_number,
        date: receipt.receipt_date,
        description: `รับชำระเงินจาก: ${receipt.customer_name} (${receipt.receipt_number})`,
        items: [
          {
            account_code: paymentAccount.code,
            account_name: paymentAccount.name,
            debit: amount,
            credit: 0,
            description: `รับชำระด้วย${receipt.payment_method === 'cash' ? 'เงินสด' : 'เงินโอน'}`
          },
          {
            account_code: ar.code,
            account_name: ar.name,
            debit: 0,
            credit: amount,
            description: `ลูกหนี้: ${receipt.customer_name}`
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Receipt:', error.message)
      throw error
    }
  }

  /**
   * ========================================
   * PURCHASE MODULE - ซื้อ
   * ========================================
   */

  /**
   * 3. บันทึกบัญชีเมื่อสร้างใบสั่งซื้อ (Purchase Order)
   * Dr: สินค้าคงเหลือ (Inventory)
   * Dr: ภาษีซื้อ VAT (Input VAT)
   * Cr: เจ้าหนี้การค้า (Accounts Payable)
   */
  async postPurchaseOrder(purchaseOrder) {
    try {
      await this.initialize()

      const subtotal = parseFloat(purchaseOrder.subtotal || 0)
      const vatAmount = parseFloat(purchaseOrder.vat_amount || 0)
      const total = parseFloat(purchaseOrder.total || 0)

      const inventory = this.getAccount('inventory')
      const inputVat = this.getAccount('input_vat')
      const ap = this.getAccount('accounts_payable')

      const journalEntry = {
        reference_type: 'purchase_order',
        reference_id: purchaseOrder.id,
        reference_number: purchaseOrder.po_number,
        date: purchaseOrder.order_date,
        description: `ซื้อสินค้าจากซัพพลายเออร์: ${purchaseOrder.supplier_name} (${purchaseOrder.po_number})`,
        items: [
          {
            account_code: inventory.code,
            account_name: inventory.name,
            debit: subtotal,
            credit: 0,
            description: 'สินค้าคงเหลือเพิ่มขึ้น'
          },
          {
            account_code: inputVat.code,
            account_name: inputVat.name,
            debit: vatAmount,
            credit: 0,
            description: `VAT 7% (${MODULE_UTILS.formatCurrency(vatAmount)})`
          },
          {
            account_code: ap.code,
            account_name: ap.name,
            debit: 0,
            credit: total,
            description: `เจ้าหนี้: ${purchaseOrder.supplier_name}`
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Purchase Order:', error.message)
      throw error
    }
  }

  /**
   * 4. บันทึกบัญชีเมื่อจ่ายชำระเงินให้ซัพพลายเออร์ (Payment)
   * Dr: เจ้าหนี้การค้า (Accounts Payable)
   * Cr: เงินสด/ธนาคาร (Cash/Bank)
   */
  async postPayment(payment) {
    try {
      await this.initialize()

      const amount = parseFloat(payment.amount || 0)
      const paymentAccount = this.getPaymentAccount(payment.payment_method)
      const ap = this.getAccount('accounts_payable')

      const journalEntry = {
        reference_type: 'payment',
        reference_id: payment.id,
        reference_number: payment.payment_number,
        date: payment.payment_date,
        description: `จ่ายชำระเงินให้: ${payment.supplier_name} (${payment.payment_number})`,
        items: [
          {
            account_code: ap.code,
            account_name: ap.name,
            debit: amount,
            credit: 0,
            description: `เจ้าหนี้: ${payment.supplier_name}`
          },
          {
            account_code: paymentAccount.code,
            account_name: paymentAccount.name,
            debit: 0,
            credit: amount,
            description: `จ่ายด้วย${payment.payment_method === 'cash' ? 'เงินสด' : 'เงินโอน'}`
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Payment:', error.message)
      throw error
    }
  }

  /**
   * ========================================
   * DELIVERY MODULE - ต้นทุนขาย (COGS)
   * ========================================
   */

  /**
   * 5. บันทึกบัญชีเมื่อส่งของ - คำนวณ COGS (Cost of Goods Sold)
   * Dr: ต้นทุนขาย (Cost of Goods Sold)
   * Cr: สินค้าคงเหลือ (Inventory)
   */
  async postDeliveryWithCOGS(delivery, cogsAmount) {
    try {
      await this.initialize()

      const cogs = parseFloat(cogsAmount || 0)
      const cogsAccount = this.getAccount('cogs')
      const inventory = this.getAccount('inventory')

      const journalEntry = {
        reference_type: 'delivery',
        reference_id: delivery.id,
        reference_number: delivery.delivery_number,
        date: delivery.delivery_date,
        description: `ส่งสินค้า + บันทึก COGS: ${delivery.customer_name} (${delivery.delivery_number})`,
        items: [
          {
            account_code: cogsAccount.code,
            account_name: cogsAccount.name,
            debit: cogs,
            credit: 0,
            description: `COGS สำหรับการขาย ${delivery.order_number}`
          },
          {
            account_code: inventory.code,
            account_name: inventory.name,
            debit: 0,
            credit: cogs,
            description: 'สินค้าคงเหลือลดลง'
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Delivery COGS:', error.message)
      throw error
    }
  }

  /**
   * ========================================
   * EXPENSE MODULE - ค่าใช้จ่าย
   * ========================================
   */

  /**
   * 6. บันทึกบัญชีเมื่อมีค่าใช้จ่าย (Expense)
   * Dr: ค่าใช้จ่าย (Expense Account)
   * Cr: เงินสด/ธนาคาร (Cash/Bank)
   */
  async postExpense(expense) {
    try {
      const amount = parseFloat(expense.amount || 0)
      const accountCode = expense.payment_method === 'cash' ? '1010' : '1020'
      const accountName = expense.payment_method === 'cash' ? 'Cash on Hand' : 'Bank Account'

      const journalEntry = {
        reference_type: 'expense',
        reference_id: expense.id,
        reference_number: expense.expense_number,
        date: expense.expense_date,
        description: `ค่าใช้จ่าย: ${expense.description} (${expense.expense_number})`,
        items: [
          {
            account_code: expense.expense_account_code || '5200',
            account_name: expense.expense_account_name || 'Operating Expenses',
            debit: amount,
            credit: 0,
            description: expense.description
          },
          {
            account_code: accountCode,
            account_name: accountName,
            debit: 0,
            credit: amount,
            description: `จ่ายด้วย${expense.payment_method === 'cash' ? 'เงินสด' : 'เงินโอน'}`
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Expense:', error.message)
      throw error
    }
  }

  /**
   * ========================================
   * FIXED ASSETS MODULE - สินทรัพย์ถาวร
   * ========================================
   */

  /**
   * 7. บันทึกบัญชีเมื่อซื้อสินทรัพย์ถาวร (Fixed Asset Purchase)
   * Dr: สินทรัพย์ถาวร (Fixed Assets)
   * Cr: เงินสด/ธนาคาร (Cash/Bank)
   */
  async postFixedAssetPurchase(asset) {
    try {
      const cost = parseFloat(asset.cost || 0)
      const accountCode = asset.payment_method === 'cash' ? '1010' : '1020'
      const accountName = asset.payment_method === 'cash' ? 'Cash on Hand' : 'Bank Account'

      const journalEntry = {
        reference_type: 'fixed_asset_purchase',
        reference_id: asset.id,
        reference_number: asset.asset_code,
        date: asset.purchase_date,
        description: `ซื้อสินทรัพย์ถาวร: ${asset.name} (${asset.asset_code})`,
        items: [
          {
            account_code: this.getFixedAssetAccountCode(asset.type),
            account_name: this.getFixedAssetAccountName(asset.type),
            debit: cost,
            credit: 0,
            description: `${asset.name} - ${asset.type}`
          },
          {
            account_code: accountCode,
            account_name: accountName,
            debit: 0,
            credit: cost,
            description: `จ่ายด้วย${asset.payment_method === 'cash' ? 'เงินสด' : 'เงินโอน'}`
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Fixed Asset Purchase:', error.message)
      throw error
    }
  }

  /**
   * 8. บันทึกบัญชีค่าเสื่อมราคา (Depreciation)
   * Dr: ค่าเสื่อมราคา (Depreciation Expense)
   * Cr: ค่าเสื่อมราคาสะสม (Accumulated Depreciation)
   */
  async postDepreciation(depreciation) {
    try {
      const amount = parseFloat(depreciation.amount || 0)

      const journalEntry = {
        reference_type: 'depreciation',
        reference_id: depreciation.asset_id,
        reference_number: `DEP-${depreciation.period}`,
        date: depreciation.date,
        description: `ค่าเสื่อมราคา: ${depreciation.asset_name} (งวด ${depreciation.period})`,
        items: [
          {
            account_code: '5400', // ค่าเสื่อมราคา
            account_name: 'Depreciation Expense',
            debit: amount,
            credit: 0,
            description: `ค่าเสื่อมราคาประจำงวด ${depreciation.period}`
          },
          {
            account_code: '1410', // ค่าเสื่อมราคาสะสม
            account_name: 'Accumulated Depreciation',
            debit: 0,
            credit: amount,
            description: `สะสมค่าเสื่อม ${depreciation.asset_name}`
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Depreciation:', error.message)
      throw error
    }
  }

  /**
   * 9. บันทึกบัญชีขายสินทรัพย์ถาวร (Fixed Asset Disposal)
   * Dr: เงินสด/ธนาคาร (Cash/Bank) - ราคาขาย
   * Dr: ค่าเสื่อมราคาสะสม (Accumulated Depreciation)
   * Dr/Cr: กำไร/ขาดทุนจากการขาย (Gain/Loss on Disposal)
   * Cr: สินทรัพย์ถาวร (Fixed Assets) - ราคาทุน
   */
  async postFixedAssetDisposal(disposal) {
    try {
      const cost = parseFloat(disposal.original_cost || 0)
      const accumulatedDep = parseFloat(disposal.accumulated_depreciation || 0)
      const salePrice = parseFloat(disposal.sale_price || 0)
      const bookValue = cost - accumulatedDep
      const gainOrLoss = salePrice - bookValue // บวก = กำไร, ลบ = ขาดทุน

      const accountCode = disposal.payment_method === 'cash' ? '1010' : '1020'
      const accountName = disposal.payment_method === 'cash' ? 'Cash on Hand' : 'Bank Account'

      const items = [
        {
          account_code: accountCode,
          account_name: accountName,
          debit: salePrice,
          credit: 0,
          description: `รับเงินจากการขายสินทรัพย์`
        },
        {
          account_code: '1410',
          account_name: 'Accumulated Depreciation',
          debit: accumulatedDep,
          credit: 0,
          description: `ตัดค่าเสื่อมราคาสะสม`
        },
        {
          account_code: this.getFixedAssetAccountCode(disposal.asset_type),
          account_name: this.getFixedAssetAccountName(disposal.asset_type),
          debit: 0,
          credit: cost,
          description: `ตัดสินทรัพย์ออกจากบัญชี`
        }
      ]

      // บันทึกกำไร/ขาดทุน
      if (gainOrLoss !== 0) {
        items.push({
          account_code: gainOrLoss > 0 ? '4200' : '6100', // กำไร/ขาดทุน
          account_name: gainOrLoss > 0 ? 'Gain on Asset Disposal' : 'Loss on Asset Disposal',
          debit: gainOrLoss < 0 ? Math.abs(gainOrLoss) : 0,
          credit: gainOrLoss > 0 ? gainOrLoss : 0,
          description: `${gainOrLoss > 0 ? 'กำไร' : 'ขาดทุน'}จากการขาย ${MODULE_UTILS.formatCurrency(Math.abs(gainOrLoss))}`
        })
      }

      const journalEntry = {
        reference_type: 'fixed_asset_disposal',
        reference_id: disposal.asset_id,
        reference_number: disposal.disposal_number,
        date: disposal.disposal_date,
        description: `ขายสินทรัพย์ถาวร: ${disposal.asset_name} (${disposal.asset_code})`,
        items
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Fixed Asset Disposal:', error.message)
      throw error
    }
  }

  /**
   * ========================================
   * PAYROLL MODULE - เงินเดือน
   * ========================================
   */

  /**
   * 10. บันทึกบัญชีจ่ายเงินเดือน (Payroll)
   * Dr: ค่าใช้จ่ายเงินเดือน (Salary Expense)
   * Cr: ภาษีหัก ณ ที่จ่าย (Withholding Tax Payable)
   * Cr: ประกันสังคม (Social Security Payable)
   * Cr: เงินสด/ธนาคาร (Cash/Bank) - เงินสุทธิที่จ่าย
   */
  async postPayroll(payroll) {
    try {
      const grossSalary = parseFloat(payroll.gross_salary || 0)
      const withholdingTax = parseFloat(payroll.withholding_tax || 0)
      const socialSecurity = parseFloat(payroll.social_security || 0)
      const netSalary = grossSalary - withholdingTax - socialSecurity

      const accountCode = payroll.payment_method === 'cash' ? '1010' : '1020'
      const accountName = payroll.payment_method === 'cash' ? 'Cash on Hand' : 'Bank Account'

      const items = [
        {
          account_code: '5210',
          account_name: 'Salary Expense',
          debit: grossSalary,
          credit: 0,
          description: `เงินเดือนพนักงาน: ${payroll.employee_name}`
        },
        {
          account_code: accountCode,
          account_name: accountName,
          debit: 0,
          credit: netSalary,
          description: `จ่ายเงินเดือนสุทธิ`
        }
      ]

      // ภาษีหัก ณ ที่จ่าย
      if (withholdingTax > 0) {
        items.push({
          account_code: '2160',
          account_name: 'Withholding Tax Payable',
          debit: 0,
          credit: withholdingTax,
          description: `ภาษีหัก ณ ที่จ่าย (${MODULE_UTILS.formatCurrency(withholdingTax)})`
        })
      }

      // ประกันสังคม
      if (socialSecurity > 0) {
        items.push({
          account_code: '2170',
          account_name: 'Social Security Payable',
          debit: 0,
          credit: socialSecurity,
          description: `ประกันสังคม (${MODULE_UTILS.formatCurrency(socialSecurity)})`
        })
      }

      const journalEntry = {
        reference_type: 'payroll',
        reference_id: payroll.id,
        reference_number: payroll.payroll_number,
        date: payroll.payment_date,
        description: `จ่ายเงินเดือนประจำเดือน ${payroll.period}: ${payroll.employee_name}`,
        items
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Payroll:', error.message)
      throw error
    }
  }

  /**
   * ========================================
   * TAX MODULE - ภาษี
   * ========================================
   */

  /**
   * 11. บันทึกบัญชีจ่ายภาษี VAT (VAT Payment)
   * Dr: ภาษีขาย (Output VAT Payable)
   * Cr: ภาษีซื้อ (Input VAT Receivable) - หักออก
   * Cr: เงินสด/ธนาคาร (Cash/Bank) - ภาษีสุทธิที่จ่าย
   */
  async postVATPayment(vatPayment) {
    try {
      const outputVAT = parseFloat(vatPayment.output_vat || 0)
      const inputVAT = parseFloat(vatPayment.input_vat || 0)
      const netVAT = outputVAT - inputVAT

      if (netVAT <= 0) {
        throw new Error('Net VAT must be positive to make payment')
      }

      const accountCode = vatPayment.payment_method === 'cash' ? '1010' : '1020'
      const accountName = vatPayment.payment_method === 'cash' ? 'Cash on Hand' : 'Bank Account'

      const journalEntry = {
        reference_type: 'vat_payment',
        reference_id: vatPayment.id,
        reference_number: vatPayment.payment_number,
        date: vatPayment.payment_date,
        description: `จ่าย VAT สุทธิ - ${vatPayment.period}`,
        items: [
          {
            account_code: '2150',
            account_name: 'Output VAT Payable',
            debit: outputVAT,
            credit: 0,
            description: `ภาษีขาย (${MODULE_UTILS.formatCurrency(outputVAT)})`
          },
          {
            account_code: '1180',
            account_name: 'Input VAT Receivable',
            debit: 0,
            credit: inputVAT,
            description: `หักภาษีซื้อ (${MODULE_UTILS.formatCurrency(inputVAT)})`
          },
          {
            account_code: accountCode,
            account_name: accountName,
            debit: 0,
            credit: netVAT,
            description: `จ่ายภาษีสุทธิ (${MODULE_UTILS.formatCurrency(netVAT)})`
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post VAT Payment:', error.message)
      throw error
    }
  }

  /**
   * 12. บันทึกบัญชีจ่ายภาษีหัก ณ ที่จ่าย (Withholding Tax Payment)
   * Dr: ภาษีหัก ณ ที่จ่าย (Withholding Tax Payable)
   * Cr: เงินสด/ธนาคาร (Cash/Bank)
   */
  async postWithholdingTaxPayment(whtPayment) {
    try {
      const amount = parseFloat(whtPayment.amount || 0)
      const accountCode = whtPayment.payment_method === 'cash' ? '1010' : '1020'
      const accountName = whtPayment.payment_method === 'cash' ? 'Cash on Hand' : 'Bank Account'

      const journalEntry = {
        reference_type: 'withholding_tax_payment',
        reference_id: whtPayment.id,
        reference_number: whtPayment.payment_number,
        date: whtPayment.payment_date,
        description: `จ่ายภาษีหัก ณ ที่จ่าย - ${whtPayment.period} (${whtPayment.form_type})`,
        items: [
          {
            account_code: '2160',
            account_name: 'Withholding Tax Payable',
            debit: amount,
            credit: 0,
            description: `จ่ายภาษีหัก ณ ที่จ่าย ${whtPayment.form_type}`
          },
          {
            account_code: accountCode,
            account_name: accountName,
            debit: 0,
            credit: amount,
            description: `จ่ายด้วย${whtPayment.payment_method === 'cash' ? 'เงินสด' : 'เงินโอน'}`
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Withholding Tax Payment:', error.message)
      throw error
    }
  }

  /**
   * ========================================
   * ADJUSTMENT MODULE - รายการปรับปรุง
   * ========================================
   */

  /**
   * 13. บันทึกรายการปรับปรุง/แก้ไข (Manual Adjustment)
   * ใช้สำหรับรายการปรับปรุงทั่วไป เช่น เงินสดขาด/เกิน, แก้ไขข้อผิดพลาด
   */
  async postManualAdjustment(adjustment) {
    try {
      if (!adjustment.items || adjustment.items.length === 0) {
        throw new Error('Adjustment must have at least one item')
      }

      const journalEntry = {
        reference_type: 'manual_adjustment',
        reference_id: adjustment.id,
        reference_number: adjustment.adjustment_number,
        date: adjustment.date,
        description: adjustment.description || 'รายการปรับปรุงบัญชี',
        items: adjustment.items.map(item => ({
          account_code: item.account_code,
          account_name: item.account_name,
          debit: parseFloat(item.debit || 0),
          credit: parseFloat(item.credit || 0),
          description: item.description
        }))
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Manual Adjustment:', error.message)
      throw error
    }
  }

  /**
   * ========================================
   * PRODUCTION MODULE - การผลิต
   * ========================================
   */

  /**
   * 14. บันทึกบัญชีเบิกวัตถุดิบเข้าผลิต (Raw Materials Issue)
   * Dr: สินค้าระหว่างผลิต (Work in Process)
   * Cr: วัตถุดิบคงเหลือ (Raw Materials Inventory)
   */
  async postRawMaterialsIssue(production) {
    try {
      const amount = parseFloat(production.materials_cost || 0)

      const journalEntry = {
        reference_type: 'raw_materials_issue',
        reference_id: production.id,
        reference_number: production.production_number,
        date: production.issue_date,
        description: `เบิกวัตถุดิบเข้าผลิต: ${production.product_name} (${production.production_number})`,
        items: [
          {
            account_code: '1320', // สินค้าระหว่างผลิต
            account_name: 'Work in Process Inventory',
            debit: amount,
            credit: 0,
            description: `วัตถุดิบสำหรับผลิต ${production.product_name}`
          },
          {
            account_code: '1311', // วัตถุดิบคงเหลือ
            account_name: 'Raw Materials Inventory',
            debit: 0,
            credit: amount,
            description: 'เบิกวัตถุดิบ'
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Raw Materials Issue:', error.message)
      throw error
    }
  }

  /**
   * 15. บันทึกบัญชีค่าแรงงานทางตรง (Direct Labor)
   * Dr: สินค้าระหว่างผลิต (Work in Process)
   * Cr: ค่าแรงงานค้างจ่าย (Wages Payable)
   */
  async postDirectLabor(labor) {
    try {
      const amount = parseFloat(labor.labor_cost || 0)

      const journalEntry = {
        reference_type: 'direct_labor',
        reference_id: labor.production_id,
        reference_number: labor.production_number,
        date: labor.date,
        description: `ค่าแรงงานทางตรง: ${labor.product_name} (${labor.production_number})`,
        items: [
          {
            account_code: '1320',
            account_name: 'Work in Process Inventory',
            debit: amount,
            credit: 0,
            description: `ค่าแรงงาน ${labor.hours} ชั่วโมง`
          },
          {
            account_code: '2180',
            account_name: 'Wages Payable',
            debit: 0,
            credit: amount,
            description: 'ค่าแรงงานค้างจ่าย'
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Direct Labor:', error.message)
      throw error
    }
  }

  /**
   * 16. บันทึกบัญชีค่าโสหุ้ยการผลิต (Manufacturing Overhead)
   * Dr: สินค้าระหว่างผลิต (Work in Process)
   * Cr: ค่าโสหุ้ยการผลิต (Manufacturing Overhead)
   */
  async postManufacturingOverhead(overhead) {
    try {
      const amount = parseFloat(overhead.overhead_cost || 0)

      const journalEntry = {
        reference_type: 'manufacturing_overhead',
        reference_id: overhead.production_id,
        reference_number: overhead.production_number,
        date: overhead.date,
        description: `ค่าโสหุ้ยการผลิต: ${overhead.description} (${overhead.production_number})`,
        items: [
          {
            account_code: '1320',
            account_name: 'Work in Process Inventory',
            debit: amount,
            credit: 0,
            description: overhead.description
          },
          {
            account_code: '5150',
            account_name: 'Manufacturing Overhead',
            debit: 0,
            credit: amount,
            description: 'ค่าโสหุ้ยการผลิต'
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Manufacturing Overhead:', error.message)
      throw error
    }
  }

  /**
   * 17. บันทึกบัญชีเมื่อการผลิตเสร็จสมบูรณ์ (Production Completion)
   * Dr: สินค้าสำเร็จรูป (Finished Goods)
   * Cr: สินค้าระหว่างผลิต (Work in Process)
   */
  async postProductionCompletion(production) {
    try {
      const totalCost = parseFloat(production.total_production_cost || 0)

      const journalEntry = {
        reference_type: 'production_completion',
        reference_id: production.id,
        reference_number: production.production_number,
        date: production.completion_date,
        description: `การผลิตเสร็จสมบูรณ์: ${production.product_name} (${production.production_number})`,
        items: [
          {
            account_code: '1330', // สินค้าสำเร็จรูป
            account_name: 'Finished Goods Inventory',
            debit: totalCost,
            credit: 0,
            description: `สินค้าสำเร็จรูป ${production.quantity} ${production.unit}`
          },
          {
            account_code: '1320', // สินค้าระหว่างผลิต
            account_name: 'Work in Process Inventory',
            debit: 0,
            credit: totalCost,
            description: 'โอนจากสินค้าระหว่างผลิต'
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Production Completion:', error.message)
      throw error
    }
  }

  /**
   * ========================================
   * DELIVERY MODULE - ค่าจัดส่ง
   * ========================================
   */

  /**
   * 18. บันทึกบัญชีค่าขนส่ง/จัดส่ง (Shipping/Delivery Expense)
   * Dr: ค่าขนส่ง (Shipping Expense)
   * Cr: เงินสด/ธนาคาร (Cash/Bank)
   * 
   * หรือถ้าเก็บจากลูกค้า:
   * Dr: ลูกหนี้การค้า (Accounts Receivable)
   * Cr: รายได้ค่าขนส่ง (Shipping Revenue)
   */
  async postShippingExpense(shipping) {
    try {
      const amount = parseFloat(shipping.amount || 0)
      const isChargeToCustomer = shipping.charge_to_customer || false

      if (isChargeToCustomer) {
        // กรณีเก็บจากลูกค้า = รายได้
        const journalEntry = {
          reference_type: 'shipping_revenue',
          reference_id: shipping.delivery_id,
          reference_number: shipping.delivery_number,
          date: shipping.date,
          description: `ค่าขนส่งเก็บจากลูกค้า: ${shipping.customer_name} (${shipping.delivery_number})`,
          items: [
            {
              account_code: '1120',
              account_name: 'Accounts Receivable - Trade',
              debit: amount,
              credit: 0,
              description: `ค่าขนส่งจากลูกค้า`
            },
            {
              account_code: '4300',
              account_name: 'Shipping Revenue',
              debit: 0,
              credit: amount,
              description: 'รายได้ค่าขนส่ง'
            }
          ]
        }
        return await this.saveJournalEntry(journalEntry)

      } else {
        // กรณีบริษัทรับผิดชอบ = ค่าใช้จ่าย
        const accountCode = shipping.payment_method === 'cash' ? '1010' : '1020'
        const accountName = shipping.payment_method === 'cash' ? 'Cash on Hand' : 'Bank Account'

        const journalEntry = {
          reference_type: 'shipping_expense',
          reference_id: shipping.delivery_id,
          reference_number: shipping.delivery_number,
          date: shipping.date,
          description: `ค่าขนส่งจัดส่ง: ${shipping.customer_name} (${shipping.delivery_number})`,
          items: [
            {
              account_code: '5250',
              account_name: 'Shipping & Delivery Expense',
              debit: amount,
              credit: 0,
              description: `ค่าขนส่ง ${shipping.carrier || 'บริษัทขนส่ง'}`
            },
            {
              account_code: accountCode,
              account_name: accountName,
              debit: 0,
              credit: amount,
              description: `จ่ายด้วย${shipping.payment_method === 'cash' ? 'เงินสด' : 'เงินโอน'}`
            }
          ]
        }
        return await this.saveJournalEntry(journalEntry)
      }

    } catch (error) {
      console.error('❌ Failed to post Shipping Expense:', error.message)
      throw error
    }
  }

  /**
   * ========================================
   * EXPENSE BY DEPARTMENT - ค่าใช้จ่ายแยกตามแผนก
   * ========================================
   */

  /**
   * 19. บันทึกค่าใช้จ่ายขาย (Selling Expenses)
   * เช่น ค่าโฆษณา, ค่าคอมมิชชั่น, ค่าเดินทาง
   */
  async postSellingExpense(expense) {
    try {
      const amount = parseFloat(expense.amount || 0)
      const accountCode = expense.payment_method === 'cash' ? '1010' : '1020'
      const accountName = expense.payment_method === 'cash' ? 'Cash on Hand' : 'Bank Account'

      const expenseAccountMap = {
        'advertising': { code: '5220', name: 'Advertising Expense' },
        'commission': { code: '5230', name: 'Sales Commission' },
        'travel': { code: '5240', name: 'Travel Expense' },
        'marketing': { code: '5221', name: 'Marketing Expense' },
        'promotion': { code: '5222', name: 'Promotion Expense' }
      }

      const expenseAccount = expenseAccountMap[expense.type] || { code: '5200', name: 'Selling Expenses' }

      const journalEntry = {
        reference_type: 'selling_expense',
        reference_id: expense.id,
        reference_number: expense.expense_number,
        date: expense.date,
        description: `ค่าใช้จ่ายขาย: ${expense.description}`,
        items: [
          {
            account_code: expenseAccount.code,
            account_name: expenseAccount.name,
            debit: amount,
            credit: 0,
            description: expense.description
          },
          {
            account_code: accountCode,
            account_name: accountName,
            debit: 0,
            credit: amount,
            description: `จ่ายด้วย${expense.payment_method === 'cash' ? 'เงินสด' : 'เงินโอน'}`
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Selling Expense:', error.message)
      throw error
    }
  }

  /**
   * 20. บันทึกค่าใช้จ่ายบริหาร (Administrative Expenses)
   * เช่น ค่าเช่า, ค่าสาธารณูปโภค, เงินเดือนฝ่ายบริหาร
   */
  async postAdministrativeExpense(expense) {
    try {
      const amount = parseFloat(expense.amount || 0)
      const accountCode = expense.payment_method === 'cash' ? '1010' : '1020'
      const accountName = expense.payment_method === 'cash' ? 'Cash on Hand' : 'Bank Account'

      const expenseAccountMap = {
        'rent': { code: '5310', name: 'Rent Expense' },
        'utilities': { code: '5320', name: 'Utilities Expense' },
        'office_supplies': { code: '5330', name: 'Office Supplies Expense' },
        'insurance': { code: '5340', name: 'Insurance Expense' },
        'professional_fees': { code: '5350', name: 'Professional Fees' },
        'maintenance': { code: '5360', name: 'Maintenance & Repair Expense' },
        'communication': { code: '5370', name: 'Telephone & Internet' }
      }

      const expenseAccount = expenseAccountMap[expense.type] || { code: '5300', name: 'Administrative Expenses' }

      const journalEntry = {
        reference_type: 'administrative_expense',
        reference_id: expense.id,
        reference_number: expense.expense_number,
        date: expense.date,
        description: `ค่าใช้จ่ายบริหาร: ${expense.description}`,
        items: [
          {
            account_code: expenseAccount.code,
            account_name: expenseAccount.name,
            debit: amount,
            credit: 0,
            description: expense.description
          },
          {
            account_code: accountCode,
            account_name: accountName,
            debit: 0,
            credit: amount,
            description: `จ่ายด้วย${expense.payment_method === 'cash' ? 'เงินสด' : 'เงินโอน'}`
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Administrative Expense:', error.message)
      throw error
    }
  }

  /**
   * ========================================
   * FINANCE MODULE - การเงิน
   * ========================================
   */

  /**
   * 21. บันทึกบัญชีกู้เงิน/สินเชื่อ (Loan Received)
   * Dr: เงินสด/ธนาคาร (Cash/Bank)
   * Cr: เงินกู้ยืมระยะสั้น/ยาว (Loan Payable)
   */
  async postLoanReceived(loan) {
    try {
      const amount = parseFloat(loan.amount || 0)
      const accountCode = loan.payment_method === 'cash' ? '1010' : '1020'
      const accountName = loan.payment_method === 'cash' ? 'Cash on Hand' : 'Bank Account'
      
      // เงินกู้ระยะสั้น (<1 ปี) = 2120, ระยะยาว (>1 ปี) = 2510
      const loanAccountCode = loan.term === 'short_term' ? '2120' : '2510'
      const loanAccountName = loan.term === 'short_term' ? 'Short-term Loan Payable' : 'Long-term Loan Payable'

      const journalEntry = {
        reference_type: 'loan_received',
        reference_id: loan.id,
        reference_number: loan.loan_number,
        date: loan.loan_date,
        description: `รับเงินกู้ยืม: ${loan.lender_name} (${loan.loan_number})`,
        items: [
          {
            account_code: accountCode,
            account_name: accountName,
            debit: amount,
            credit: 0,
            description: `รับเงินกู้จาก ${loan.lender_name}`
          },
          {
            account_code: loanAccountCode,
            account_name: loanAccountName,
            debit: 0,
            credit: amount,
            description: `เงินกู้ ${loan.term === 'short_term' ? 'ระยะสั้น' : 'ระยะยาว'}`
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Loan Received:', error.message)
      throw error
    }
  }

  /**
   * 22. บันทึกบัญชีชำระคืนเงินกู้ (Loan Payment)
   * Dr: เงินกู้ยืม (Loan Payable)
   * Dr: ดอกเบี้ยจ่าย (Interest Expense)
   * Cr: เงินสด/ธนาคาร (Cash/Bank)
   */
  async postLoanPayment(payment) {
    try {
      const principal = parseFloat(payment.principal_amount || 0)
      const interest = parseFloat(payment.interest_amount || 0)
      const total = principal + interest

      const accountCode = payment.payment_method === 'cash' ? '1010' : '1020'
      const accountName = payment.payment_method === 'cash' ? 'Cash on Hand' : 'Bank Account'

      const loanAccountCode = payment.loan_term === 'short_term' ? '2120' : '2510'
      const loanAccountName = payment.loan_term === 'short_term' ? 'Short-term Loan Payable' : 'Long-term Loan Payable'

      const items = [
        {
          account_code: loanAccountCode,
          account_name: loanAccountName,
          debit: principal,
          credit: 0,
          description: `ชำระเงินต้น ${payment.loan_number}`
        },
        {
          account_code: accountCode,
          account_name: accountName,
          debit: 0,
          credit: total,
          description: `ชำระเงินกู้ทั้งหมด ${MODULE_UTILS.formatCurrency(total)}`
        }
      ]

      // เพิ่มดอกเบี้ยถ้ามี
      if (interest > 0) {
        items.splice(1, 0, {
          account_code: '6200',
          account_name: 'Interest Expense',
          debit: interest,
          credit: 0,
          description: `ดอกเบี้ยจ่าย ${MODULE_UTILS.formatCurrency(interest)}`
        })
      }

      const journalEntry = {
        reference_type: 'loan_payment',
        reference_id: payment.loan_id,
        reference_number: payment.payment_number,
        date: payment.payment_date,
        description: `ชำระเงินกู้: ${payment.lender_name} งวดที่ ${payment.installment_number}`,
        items
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Loan Payment:', error.message)
      throw error
    }
  }

  /**
   * 23. บันทึกดอกเบี้ยรับ (Interest Income)
   * Dr: เงินสด/ธนาคาร (Cash/Bank)
   * Cr: ดอกเบี้ยรับ (Interest Income)
   */
  async postInterestIncome(interest) {
    try {
      const amount = parseFloat(interest.amount || 0)
      const accountCode = interest.payment_method === 'cash' ? '1010' : '1020'
      const accountName = interest.payment_method === 'cash' ? 'Cash on Hand' : 'Bank Account'

      const journalEntry = {
        reference_type: 'interest_income',
        reference_id: interest.id,
        reference_number: interest.reference_number,
        date: interest.date,
        description: `ดอกเบี้ยรับ: ${interest.description}`,
        items: [
          {
            account_code: accountCode,
            account_name: accountName,
            debit: amount,
            credit: 0,
            description: 'รับดอกเบี้ย'
          },
          {
            account_code: '4400',
            account_name: 'Interest Income',
            debit: 0,
            credit: amount,
            description: interest.description
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Interest Income:', error.message)
      throw error
    }
  }

  /**
   * 24. บันทึกดอกเบี้ยจ่าย (Interest Expense - Standalone)
   * Dr: ดอกเบี้ยจ่าย (Interest Expense)
   * Cr: ดอกเบี้ยค้างจ่าย (Interest Payable)
   */
  async postInterestExpenseAccrual(interest) {
    try {
      const amount = parseFloat(interest.amount || 0)

      const journalEntry = {
        reference_type: 'interest_expense_accrual',
        reference_id: interest.loan_id,
        reference_number: interest.loan_number,
        date: interest.date,
        description: `บันทึกดอกเบี้ยค้างจ่าย: ${interest.description}`,
        items: [
          {
            account_code: '6200',
            account_name: 'Interest Expense',
            debit: amount,
            credit: 0,
            description: interest.description
          },
          {
            account_code: '2190',
            account_name: 'Interest Payable',
            debit: 0,
            credit: amount,
            description: 'ดอกเบี้ยค้างจ่าย'
          }
        ]
      }

      return await this.saveJournalEntry(journalEntry)

    } catch (error) {
      console.error('❌ Failed to post Interest Expense Accrual:', error.message)
      throw error
    }
  }

  /**
   * ========================================
   * HELPER FUNCTIONS
   * ========================================
   */

  /**
   * รับ Account Code ตามประเภทสินทรัพย์ถาวร
   */
  getFixedAssetAccountCode(assetType) {
    const codes = {
      'land': '1510',           // ที่ดิน
      'building': '1520',       // อาคาร
      'machinery': '1530',      // เครื่องจักร
      'equipment': '1540',      // อุปกรณ์
      'vehicle': '1550',        // ยานพาหนะ
      'furniture': '1560',      // เฟอร์นิเจอร์
      'computer': '1570'        // คอมพิวเตอร์
    }
    return codes[assetType] || '1500' // Default: Fixed Assets
  }

  /**
   * รับ Account Name ตามประเภทสินทรัพย์ถาวร
   */
  getFixedAssetAccountName(assetType) {
    const names = {
      'land': 'Land',
      'building': 'Building',
      'machinery': 'Machinery',
      'equipment': 'Equipment',
      'vehicle': 'Vehicle',
      'furniture': 'Furniture & Fixtures',
      'computer': 'Computer Equipment'
    }
    return names[assetType] || 'Fixed Assets'
  }

  /**
   * ========================================
   * UTILITY FUNCTIONS
   * ========================================
   */

  /**
   * ดึงรายการบัญชีทั้งหมด
   */
  async getAllJournalEntries() {
    try {
      const entries = await this.engine.getAllData(this.moduleName, 'journal_entries')
      return entries || []
    } catch (error) {
      console.error('❌ Failed to get Journal Entries:', error.message)
      return []
    }
  }

  /**
   * ดึงรายการบัญชีตาม Reference
   */
  async getJournalEntriesByReference(referenceType, referenceId) {
    try {
      const entries = await this.getAllJournalEntries()
      return entries.filter(entry => 
        entry.reference_type === referenceType && 
        entry.reference_id === referenceId
      )
    } catch (error) {
      console.error('❌ Failed to get Journal Entries by Reference:', error.message)
      return []
    }
  }

  /**
   * ลบรายการบัญชี (สำหรับยกเลิกธุรกรรม)
   */
  async deleteJournalEntry(entryId) {
    try {
      await this.engine.deleteData(this.moduleName, 'journal_entries', entryId)
      console.log('✅ Journal Entry Deleted:', entryId)
      return true
    } catch (error) {
      console.error('❌ Failed to delete Journal Entry:', error.message)
      throw error
    }
  }

  /**
   * สร้างรายการกลับบัญชี (Reversing Entry)
   * ใช้เมื่อต้องการยกเลิกรายการบัญชีเดิม
   */
  async createReversingEntry(originalEntryId) {
    try {
      const entries = await this.getAllJournalEntries()
      const originalEntry = entries.find(e => e.id === originalEntryId)
      
      if (!originalEntry) {
        throw new Error(`Journal Entry ${originalEntryId} not found`)
      }

      // สลับ Debit/Credit
      const reversedItems = originalEntry.items.map(item => ({
        ...item,
        debit: item.credit,
        credit: item.debit
      }))

      const reversingEntry = {
        reference_type: originalEntry.reference_type,
        reference_id: originalEntry.reference_id,
        reference_number: originalEntry.reference_number,
        date: new Date().toISOString().split('T')[0],
        description: `[REVERSED] ${originalEntry.description}`,
        items: reversedItems,
        reversed_from: originalEntryId
      }

      return await this.saveJournalEntry(reversingEntry)

    } catch (error) {
      console.error('❌ Failed to create Reversing Entry:', error.message)
      throw error
    }
  }
}

// Export Singleton Instance
const accountingService = new AccountingService()
export default accountingService
