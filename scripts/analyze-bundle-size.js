/**
 * Bundle Size Analysis Script
 * Analyzes the React Native bundle size and provides insights
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  PLATFORMS: ['android', 'ios'],
  BUNDLE_CONFIGS: {
    DEV: { dev: true, minify: false },
    PRODUCTION: { dev: false, minify: true },
  },
  SIZE_LIMITS: {
    WARNING_MB: 5,   // Warn if bundle > 5MB
    ERROR_MB: 10,    // Error if bundle > 10MB
  },
};

// Utility functions
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    console.warn(`Could not read file size for ${filePath}:`, error.message);
    return 0;
  }
};

const createBundle = (platform, config) => {
  const { dev, minify } = config;
  const configName = dev ? 'dev' : 'prod';
  const bundleFileName = `${platform}-${configName}-bundle.js`;
  const assetsDir = `${platform}-${configName}-assets`;
  
  console.log(`Creating ${platform} ${configName} bundle...`);
  
  try {
    const command = [
      'npx react-native bundle',
      `--platform ${platform}`,
      `--dev ${dev}`,
      `--minify ${minify}`,
      '--entry-file index.js',
      `--bundle-output ${bundleFileName}`,
      `--assets-dest ${assetsDir}/`,
      '--verbose',
    ].join(' ');
    
    execSync(command, { stdio: 'pipe' });
    
    const bundleSize = getFileSize(bundleFileName);
    console.log(`✅ ${platform} ${configName} bundle created: ${formatBytes(bundleSize)}`);
    
    return {
      platform,
      config: configName,
      bundleFile: bundleFileName,
      assetsDir,
      bundleSize,
    };
  } catch (error) {
    console.error(`❌ Failed to create ${platform} ${configName} bundle:`, error.message);
    return null;
  }
};

const analyzeBundleComposition = (bundleFile) => {
  console.log(`\nAnalyzing bundle composition for ${bundleFile}...`);
  
  try {
    const bundleContent = fs.readFileSync(bundleFile, 'utf8');
    
    // Basic analysis
    const analysis = {
      totalLines: bundleContent.split('\n').length,
      totalCharacters: bundleContent.length,
      estimatedModules: (bundleContent.match(/\/\*\*\/ function/g) || []).length,
      reactNativeCode: bundleContent.includes('react-native'),
      thirdPartyLibraries: [],
    };
    
    // Detect common libraries
    const libraries = [
      'react', 'react-native', 'axios', 'lodash', 'moment',
      'react-navigation', 'react-native-vector-icons', 'crypto-js'
    ];
    
    libraries.forEach(lib => {
      if (bundleContent.includes(lib)) {
        analysis.thirdPartyLibraries.push(lib);
      }
    });
    
    console.log(`📊 Bundle Analysis:`);
    console.log(`  - Total lines: ${analysis.totalLines.toLocaleString()}`);
    console.log(`  - Total characters: ${analysis.totalCharacters.toLocaleString()}`);
    console.log(`  - Estimated modules: ${analysis.estimatedModules}`);
    console.log(`  - Libraries detected: ${analysis.thirdPartyLibraries.join(', ')}`);
    
    return analysis;
  } catch (error) {
    console.error(`❌ Failed to analyze bundle composition:`, error.message);
    return null;
  }
};

const checkBundleSize = (bundleSize, fileName) => {
  const sizeMB = bundleSize / (1024 * 1024);
  
  if (sizeMB > CONFIG.SIZE_LIMITS.ERROR_MB) {
    console.error(`🚨 ERROR: Bundle ${fileName} is too large (${formatBytes(bundleSize)})! Consider code splitting.`);
    return 'error';
  } else if (sizeMB > CONFIG.SIZE_LIMITS.WARNING_MB) {
    console.warn(`⚠️  WARNING: Bundle ${fileName} is large (${formatBytes(bundleSize)}). Monitor bundle size.`);
    return 'warning';
  } else {
    console.log(`✅ Bundle ${fileName} size is acceptable (${formatBytes(bundleSize)})`);
    return 'ok';
  }
};

const generateReport = (results) => {
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      totalBundles: results.length,
      largestBundle: null,
      smallestBundle: null,
      averageSize: 0,
    },
  };
  
  if (results.length > 0) {
    const validResults = results.filter(r => r !== null);
    const sizes = validResults.map(r => r.bundleSize);
    
    report.summary.largestBundle = validResults.find(r => r.bundleSize === Math.max(...sizes));
    report.summary.smallestBundle = validResults.find(r => r.bundleSize === Math.min(...sizes));
    report.summary.averageSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
  }
  
  // Write report to file
  const reportPath = 'bundle-analysis-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📋 Full report saved to: ${reportPath}`);
  
  return report;
};

const printSummary = (report) => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 BUNDLE ANALYSIS SUMMARY');
  console.log('='.repeat(60));
  
  if (report.summary.totalBundles === 0) {
    console.log('❌ No bundles were successfully created.');
    return;
  }
  
  console.log(`📅 Analysis Date: ${new Date(report.timestamp).toLocaleString()}`);
  console.log(`📦 Total Bundles Analyzed: ${report.summary.totalBundles}`);
  
  if (report.summary.largestBundle) {
    console.log(`🔍 Largest Bundle: ${report.summary.largestBundle.platform} ${report.summary.largestBundle.config} (${formatBytes(report.summary.largestBundle.bundleSize)})`);
  }
  
  if (report.summary.smallestBundle) {
    console.log(`🔍 Smallest Bundle: ${report.summary.smallestBundle.platform} ${report.summary.smallestBundle.config} (${formatBytes(report.summary.smallestBundle.bundleSize)})`);
  }
  
  if (report.summary.averageSize > 0) {
    console.log(`📊 Average Bundle Size: ${formatBytes(report.summary.averageSize)}`);
  }
  
  console.log('\n🔧 Optimization Recommendations:');
  console.log('1. Use React.lazy() for code splitting');
  console.log('2. Remove unused dependencies');
  console.log('3. Enable ProGuard/R8 for Android builds');
  console.log('4. Use tree-shaking compatible libraries');
  console.log('5. Analyze bundle with source-map-explorer');
  
  console.log('\n' + '='.repeat(60));
};

const cleanup = (results) => {
  console.log('\n🧹 Cleaning up temporary files...');
  
  results.forEach(result => {
    if (result) {
      try {
        if (fs.existsSync(result.bundleFile)) {
          fs.unlinkSync(result.bundleFile);
          console.log(`🗑️  Removed: ${result.bundleFile}`);
        }
        
        if (fs.existsSync(result.assetsDir)) {
          fs.rmSync(result.assetsDir, { recursive: true, force: true });
          console.log(`🗑️  Removed: ${result.assetsDir}/`);
        }
      } catch (error) {
        console.warn(`⚠️  Could not clean up files for ${result.platform}:`, error.message);
      }
    }
  });
};

// Main execution
const main = () => {
  console.log('🚀 Starting React Native Bundle Analysis...\n');
  
  const results = [];
  
  // Create bundles for each platform and configuration
  for (const platform of CONFIG.PLATFORMS) {
    for (const [configName, config] of Object.entries(CONFIG.BUNDLE_CONFIGS)) {
      const result = createBundle(platform, config);
      if (result) {
        // Check bundle size
        const sizeCheck = checkBundleSize(result.bundleSize, result.bundleFile);
        result.sizeCheck = sizeCheck;
        
        // Analyze bundle composition (only for production bundles to save time)
        if (!config.dev) {
          result.analysis = analyzeBundleComposition(result.bundleFile);
        }
      }
      results.push(result);
    }
  }
  
  // Generate and display report
  const report = generateReport(results);
  printSummary(report);
  
  // Cleanup temporary files
  cleanup(results);
  
  // Exit with appropriate code
  const hasErrors = results.some(r => r?.sizeCheck === 'error');
  process.exit(hasErrors ? 1 : 0);
};

// Run the analysis
if (require.main === module) {
  main();
}

module.exports = {
  createBundle,
  analyzeBundleComposition,
  checkBundleSize,
  generateReport,
  formatBytes,
};
