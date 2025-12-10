/**
 * Theme Screen Fix Script
 * 
 * This script identifies screens that need theme updates and provides
 * guidance on fixing them.
 */

const fs = require('fs');
const path = require('path');

// Screens that need theme implementation (based on grep results)
const SCREENS_TO_FIX = [
  'src/screens/main/DashboardScreenModern.tsx',
  'src/screens/main/ProfileScreen.tsx', 
  'src/screens/main/NotificationsScreen.tsx',
  'src/screens/auth/ForgotPasswordScreen.tsx',
  'src/screens/car/CarDetailsScreen.tsx',
  'src/screens/car/SellCarScreen.tsx',
  'src/screens/car/VehicleDetailScreen.tsx',
  'src/screens/chat/ChatScreen.tsx',
  'src/screens/chat/ChatListScreen.tsx',
];

// Template for theme implementation
const THEME_TEMPLATE = `
// Import theme
import { useTheme } from '../../theme';

// Inside component function
const { theme, isDark } = useTheme();
const { colors } = theme;

// Replace hardcoded colors with theme colors
// Example:
// backgroundColor: colors.background,
// color: colors.text,
// borderColor: colors.border,
`;

// Issues to look for and fix
const ISSUES_TO_FIX = [
  {
    pattern: /const colors = \{[^}]+\}/g,
    fix: 'Replace with theme colors using useTheme hook'
  },
  {
    pattern: /const isDark = false/g,
    fix: 'Replace with theme.isDark from useTheme hook'
  },
  {
    pattern: /#[0-9A-Fa-f]{6}/g,
    fix: 'Replace hardcoded hex colors with theme color tokens'
  },
  {
    pattern: /backgroundColor:\s*['"][^'"]+['"]/g,
    fix: 'Use colors.background, colors.surface, etc.'
  },
  {
    pattern: /color:\s*['"][^'"]+['"]/g,
    fix: 'Use colors.text, colors.textSecondary, etc.'
  },
];

function analyzeScreen(filePath) {
  const fullPath = path.resolve(filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  console.log(`\n🔍 Analyzing: ${filePath}`);
  
  let hasIssues = false;
  
  // Check if already using theme
  if (content.includes('useTheme')) {
    console.log(`✅ Already using theme context`);
    return;
  }
  
  // Check for issues
  ISSUES_TO_FIX.forEach(({ pattern, fix }) => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      hasIssues = true;
      console.log(`⚠️  Found ${matches.length} occurrences of pattern: ${pattern.source}`);
      console.log(`   Fix: ${fix}`);
    }
  });
  
  if (!hasIssues) {
    console.log(`✅ No obvious theme issues found`);
  } else {
    console.log(`\n📝 To fix this screen:`);
    console.log(`1. Add theme import: import { useTheme } from '../../theme';`);
    console.log(`2. Use theme hook: const { theme, isDark } = useTheme();`);
    console.log(`3. Replace hardcoded colors with theme.colors`);
    console.log(`4. Update StatusBar to use isDark for barStyle`);
  }
}

function main() {
  console.log('🎨 Theme Screen Analysis Tool');
  console.log('================================\n');
  
  SCREENS_TO_FIX.forEach(analyzeScreen);
  
  console.log('\n\n📊 Summary:');
  console.log('==========');
  console.log(`Total screens analyzed: ${SCREENS_TO_FIX.length}`);
  console.log('\n🔧 Next Steps:');
  console.log('1. Fix screens one by one using the guidance above');
  console.log('2. Test theme switching in each screen');
  console.log('3. Ensure all UI components use theme colors');
  console.log('4. Update StatusBar configurations');
}

if (require.main === module) {
  main();
}

module.exports = { SCREENS_TO_FIX, ISSUES_TO_FIX, analyzeScreen };
