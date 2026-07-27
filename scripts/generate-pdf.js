#!/usr/bin/env node
/**
 * 简历 PDF 生成脚本
 * 用法: node scripts/generate-pdf.js <html-file-path> <output-pdf-path>
 * 
 * 示例:
 *   node scripts/generate-pdf.js ./resume.html ./output/resume.pdf
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function generatePDF(htmlPath, outputPath) {
  // 参数校验
  if (!htmlPath || !outputPath) {
    console.error('用法: node scripts/generate-pdf.js <html-file-path> <output-pdf-path>');
    process.exit(1);
  }

  if (!fs.existsSync(htmlPath)) {
    console.error(`错误: HTML 文件不存在: ${htmlPath}`);
    process.exit(1);
  }

  // 确保输出目录存在
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let browser;
  try {
    // 启动浏览器
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // 读取 HTML 文件内容
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    // 设置页面内容（使用 setContent 确保 base64 图片等资源正确加载）
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待字体加载完成
    await page.evaluateHandle('document.fonts.ready');

    // 生成 PDF（margin 设为 0，间距由 HTML 模板 @page 和 body padding 控制）
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        bottom: '0',
        left: '0',
        right: '0'
      },
      displayHeaderFooter: false,
      preferCSSPageSize: true
      // scale 已移除，避免产生空白
    });

    console.log(`✅ PDF 生成成功: ${outputPath}`);
    console.log(`📄 文件大小: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);

    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ PDF 生成失败:', error.message);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

// 从命令行参数获取路径
const htmlPath = process.argv[2];
const outputPath = process.argv[3];

generatePDF(htmlPath, outputPath);
