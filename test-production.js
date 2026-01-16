/**
 * PRODUCTION READINESS TEST SUITE
 * Comprehensive API, Performance, Security & Stability Testing
 */

const https = require('https');
const http = require('http');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'https://richclub01.onrender.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://richclub01.vercel.app';
const API_BASE = `${BACKEND_URL}/api/v1`;

// Test Results
const results = {
    passed: [],
    failed: [],
    warnings: [],
    performance: {}
};

// Utility: Make HTTP Request
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const protocol = url.startsWith('https') ? https : http;

        const req = protocol.request(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: parsed,
                        responseTime,
                        rawData: data
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data,
                        responseTime,
                        rawData: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject({
                error: error.message,
                responseTime: Date.now() - startTime
            });
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

// Test Categories
const tests = {
    // 1️⃣ API FUNCTIONAL TESTING
    async testHealthEndpoint() {
        console.log('\n🔍 Testing Health Endpoint...');
        try {
            const response = await makeRequest(`${API_BASE}/health`);

            if (response.statusCode === 200) {
                results.passed.push('✅ Health endpoint returns 200');
                results.performance.health = response.responseTime;

                if (response.data.status === 'ok') {
                    results.passed.push('✅ Health status is OK');
                }

                if (response.data.db === 'connected') {
                    results.passed.push('✅ Database is connected');
                } else {
                    results.failed.push('❌ Database is NOT connected');
                }

                console.log(`   Response Time: ${response.responseTime}ms`);
                console.log(`   Status: ${response.data.status}`);
                console.log(`   DB: ${response.data.db}`);
            } else {
                results.failed.push(`❌ Health endpoint returned ${response.statusCode}`);
            }
        } catch (error) {
            results.failed.push(`❌ Health endpoint failed: ${error.error || error.message}`);
        }
    },

    async testProductsEndpoint() {
        console.log('\n🔍 Testing Products Endpoint...');
        try {
            const response = await makeRequest(`${API_BASE}/products`);

            if (response.statusCode === 200) {
                results.passed.push('✅ Products endpoint returns 200');
                results.performance.products = response.responseTime;

                if (Array.isArray(response.data.data)) {
                    results.passed.push(`✅ Products list returned (${response.data.data.length} items)`);
                } else {
                    results.warnings.push('⚠️ Products data is not an array');
                }

                console.log(`   Response Time: ${response.responseTime}ms`);
                console.log(`   Products Count: ${response.data.data?.length || 0}`);
            } else {
                results.failed.push(`❌ Products endpoint returned ${response.statusCode}`);
            }
        } catch (error) {
            results.failed.push(`❌ Products endpoint failed: ${error.error || error.message}`);
        }
    },

    async testAuthLogin() {
        console.log('\n🔍 Testing Auth Login (Invalid Credentials)...');
        try {
            const response = await makeRequest(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    email: 'invalid@test.com',
                    password: 'wrongpassword'
                }
            });

            if (response.statusCode === 401 || response.statusCode === 400) {
                results.passed.push('✅ Login correctly rejects invalid credentials');
                console.log(`   Correctly returned ${response.statusCode}`);
            } else {
                results.failed.push(`❌ Login returned unexpected status: ${response.statusCode}`);
            }
        } catch (error) {
            results.warnings.push(`⚠️ Login test error: ${error.error || error.message}`);
        }
    },

    async testRazorpayKey() {
        console.log('\n🔍 Testing Razorpay Key Endpoint...');
        try {
            const response = await makeRequest(`${API_BASE}/payments/razorpay-key`);

            if (response.statusCode === 200) {
                results.passed.push('✅ Razorpay key endpoint accessible');

                if (response.data.key && response.data.key.startsWith('rzp_')) {
                    results.passed.push('✅ Razorpay key format is valid');

                    if (response.data.key.includes('test')) {
                        results.warnings.push('⚠️ Using Razorpay TEST key (not production)');
                    } else if (response.data.key.includes('live')) {
                        results.passed.push('✅ Using Razorpay LIVE key');
                    }
                } else {
                    results.failed.push('❌ Invalid Razorpay key format');
                }

                console.log(`   Key: ${response.data.key?.substring(0, 15)}...`);
            } else {
                results.failed.push(`❌ Razorpay key endpoint returned ${response.statusCode}`);
            }
        } catch (error) {
            results.failed.push(`❌ Razorpay key endpoint failed: ${error.error || error.message}`);
        }
    },

    async testCORS() {
        console.log('\n🔍 Testing CORS Configuration...');
        try {
            const response = await makeRequest(`${API_BASE}/health`, {
                method: 'OPTIONS',
                headers: {
                    'Origin': FRONTEND_URL,
                    'Access-Control-Request-Method': 'GET'
                }
            });

            const corsHeader = response.headers['access-control-allow-origin'];

            if (corsHeader) {
                results.passed.push('✅ CORS headers present');
                console.log(`   Allow-Origin: ${corsHeader}`);
            } else {
                results.warnings.push('⚠️ CORS headers not found in OPTIONS response');
            }
        } catch (error) {
            results.warnings.push(`⚠️ CORS test error: ${error.error || error.message}`);
        }
    },

    async testRateLimiting() {
        console.log('\n🔍 Testing Rate Limiting...');
        try {
            const requests = [];
            for (let i = 0; i < 12; i++) {
                requests.push(makeRequest(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: { email: 'test@test.com', password: 'test' }
                }));
            }

            const responses = await Promise.all(requests);
            const rateLimited = responses.filter(r => r.statusCode === 429);

            if (rateLimited.length > 0) {
                results.passed.push('✅ Rate limiting is active');
                console.log(`   Rate limited after ${12 - rateLimited.length} requests`);
            } else {
                results.warnings.push('⚠️ Rate limiting may not be working (12 requests succeeded)');
            }
        } catch (error) {
            results.warnings.push(`⚠️ Rate limit test error: ${error.error || error.message}`);
        }
    },

    async testInvalidRoutes() {
        console.log('\n🔍 Testing 404 Handling...');
        try {
            const response = await makeRequest(`${API_BASE}/nonexistent-route-12345`);

            if (response.statusCode === 404) {
                results.passed.push('✅ 404 handler works correctly');

                if (response.data.success === false) {
                    results.passed.push('✅ 404 response has correct format');
                }
            } else {
                results.warnings.push(`⚠️ Invalid route returned ${response.statusCode} instead of 404`);
            }
        } catch (error) {
            results.warnings.push(`⚠️ 404 test error: ${error.error || error.message}`);
        }
    },

    async testPerformance() {
        console.log('\n🔍 Testing Performance Benchmarks...');

        const benchmarks = {
            health: results.performance.health,
            products: results.performance.products
        };

        console.log('\n   Performance Results:');
        for (const [endpoint, time] of Object.entries(benchmarks)) {
            if (time) {
                console.log(`   - ${endpoint}: ${time}ms`);

                if (time < 500) {
                    results.passed.push(`✅ ${endpoint} response time excellent (${time}ms)`);
                } else if (time < 1000) {
                    results.warnings.push(`⚠️ ${endpoint} response time acceptable (${time}ms)`);
                } else {
                    results.failed.push(`❌ ${endpoint} response time too slow (${time}ms)`);
                }
            }
        }
    },

    async testSecurityHeaders() {
        console.log('\n🔍 Testing Security Headers...');
        try {
            const response = await makeRequest(`${API_BASE}/health`);

            const securityHeaders = [
                'x-content-type-options',
                'x-frame-options',
                'x-xss-protection'
            ];

            securityHeaders.forEach(header => {
                if (response.headers[header]) {
                    results.passed.push(`✅ Security header present: ${header}`);
                } else {
                    results.warnings.push(`⚠️ Missing security header: ${header}`);
                }
            });
        } catch (error) {
            results.warnings.push(`⚠️ Security headers test error: ${error.error || error.message}`);
        }
    }
};

// Run All Tests
async function runAllTests() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  PRODUCTION READINESS AUDIT - Rich Club eCommerce          ║');
    console.log('║  Date: 2026-01-16 08:23 IST                                ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n🎯 Testing Backend: ${BACKEND_URL}`);
    console.log(`🎯 Testing Frontend: ${FRONTEND_URL}\n`);

    // Execute all tests
    for (const [name, testFn] of Object.entries(tests)) {
        try {
            await testFn();
        } catch (error) {
            results.failed.push(`❌ Test ${name} crashed: ${error.message}`);
        }
    }

    // Generate Report
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST RESULTS SUMMARY                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`✅ PASSED: ${results.passed.length}`);
    console.log(`❌ FAILED: ${results.failed.length}`);
    console.log(`⚠️  WARNINGS: ${results.warnings.length}\n`);

    if (results.passed.length > 0) {
        console.log('✅ PASSED CHECKS:');
        results.passed.forEach(msg => console.log(`   ${msg}`));
        console.log('');
    }

    if (results.failed.length > 0) {
        console.log('❌ FAILED CHECKS:');
        results.failed.forEach(msg => console.log(`   ${msg}`));
        console.log('');
    }

    if (results.warnings.length > 0) {
        console.log('⚠️  WARNINGS:');
        results.warnings.forEach(msg => console.log(`   ${msg}`));
        console.log('');
    }

    // Final Verdict
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    FINAL VERDICT                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const criticalFailures = results.failed.filter(f =>
        f.includes('Database') ||
        f.includes('Health') ||
        f.includes('CORS')
    );

    if (criticalFailures.length > 0) {
        console.log('🔴 STATUS: NOT READY FOR PRODUCTION');
        console.log('   Critical failures detected. DO NOT DEPLOY.\n');
        process.exit(1);
    } else if (results.failed.length > 0) {
        console.log('⚠️  STATUS: READY WITH LIMITATIONS');
        console.log('   Non-critical issues found. Review before deployment.\n');
        process.exit(0);
    } else {
        console.log('✅ STATUS: READY FOR DELIVERY');
        console.log('   All critical checks passed. Safe to deploy.\n');
        process.exit(0);
    }
}

// Execute
runAllTests().catch(error => {
    console.error('Fatal error during testing:', error);
    process.exit(1);
});
