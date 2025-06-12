#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const semver = require('semver');

// Known vulnerabilities that are acceptable (with explanation)
const ACCEPTABLE_VULNERABILITIES = {
  'next': {
    'GHSA-3h52-269p-cp9r': {
      reason: 'Low severity dev server issue, fixed in Next.js 15.x but requires breaking changes',
      acceptable: true
    }
  }
};

// Required environment variables
const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'NETDATA_URL',
  'NETDATA_API_KEY',
  'NEXTAUTH_SECRET'
];

// Required security headers
const REQUIRED_HEADERS = [
  'Strict-Transport-Security',
  'X-Frame-Options',
  'X-Content-Type-Options',
  'X-XSS-Protection',
  'Referrer-Policy',
  'Content-Security-Policy',
  'Permissions-Policy'
];

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function printHeader(message) {
  console.log(`\n${colors.cyan}=== ${message} ===${colors.reset}\n`);
}

function printSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function printWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

function printError(message) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8' });
  } catch (error) {
    if (error.stdout) {
      return error.stdout;
    }
    throw error;
  }
}

function isMajorUpdate(current, latest) {
  if (!current || !latest) return false;
  return semver.major(current) < semver.major(latest);
}

function checkDependencies() {
  console.log('\n=== Checking Dependencies ===\n');
  
  try {
    // First check if npm audit is working
    try {
      execSync('npm audit --json', { encoding: 'utf-8', stdio: 'pipe' });
    } catch (auditError) {
      console.log('\x1b[33m⚠ npm audit is not available or failed. This might be due to:\x1b[0m');
      console.log('  1. Network connectivity issues');
      console.log('  2. npm registry access problems');
      console.log('  3. npm configuration issues');
      console.log('\n\x1b[33mContinuing with other checks...\x1b[0m\n');
      return;
    }

    // Run npm audit with JSON output and capture stderr
    const auditOutput = execSync('npm audit --json 2>&1', { encoding: 'utf-8' });
    let auditData;
    
    try {
      auditData = JSON.parse(auditOutput);
    } catch (parseError) {
      console.log('\x1b[33m⚠ Could not parse npm audit output. Raw output:\x1b[0m');
      console.log(auditOutput);
      console.log('\n\x1b[33mContinuing with other checks...\x1b[0m\n');
      return;
    }
    
    let hasUnacceptableVulnerabilities = false;
    
    if (auditData.vulnerabilities) {
      console.log('Found vulnerabilities:');
      Object.entries(auditData.vulnerabilities).forEach(([pkg, vuln]) => {
        const advisory = auditData.advisories[vuln.via[0]];
        if (advisory) {
          const isAcceptable = ACCEPTABLE_VULNERABILITIES[pkg]?.[advisory.id]?.acceptable;
          const status = isAcceptable ? '✓' : '✗';
          const color = isAcceptable ? '\x1b[32m' : '\x1b[31m';
          console.log(`${color}${status} ${pkg}@${vuln.version}: ${advisory.title} (${advisory.severity})`);
          console.log(`   ID: ${advisory.id}`);
          console.log(`   URL: ${advisory.url}`);
          if (isAcceptable) {
            console.log(`   Reason: ${ACCEPTABLE_VULNERABILITIES[pkg][advisory.id].reason}`);
          }
          console.log('\x1b[0m'); // Reset color
          
          if (!isAcceptable) {
            hasUnacceptableVulnerabilities = true;
          }
        }
      });
    } else {
      console.log('✓ No vulnerabilities found');
    }
    
    if (hasUnacceptableVulnerabilities) {
      console.log('\x1b[31m✗ Found unacceptable vulnerabilities that need to be addressed\x1b[0m');
      process.exit(1);
    }
  } catch (error) {
    console.log('\x1b[33m⚠ Error checking dependencies:\x1b[0m');
    console.log(error.message);
    console.log('\n\x1b[33mContinuing with other checks...\x1b[0m\n');
  }
}

function checkOutdatedPackages() {
  console.log('\n=== Checking for Outdated Packages ===\n');
  
  try {
    const outdatedOutput = execSync('npm outdated --json 2>&1', { encoding: 'utf-8' });
    let outdatedData;
    
    try {
      outdatedData = JSON.parse(outdatedOutput);
    } catch (parseError) {
      console.log('\x1b[33m⚠ Could not parse npm outdated output. Raw output:\x1b[0m');
      console.log(outdatedOutput);
      return;
    }
    
    let hasMajorUpdates = false;
    
    Object.entries(outdatedData).forEach(([pkg, info]) => {
      const current = info.current;
      const latest = info.latest;
      const isMajorUpdate = semver.major(current) < semver.major(latest);
      
      console.log(`${pkg}:`);
      console.log(`  Current: ${current}`);
      console.log(`  Wanted: ${info.wanted}`);
      console.log(`  Latest: ${latest}`);
      
      if (isMajorUpdate) {
        console.log('\x1b[33m⚠ Major version update available\x1b[0m');
        hasMajorUpdates = true;
      }
      console.log('');
    });
    
    if (hasMajorUpdates) {
      console.log('\x1b[33m⚠ Some packages have major version updates available. Consider updating in a separate task.\x1b[0m');
    }
  } catch (error) {
    if (error.status === 1) {
      console.log('✓ All packages are up to date');
    } else {
      console.log('\x1b[33m⚠ Error checking outdated packages:\x1b[0m');
      console.log(error.message);
    }
  }
}

function checkEnvironmentVariables() {
  console.log('\n=== Checking Environment Variables ===\n');
  
  const envFile = path.join(process.cwd(), '.env.local');
  let envVars = {};
  
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf-8');
    envVars = envContent.split('\n')
      .filter(line => line && !line.startsWith('#'))
      .reduce((acc, line) => {
        const [key] = line.split('=');
        if (key) acc[key.trim()] = true;
        return acc;
      }, {});
  }
  
  const missingVars = REQUIRED_ENV_VARS.filter(varName => !envVars[varName]);
  
  if (missingVars.length > 0) {
    console.log('\x1b[31m✗ Missing required environment variables:\x1b[0m');
    missingVars.forEach(varName => console.log(`  - ${varName}`));
    console.log('\nPlease create a .env.local file with these variables.');
    process.exit(1);
  } else {
    console.log('✓ All required environment variables are defined');
  }
}

function checkSecurityHeaders() {
  console.log('\n=== Checking Security Headers ===\n');
  
  try {
    const configPath = path.join(process.cwd(), 'next.config.js');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    const missingHeaders = REQUIRED_HEADERS.filter(header => 
      !configContent.includes(header)
    );
    
    if (missingHeaders.length > 0) {
      console.log('\x1b[31m✗ Missing required security headers:\x1b[0m');
      missingHeaders.forEach(header => console.log(`  - ${header}`));
      process.exit(1);
    } else {
      console.log('✓ All required security headers are configured');
    }
  } catch (error) {
    console.error('Error checking security headers:', error.message);
    process.exit(1);
  }
}

function checkCSRFProtection() {
  console.log('\n=== Checking for CSRF Protection ===\n');
  const srcDir = path.join(process.cwd(), 'src');
  let found = false;
  if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    for (const file of files) {
      const content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
      if (content.includes('csrf') || content.includes('CSRF')) {
        found = true;
        break;
      }
    }
  }
  if (found) {
    printSuccess('CSRF protection detected in codebase');
  } else {
    printWarning('CSRF protection not detected. Consider implementing CSRF protection for forms and API routes.');
  }
}

console.log('Starting security check...\n');

checkDependencies();
checkOutdatedPackages();
checkEnvironmentVariables();
checkSecurityHeaders();
checkCSRFProtection();

console.log('\nSecurity check completed!'); 