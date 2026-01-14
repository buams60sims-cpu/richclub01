const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

/**
 * AUTH BOUNDARY VERIFICATION
 * Tests that protected routes actually block unauthorized access
 */

const tests = [
    {
        name: 'PUBLIC: Get Products (should work)',
        method: 'GET',
        url: `${BASE_URL}/products`,
        expectSuccess: true
    },
    {
        name: 'PUBLIC: Get Home Content (should work)',
        method: 'GET',
        url: `${BASE_URL}/home-content`,
        expectSuccess: true
    },
    {
        name: 'PROTECTED: Create Product WITHOUT token (should fail)',
        method: 'POST',
        url: `${BASE_URL}/products`,
        data: { name: 'Test Product' },
        expectSuccess: false,
        expectedStatus: 401
    },
    {
        name: 'PROTECTED: Get All Orders WITHOUT token (should fail)',
        method: 'GET',
        url: `${BASE_URL}/orders`,
        expectSuccess: false,
        expectedStatus: 401
    },
    {
        name: 'PROTECTED: Get All Coupons WITHOUT token (should fail)',
        method: 'GET',
        url: `${BASE_URL}/coupons`,
        expectSuccess: false,
        expectedStatus: 401
    },
    {
        name: 'PROTECTED: Update Product WITHOUT token (should fail)',
        method: 'PUT',
        url: `${BASE_URL}/products/507f1f77bcf86cd799439011`,
        data: { name: 'Hacked' },
        expectSuccess: false,
        expectedStatus: 401
    },
    {
        name: 'PROTECTED: Delete Product WITHOUT token (should fail)',
        method: 'DELETE',
        url: `${BASE_URL}/products/507f1f77bcf86cd799439011`,
        expectSuccess: false,
        expectedStatus: 401
    },
    {
        name: 'PROTECTED: Upload Image WITHOUT token (should fail)',
        method: 'POST',
        url: `${BASE_URL}/upload/cms`,
        expectSuccess: false,
        expectedStatus: 401
    }
];

async function runTest(test) {
    try {
        const response = await axios({
            method: test.method,
            url: test.url,
            data: test.data,
            validateStatus: () => true,
            timeout: 5000
        });

        const passed = test.expectSuccess 
            ? response.status === 200 
            : response.status === (test.expectedStatus || 401);

        return {
            name: test.name,
            passed,
            status: response.status,
            expected: test.expectSuccess ? 200 : (test.expectedStatus || 401),
            message: response.data?.message || 'No message',
            data: response.data
        };
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            return {
                name: test.name,
                passed: false,
                error: 'Server not running on localhost:5000'
            };
        }
        return {
            name: test.name,
            passed: false,
            error: error.message
        };
    }
}

async function verifyAuthBoundaries() {
    console.log('🔐 AUTH BOUNDARY VERIFICATION\n');
    console.log('Testing protected routes without JWT token...\n');

    const results = [];
    for (const test of tests) {
        const result = await runTest(test);
        results.push(result);

        const icon = result.passed ? '✅' : '❌';
        console.log(`${icon} ${result.name}`);
        if (result.error) {
            console.log(`   ERROR: ${result.error}`);
        } else {
            console.log(`   Status: ${result.status} (expected: ${result.expected})`);
            console.log(`   Message: ${result.message}`);
        }
        console.log('');
    }

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`RESULTS: ${passed} passed, ${failed} failed`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (failed > 0) {
        console.log('❌ ISSUES DETECTED!');
        const serverDown = results.some(r => r.error && r.error.includes('not running'));
        if (serverDown) {
            console.log('\n⚠️  Server is not running!');
            console.log('Start server: cd server && npm run dev\n');
        } else {
            console.log('Some protected routes are accessible without authentication.');
            console.log('Fix auth middleware before production deployment.\n');
        }
        process.exit(1);
    } else {
        console.log('✅ ALL AUTH BOUNDARIES SECURE');
        console.log('Protected routes properly block unauthorized access.\n');
    }
}

// Run verification
verifyAuthBoundaries().catch(error => {
    console.error('Test error:', error.message);
    process.exit(1);
});
