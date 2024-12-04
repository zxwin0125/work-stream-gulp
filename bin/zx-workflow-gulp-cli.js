#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);

// 添加必要的参数
args.push('--cwd', process.cwd());
args.push('--gulpfile', require.resolve('../lib/index.js'));

// 打印最终的参数列表以供调试（可选）
// console.log('Final arguments:', args);

// 启动子进程来运行 Gulp
const gulpProcess = spawn('npx', ['gulp', ...args], {
  stdio: 'inherit', // 继承父进程的标准输入输出流
});

// 监听子进程关闭事件，以便正确退出
gulpProcess.on('close', (code) => {
  process.exit(code);
});