// custom.js

/**
 * Detect the source of the slip based on the extracted text.
 * @param {string} text - The extracted text from the slip image.
 * @returns {string} - The detected source of the slip.
 */
export function detectSlipSource(text) {
    // Define unique patterns or keywords for each source
    const sources = {
      ktb: /กรุงไทย|Krungthai|© 84%/i, // Patterns for Krungthai Bank
      bay: /กรุงศรี|BAY|0 ๐ ๕/i, // Patterns for Bank of Ayudhya (BAY)
      ttb: /ttb|ทหารไทย|X =.|— ml =/i, // Patterns for TMBThanachart Bank (TTB)
      gsb: /ธนาคารออมสิน|GSB|426409418/i, // Patterns for Government Savings Bank (GSB)
      bb: /Bangkok Bank|กรุงเทพ|245-0-|544863/i, // Patterns for Bangkok Bank (BB)
      kb: /กสิกรไทย|Kasikorn|ธ . ก ส ิ ก ร ไท ย|9,000.00/i, // Patterns for Kasikorn Bank (KB)
      scb: /SCB|ไทยพาณิชย์|ร ห ั ส อ ้ า ง อ ิ ง : 202409/i, // Patterns for Siam Commercial Bank (SCB)
    };
  
    // Check the text against each source pattern
    for (let [source, pattern] of Object.entries(sources)) {
      if (pattern.test(text)) {
        return source; // Return the detected source
      }
    }
  
    return 'unknown'; // Return 'unknown' if no match is found
  }
  