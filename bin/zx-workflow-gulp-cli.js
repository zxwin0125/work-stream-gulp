#!/usr/bin/env node

import { spawn } from 'child_process';
import { resolve } from 'path'; // 从 path 模块导入 resolve
import { fileURLToPath } from 'url'; // 从 url 模块导入 fileURLToPath

// 获取命令行参数
const args = process.argv.slice(2);

// 获取当前文件所在的目录路径
const __dirname = resolve(fileURLToPath(import.meta.url), '..');

// 添加必要的参数
args.push('--cwd', process.cwd());
args.push('--gulpfile', resolve(__dirname, '../lib/index.js'));

// 启动子进程来运行 Gulp
const gulpProcess = spawn('npx', ['gulp', ...args], {
  stdio: 'inherit',
});

// 监听子进程关闭事件，以便正确退出
gulpProcess.on('close', (code) => {
  process.exit(code);
});