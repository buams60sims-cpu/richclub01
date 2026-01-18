/**
 * Invoice Number Generator Utility
 * Generates unique invoice numbers for orders
 */

/**
 * Generate a unique invoice number
 * Format: INV-YYYYMMDD-XXXXX
 * Example: INV-20260103-00001
 * 
 * @returns {string} Unique invoice number
 */
const generateInvoiceNumber = () => {
    // Legacy random generator (fallback)
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `INV-${dateStr}-${randomNum}`;
};

/**
 * Generate invoice number with sequential increment
 * Format: INV-YYYYMMDD-0001
 * Checks database for the last order of the current day to determine sequence
 * 
 * @param {Model} OrderModel - Mongoose Order model
 * @returns {Promise<string>} Unique invoice number
 */
const generateUniqueInvoiceNumber = async (OrderModel) => {
    const date = new Date();
    // Format: YYYYMMDD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const datePrefix = `INV-${year}${month}${day}`;

    // Find the latest invoice created TODAY (starts with prefix)
    // Sort by invoiceNumber descending to get the highest suffix
    const lastOrder = await OrderModel.findOne({
        invoiceNumber: { $regex: `^${datePrefix}` }
    }).sort({ invoiceNumber: -1 });

    let nextSequence = 1;

    if (lastOrder && lastOrder.invoiceNumber) {
        const parts = lastOrder.invoiceNumber.split('-');
        const lastSuffix = parts[parts.length - 1];
        const lastSeqInt = parseInt(lastSuffix, 10);

        if (!isNaN(lastSeqInt)) {
            nextSequence = lastSeqInt + 1;
        }
    }

    // Format sequence as 4 digits (e.g., 0001, 0012, 0123)
    const nextSuffix = String(nextSequence).padStart(4, '0');
    return `${datePrefix}-${nextSuffix}`;
};

module.exports = {
    generateInvoiceNumber,
    generateUniqueInvoiceNumber
};
