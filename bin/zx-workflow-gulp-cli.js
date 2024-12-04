#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';

// 获取命令行参数
const args = process.argv.slice(2);

// 添加必要的参数
args.push('--cwd', process.cwd());
args.push('--gulpfile', path.resolve(__dirname, '../lib/index.js'));

console.log('Final arguments:', args);

// 启动子进程来运行 Gulp
const gulpProcess = spawn('npx', ['gulp', ...args], {
  stdio: 'inherit',
});

// 监听子进程关闭事件，以便正确退出
gulpProcess.on('close', (code) => {
  process.exit(code);
});