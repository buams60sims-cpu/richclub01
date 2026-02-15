/**
 * Price Breakdown Test Script
 * Run: node testPriceBreakdown.js
 */

const calculatePriceBreakdown = (total, deliveryCharge = 50, taxRate = 0.08) => {
    // Step 1: Remove delivery
    const amountWithoutDelivery = total - deliveryCharge;
    
    // Step 2: Extract product cost before tax
    const productCost = amountWithoutDelivery / (1 + taxRate);
    
    // Step 3: Calculate tax
    const tax = amountWithoutDelivery - productCost;
    
    // Round values
    return {
        productCost: Math.round(productCost),
        tax: Math.round(tax),
        deliveryCharge: deliveryCharge,
        total: Math.round(productCost) + Math.round(tax) + deliveryCharge
    };
};

// Test cases
const testCases = [
    { total: 405, description: "Original example" },
    { total: 500, description: "Medium order" },
    { total: 1000, description: "Large order" },
    { total: 250, description: "Small order" },
    { total: 1500, description: "Very large order" }
];

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("         PRICE BREAKDOWN CALCULATION TEST");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

testCases.forEach((testCase, index) => {
    const result = calculatePriceBreakdown(testCase.total);
    const taxPercentage = ((result.tax / result.productCost) * 100).toFixed(2);
    const verified = result.total === testCase.total ? "✅" : "❌";
    
    console.log(`Test Case ${index + 1}: ${testCase.description}`);
    console.log(`Input Total: ₹${testCase.total}`);
    console.log("─────────────────────────────────────────────────");
    console.log(`Product Cost:      ₹${result.productCost}`);
    console.log(`Tax (8%):          ₹${result.tax}`);
    console.log(`Delivery Charges:  ₹${result.deliveryCharge}`);
    console.log("─────────────────────────────────────────────────");
    console.log(`Total:             ₹${result.total} ${verified}`);
    console.log(`Tax Percentage:    ${taxPercentage}%`);
    console.log(`Verification:      ${result.productCost} + ${result.tax} + ${result.deliveryCharge} = ${result.total}`);
    console.log("\n");
});

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("                    TEST COMPLETE");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
