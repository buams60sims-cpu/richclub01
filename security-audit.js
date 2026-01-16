/**
 * SECURITY & CONFIGURATION AUDIT SCRIPT
 * Checks for common security vulnerabilities and misconfigurations
 */

const fs = require('fs');
const path = require('path');

const results = {
    critical: [],
    warnings: [],
    passed: [],
    info: []
};

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     SECURITY & CONFIGURATION AUDIT                         ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// 1. Check for .env files in git
console.log('🔍 Checking for committed .env files...');
const rootDir = path.join(__dirname);
const gitignorePath = path.join(rootDir, '.gitignore');

if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');

    if (gitignore.includes('.env')) {
        results.passed.push('✅ .env files are in .gitignore');
    } else {
        results.critical.push('❌ CRITICAL: .env files NOT in .gitignore');
    }

    if (gitignore.includes('*.env')) {
        results.passed.push('✅ All .env variants are gitignored');
    }
} else {
    results.warnings.push('⚠️ No .gitignore file found');
}

// 2. Check for hardcoded secrets in code
console.log('🔍 Checking for hardcoded secrets...');
const suspiciousPatterns = [
    { pattern: /mongodb\+srv:\/\/[^:]+:[^@]+@/gi, name: 'MongoDB connection string' },
    { pattern: /rzp_(test|live)_[A-Za-z0-9]{14}/gi, name: 'Razorpay key' },
    { pattern: /sk_test_[A-Za-z0-9]{24}/gi, name: 'Stripe key' },
    { pattern: /AIza[0-9A-Za-z\\-_]{35}/gi, name: 'Google API key' }
];

function scanDirectory(dir, exclude = ['node_modules', '.git', 'dist', 'build']) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !exclude.includes(file)) {
            scanDirectory(filePath, exclude);
        } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))) {
            const content = fs.readFileSync(filePath, 'utf8');

            suspiciousPatterns.forEach(({ pattern, name }) => {
                if (pattern.test(content)) {
                    results.critical.push(`❌ CRITICAL: Possible hardcoded ${name} in ${filePath}`);
                }
            });
        }
    });
}

try {
    scanDirectory(path.join(rootDir, 'server'));
    scanDirectory(path.join(rootDir, 'client', 'src'));
    results.passed.push('✅ No obvious hardcoded secrets found in source code');
} catch (error) {
    results.warnings.push(`⚠️ Could not scan all files: ${error.message}`);
}

// 3. Check server.js security configuration
console.log('🔍 Checking server.js security configuration...');
const serverJsPath = path.join(rootDir, 'server', 'server.js');

if (fs.existsSync(serverJsPath)) {
    const serverJs = fs.readFileSync(serverJsPath, 'utf8');

    if (serverJs.includes('helmet')) {
        results.passed.push('✅ Helmet.js is configured');
    } else {
        results.critical.push('❌ CRITICAL: Helmet.js not found');
    }

    if (serverJs.includes('rateLimit') || serverJs.includes('express-rate-limit')) {
        results.passed.push('✅ Rate limiting is configured');
    } else {
        results.warnings.push('⚠️ Rate limiting not found');
    }

    if (serverJs.includes('cors')) {
        results.passed.push('✅ CORS is configured');
    } else {
        results.critical.push('❌ CRITICAL: CORS not configured');
    }

    // Check for environment validation
    if (serverJs.includes('requiredEnvVars') || serverJs.includes('Missing required environment')) {
        results.passed.push('✅ Environment variable validation present');
    } else {
        results.warnings.push('⚠️ No environment variable validation found');
    }
} else {
    results.critical.push('❌ CRITICAL: server.js not found');
}

// 4. Check for JWT secret validation
console.log('🔍 Checking JWT configuration...');
if (fs.existsSync(serverJsPath)) {
    const serverJs = fs.readFileSync(serverJsPath, 'utf8');

    if (serverJs.includes('JWT_SECRET') && serverJs.includes('length')) {
        results.passed.push('✅ JWT secret length validation present');
    } else {
        results.warnings.push('⚠️ No JWT secret strength validation');
    }
}

// 5. Check package.json for security
console.log('🔍 Checking package.json...');
const serverPackagePath = path.join(rootDir, 'server', 'package.json');

if (fs.existsSync(serverPackagePath)) {
    const pkg = JSON.parse(fs.readFileSync(serverPackagePath, 'utf8'));

    const securityPackages = ['helmet', 'express-rate-limit', 'express-validator'];
    securityPackages.forEach(pkgName => {
        if (pkg.dependencies && pkg.dependencies[pkgName]) {
            results.passed.push(`✅ ${pkgName} is installed`);
        } else {
            results.warnings.push(`⚠️ ${pkgName} not found in dependencies`);
        }
    });
}

// 6. Check for console.log with sensitive data
console.log('🔍 Checking for sensitive data logging...');
function checkSensitiveLogging(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(file)) {
            checkSensitiveLogging(filePath);
        } else if (stat.isFile() && file.endsWith('.js')) {
            const content = fs.readFileSync(filePath, 'utf8');

            if (content.match(/console\.log.*password/i)) {
                results.warnings.push(`⚠️ Possible password logging in ${filePath}`);
            }
            if (content.match(/console\.log.*token/i)) {
                results.warnings.push(`⚠️ Possible token logging in ${filePath}`);
            }
        }
    });
}

try {
    checkSensitiveLogging(path.join(rootDir, 'server'));
    results.info.push('ℹ️ Sensitive data logging check completed');
} catch (error) {
    results.warnings.push(`⚠️ Could not complete logging check: ${error.message}`);
}

// 7. Check API versioning
console.log('🔍 Checking API versioning...');
if (fs.existsSync(serverJsPath)) {
    const serverJs = fs.readFileSync(serverJsPath, 'utf8');

    if (serverJs.includes('/api/v1')) {
        results.passed.push('✅ API versioning implemented (/api/v1)');
    } else {
        results.warnings.push('⚠️ No API versioning found');
    }
}

// 8. Check for error handling
console.log('🔍 Checking error handling...');
if (fs.existsSync(serverJsPath)) {
    const serverJs = fs.readFileSync(serverJsPath, 'utf8');

    if (serverJs.includes('app.use((err, req, res, next)')) {
        results.passed.push('✅ Global error handler configured');
    } else {
        results.warnings.push('⚠️ No global error handler found');
    }
}

// Generate Report
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                  SECURITY AUDIT RESULTS                    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`✅ PASSED: ${results.passed.length}`);
console.log(`❌ CRITICAL: ${results.critical.length}`);
console.log(`⚠️  WARNINGS: ${results.warnings.length}`);
console.log(`ℹ️  INFO: ${results.info.length}\n`);

if (results.passed.length > 0) {
    console.log('✅ PASSED CHECKS:');
    results.passed.forEach(msg => console.log(`   ${msg}`));
    console.log('');
}

if (results.critical.length > 0) {
    console.log('❌ CRITICAL ISSUES:');
    results.critical.forEach(msg => console.log(`   ${msg}`));
    console.log('');
}

if (results.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    results.warnings.forEach(msg => console.log(`   ${msg}`));
    console.log('');
}

if (results.info.length > 0) {
    console.log('ℹ️  INFORMATION:');
    results.info.forEach(msg => console.log(`   ${msg}`));
    console.log('');
}

// Final verdict
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                    SECURITY VERDICT                        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

if (results.critical.length > 0) {
    console.log('🔴 SECURITY STATUS: CRITICAL ISSUES FOUND');
    console.log('   Fix critical issues before deployment.\n');
    process.exit(1);
} else if (results.warnings.length > 3) {
    console.log('⚠️  SECURITY STATUS: MULTIPLE WARNINGS');
    console.log('   Review warnings before deployment.\n');
    process.exit(0);
} else {
    console.log('✅ SECURITY STATUS: ACCEPTABLE');
    console.log('   Basic security measures in place.\n');
    process.exit(0);
}
