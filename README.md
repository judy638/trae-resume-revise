# 简历精修 Skill（resume-revise）

资深 HR 视角的价值导向简历精修工具。输入"全量经历 + 目标岗位"，输出"ATS 友好的 PDF 简历 + 独立求职策略建议书"。

## 功能特点

- **价值导向改写**：拒绝流水账，每条经历突出"做了什么→怎么做的→结果如何→影响多大"
- **数据优先**：量化成果前置展示，无数据则显性化业务影响
- **岗位匹配**：经历顺序和详略由岗位需求驱动
- **ATS 友好**：PDF 文字可选可解析，关键信息用文本而非图片
- **主动挖掘**：通过集中追问挖掘用户易遗漏的工作成果细节
- **双轨交付**：PDF 简历 + HTML 求职策略建议书（含匹配度分析、面试准备、薪资谈判、风险避雷）

## 安装方法

### 方式一：直接复制（推荐）

1. 下载本仓库到本地
2. 将整个 `resume-revise` 文件夹复制到你的 TRAE skills 目录：

```bash
# macOS/Linux
cp -r resume-revise ~/.trae/skills/

# Windows (PowerShell)
Copy-Item -Recurse resume-revise $env:USERPROFILE\.trae\skills\
```

3. 安装依赖：

```bash
cd ~/.trae/skills/resume-revise
npm install
```

> 首次使用需安装 Playwright 浏览器：
> ```bash
> npx playwright install chromium
> ```

### 方式二：Git 克隆

```bash
git clone <你的仓库地址> ~/.trae/skills/resume-revise
cd ~/.trae/skills/resume-revise
npm install
npx playwright install chromium
```

## 使用方法

在 TRAE 中输入触发词即可调用：

- `改简历`
- `帮我改简历`
- `优化简历`
- `简历润色`
- `投递前简历调整`

### 使用流程

1. **上传头像**（可选）：提供 jpg/png 格式头像
2. **上传全量经历**：粘贴所有工作经历（越全越好）
3. **上传目标岗位**：粘贴 BOSS/招聘网站的岗位详情
4. **回答追问**：AI 会提出 3-5 个深度问题挖掘遗漏的成果细节
5. **获取交付物**：
   - PDF 简历（可直接投递）
   - HTML 求职策略建议书（含匹配度分析、面试准备、薪资谈判）

## 目录结构

```
resume-revise/
├── SKILL.md                          # 技能入口文件
├── README.md                         # 本文件
├── package.json                      # 依赖配置
├── references/                       # 参考文档
│   ├── value-audit-checklist.md      # 6维价值审计清单
│   ├── rewrite-patterns.md           # 价值导向改写模式库
│   ├── ats-compliance.md             # ATS合规规范
│   └── job-match-rules.md            # 岗位关键词匹配规则
├── templates/                        # HTML模板
│   ├── resume-template.html          # 简历模板
│   └── advice-template.html          # 求职建议书模板
├── scripts/
│   └── generate-pdf.js               # PDF生成脚本（Playwright）
└── output/                           # 输出目录（运行时生成）
```

## 依赖要求

- Node.js >= 16
- Playwright >= 1.40.0
- Chromium 浏览器（Playwright 自动安装）

## 触发词

`改简历`、`修改简历`、`优化简历`、`简历润色`、`帮我改简历`、`投递前简历调整`

## 许可证

MIT
