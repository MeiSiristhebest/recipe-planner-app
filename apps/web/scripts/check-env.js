/**
 * 环境变量检查脚本
 * 用于检查关键环境变量是否正确配置
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 检查根目录和web目录的.env文件
const rootEnvPath = path.join(__dirname, '../../../.env');
const webEnvPath = path.join(__dirname, '../.env');

// 需要检查的关键环境变量
const requiredVars = [
  { name: 'DATABASE_URL', message: '数据库连接URL' },
  { name: 'NEXTAUTH_URL', message: 'NextAuth URL (通常是应用的URL，如 http://localhost:3000)' },
  { name: 'NEXTAUTH_SECRET', message: 'NextAuth 密钥 (用于加密会话)' },
];

// 读取环境变量
function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};

  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      
      // 移除引号
      if (value.length > 0 && (value[0] === '"' || value[0] === "'") && value[0] === value[value.length - 1]) {
        value = value.substring(1, value.length - 1);
      }
      
      vars[key] = value;
    }
  });

  return vars;
}

// 生成随机密钥
function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

// 主函数
function checkEnv() {
  console.log('检查环境变量配置...');
  
  const rootEnv = readEnvFile(rootEnvPath);
  const webEnv = readEnvFile(webEnvPath);
  const env = { ...rootEnv, ...webEnv, ...process.env };
  
  let missingVars = [];
  
  requiredVars.forEach(({ name, message }) => {
    if (!env[name]) {
      missingVars.push({ name, message });
    }
  });
  
  if (missingVars.length > 0) {
    console.log('\n⚠️ 缺少以下环境变量:');
    missingVars.forEach(({ name, message }) => {
      console.log(`  - ${name}: ${message}`);
    });
    
    console.log('\n请在.env文件中添加这些变量。示例:');
    
    if (missingVars.some(v => v.name === 'DATABASE_URL')) {
      console.log('DATABASE_URL="postgresql://username:password@localhost:5432/recipe_planner"');
    }
    
    if (missingVars.some(v => v.name === 'NEXTAUTH_URL')) {
      console.log('NEXTAUTH_URL="http://localhost:3000"');
    }
    
    if (missingVars.some(v => v.name === 'NEXTAUTH_SECRET')) {
      const secret = generateSecret();
      console.log(`NEXTAUTH_SECRET="${secret}"`);
      console.log('\n您可以使用上面生成的随机密钥作为NEXTAUTH_SECRET。');
    }
    
    console.log('\n请确保这些变量在开发和生产环境中都已正确配置。');
  } else {
    console.log('✅ 所有必需的环境变量都已配置。');
  }
  
  // 检查NEXTAUTH_SECRET的长度
  if (env.NEXTAUTH_SECRET && env.NEXTAUTH_SECRET.length < 32) {
    console.log('\n⚠️ 警告: NEXTAUTH_SECRET 似乎太短，可能不安全。');
    console.log('建议使用至少32个字符的随机字符串。您可以使用以下生成的密钥:');
    console.log(`NEXTAUTH_SECRET="${generateSecret()}"`);
  }
  
  console.log('\n环境变量检查完成。');
}

// 执行检查
checkEnv();
