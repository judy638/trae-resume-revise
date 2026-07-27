const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, VerticalAlign
} = require('docx');
const fs = require('fs');

// === 通用配置 ===
const A4_WIDTH = 11906;
const A4_HEIGHT = 16838;
const CJK_FONT = { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" };

// === 颜色配置（按模板） ===
const COLORS = {
  classic: {
    primary: "2563EB", secondary: "555555", accent: "2563EB",
    dark: "1A1A1A", light: "E5E7EB"
  },
  modern: {
    primary: "1F2937", secondary: "6B7280", accent: "059669",
    dark: "1F2937", light: "E5E7EB"
  },
  creative: {
    primary: "1E293B", secondary: "64748B", accent: "1E293B",
    dark: "1E293B", light: "F1F5F9"
  }
};

// === 通用工具函数 ===

/**
 * 创建文本片段
 */
function makeText(text, options = {}) {
  const {
    bold = false, size = 20, color = "000000",
    italics = false, shading = null
  } = options;
  const runOptions = {
    text: String(text),
    bold,
    italics,
    size,
    color,
    font: CJK_FONT
  };
  if (shading) {
    runOptions.shading = {
      type: ShadingType.CLEAR,
      fill: shading
    };
  }
  return new TextRun(runOptions);
}

/**
 * 创建标题段落（带装饰符号）
 */
function makeHeading(text, color, symbol, borderBottom) {
  const children = [
    makeText(symbol + " ", { size: 26, color, bold: true }),
    makeText(text, { size: 26, color, bold: true })
  ];
  const paraOptions = {
    children,
    spacing: { before: 240, after: 120 }
  };
  if (borderBottom) {
    paraOptions.border = {
      bottom: {
        color: "D1D5DB",
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6
      }
    };
  }
  return new Paragraph(paraOptions);
}

/**
 * 创建 bullet 段落
 */
function makeBullet(text, numberingRef, spacing = {}) {
  return new Paragraph({
    children: [makeText(text, { size: 20, color: "333333" })],
    numbering: {
      reference: numberingRef,
      level: 0
    },
    spacing: { after: 60, ...spacing }
  });
}

/**
 * 创建联系信息行（用 · 分隔）
 */
function renderContactsLine(contacts, color) {
  const parts = [];
  if (contacts.phone) parts.push(contacts.phone);
  if (contacts.email) parts.push(contacts.email);
  if (contacts.location) parts.push(contacts.location);
  const text = parts.join(" · ");
  return new Paragraph({
    children: [makeText(text, { size: 20, color })],
    spacing: { after: 120 }
  });
}

/**
 * 渲染教育背景条目
 */
function renderEducationItem(edu, colors) {
  const lines = [];
  // 学校名 + 日期
  lines.push(new Paragraph({
    children: [
      makeText(edu.school, { size: 22, bold: true, color: colors.dark }),
      new TextRun({ text: "\t", font: CJK_FONT }),
      makeText(edu.date || "", { size: 20, color: colors.secondary })
    ],
    spacing: { before: 80, after: 40 },
    tabStops: [{
      type: "right",
      position: 8926,
      leader: "none"
    }]
  }));

  lines.push(new Paragraph({
    children: [makeText(edu.degree, { size: 20, color: "333333" })],
    spacing: { after: 40 }
  }));

  if (edu.detail) {
    lines.push(new Paragraph({
      children: [makeText(edu.detail, { size: 20, color: colors.secondary })],
      spacing: { after: 80 }
    }));
  }

  return lines;
}

/**
 * 渲染工作经历条目（classic / modern）
 */
function renderExperienceItem(exp, index, colors, numberingRef, options = {}) {
  const { withIndex = false, tabPosition = 8926 } = options;
  const dateStr = exp.date || "";

  const companyLine = new Paragraph({
    children: [
      ...(withIndex ? [
        makeText(String(index + 1), { size: 28, color: "93C5FD", italics: true }),
        makeText("  ", { size: 24 })
      ] : []),
      makeText(exp.company, { size: 24, bold: true, color: colors.dark }),
      new TextRun({ text: "\t", font: CJK_FONT }),
      makeText(dateStr, { size: 20, color: colors.secondary })
    ],
    spacing: { before: 120, after: 40 },
    tabStops: [{
      type: "right",
      position: tabPosition,
      leader: "none"
    }]
  });

  const positionLine = new Paragraph({
    children: [makeText(exp.position, { size: 22, color: colors.accent })],
    spacing: { after: 60 }
  });

  const result = [companyLine, positionLine];

  if (exp.bullets && exp.bullets.length > 0) {
    for (const bullet of exp.bullets) {
      result.push(makeBullet(bullet, numberingRef));
    }
  }

  return result;
}

// === Classic 模板 ===
function renderClassic(data) {
  const colors = COLORS.classic;
  const numberingRef = "bullet-classic";
  const children = [];

  // 头部：姓名 + 求职意向 + 联系信息
  children.push(new Paragraph({
    children: [makeText(data.name, { size: 64, bold: true, color: colors.primary })],
    spacing: { after: 60 }
  }));

  if (data.jobIntention) {
    children.push(new Paragraph({
      children: [makeText(data.jobIntention, { size: 22, color: colors.secondary })],
      spacing: { after: 80 }
    }));
  }

  if (data.contacts) {
    children.push(renderContactsLine(data.contacts, colors.secondary));
  }

  // 个人优势
  if (data.summary && data.summary.length > 0) {
    children.push(makeHeading("个人优势", colors.primary, "■", true));
    for (const item of data.summary) {
      children.push(makeBullet(item, numberingRef));
    }
  }

  // 工作经历
  if (data.experiences && data.experiences.length > 0) {
    children.push(makeHeading("工作经历", colors.primary, "■", true));
    data.experiences.forEach((exp, idx) => {
      const items = renderExperienceItem(exp, idx, colors, numberingRef, {
        withIndex: true,
        tabPosition: 8926
      });
      children.push(...items);
    });
  }

  // 项目经历
  if (data.projects && data.projects.length > 0) {
    children.push(makeHeading("项目经历", colors.primary, "■", true));
    data.projects.forEach((proj, idx) => {
      const items = renderExperienceItem(proj, idx, colors, numberingRef, {
        withIndex: true,
        tabPosition: 8926
      });
      children.push(...items);
    });
  }

  // 教育背景
  if (data.education && data.education.length > 0) {
    children.push(makeHeading("教育背景", colors.primary, "■", true));
    for (const edu of data.education) {
      children.push(...renderEducationItem(edu, colors));
    }
  }

  // 技能
  if (data.skills) {
    children.push(makeHeading("技能", colors.primary, "■", true));
    for (const [key, value] of Object.entries(data.skills)) {
      children.push(new Paragraph({
        children: [
          makeText(key + "：", { size: 20, bold: true, color: colors.dark }),
          makeText(value, { size: 20, color: "333333" })
        ],
        spacing: { after: 60 }
      }));
    }
  }

  return children;
}

// === Modern 模板 ===
function renderModern(data) {
  const colors = COLORS.modern;
  const numberingRef = "bullet-modern";
  const children = [];

  // 头部：姓名
  children.push(new Paragraph({
    children: [makeText(data.name, { size: 64, bold: true, color: colors.dark })],
    spacing: { after: 60 }
  }));

  // 2pt 绿色横线
  children.push(new Paragraph({
    children: [],
    border: {
      bottom: {
        color: colors.accent,
        space: 1,
        style: BorderStyle.SINGLE,
        size: 16
      }
    },
    spacing: { after: 120 }
  }));

  // 联系信息（一行，用 · 分隔）
  if (data.contacts) {
    children.push(renderContactsLine(data.contacts, colors.secondary));
  }

  // 求职意向
  if (data.jobIntention) {
    children.push(new Paragraph({
      children: [makeText("求职意向：" + data.jobIntention, { size: 20, color: colors.secondary })],
      spacing: { after: 120 }
    }));
  }

  // 个人优势
  if (data.summary && data.summary.length > 0) {
    children.push(makeHeading("个人优势", colors.accent, "—", false));
    for (const item of data.summary) {
      children.push(makeBullet(item, numberingRef));
    }
  }

  // 工作经历
  if (data.experiences && data.experiences.length > 0) {
    children.push(makeHeading("工作经历", colors.accent, "—", false));
    data.experiences.forEach((exp) => {
      const items = renderExperienceItem(exp, 0, colors, numberingRef, {
        withIndex: false,
        tabPosition: 8926
      });
      children.push(...items);
    });
  }

  // 项目经历
  if (data.projects && data.projects.length > 0) {
    children.push(makeHeading("项目经历", colors.accent, "—", false));
    data.projects.forEach((proj) => {
      const items = renderExperienceItem(proj, 0, colors, numberingRef, {
        withIndex: false,
        tabPosition: 8926
      });
      children.push(...items);
    });
  }

  // 教育背景
  if (data.education && data.education.length > 0) {
    children.push(makeHeading("教育背景", colors.accent, "—", false));
    for (const edu of data.education) {
      children.push(...renderEducationItem(edu, colors));
    }
  }

  // 技能
  if (data.skills) {
    children.push(makeHeading("技能", colors.accent, "—", false));
    for (const [key, value] of Object.entries(data.skills)) {
      children.push(new Paragraph({
        children: [
          makeText(key + "：", { size: 20, bold: true, color: colors.dark }),
          makeText(value, { size: 20, color: "333333" })
        ],
        spacing: { after: 60 }
      }));
    }
  }

  return children;
}

// === Creative 模板专用函数 ===
function makeCreativeHeading(text, color) {
  return new Paragraph({
    children: [
      makeText("■", { size: 28, color: "FFFFFF", shading: color }),
      makeText(" " + text, { size: 28, bold: true, color })
    ],
    spacing: { before: 240, after: 120 }
  });
}

function renderCreativeExperience(exp, colors, numberingRef) {
  const dateStr = exp.date || "";
  const tabPosition = 7000;

  const companyLine = new Paragraph({
    children: [
      makeText(exp.company, { size: 24, bold: true, color: colors.dark }),
      new TextRun({ text: "\t", font: CJK_FONT }),
      makeText(dateStr, { size: 20, color: colors.secondary })
    ],
    spacing: { before: 120, after: 40 },
    tabStops: [{
      type: "right",
      position: tabPosition,
      leader: "none"
    }]
  });

  // 职位名标签样式：背景色方块 + 白色文字
  const positionLine = new Paragraph({
    children: [
      makeText(" " + exp.position + " ", {
        size: 22,
        color: "FFFFFF",
        shading: colors.accent
      })
    ],
    spacing: { after: 60 }
  });

  const result = [companyLine, positionLine];

  if (exp.bullets && exp.bullets.length > 0) {
    for (const bullet of exp.bullets) {
      result.push(makeBullet(bullet, numberingRef));
    }
  }

  return result;
}

// === Creative 模板 ===
function renderCreative(data) {
  const colors = COLORS.creative;
  const numberingRef = "bullet-creative";

  // --- 左侧栏内容 ---
  const leftChildren = [];

  // 姓名
  leftChildren.push(new Paragraph({
    children: [makeText(data.name, { size: 56, bold: true, color: "FFFFFF" })],
    spacing: { after: 120 }
  }));

  // 联系信息
  if (data.contacts) {
    if (data.contacts.phone) {
      leftChildren.push(new Paragraph({
        children: [makeText("电话：" + data.contacts.phone, { size: 18, color: "CBD5E1" })],
        spacing: { after: 40 }
      }));
    }
    if (data.contacts.email) {
      leftChildren.push(new Paragraph({
        children: [makeText("邮箱：" + data.contacts.email, { size: 18, color: "CBD5E1" })],
        spacing: { after: 40 }
      }));
    }
    if (data.contacts.location) {
      leftChildren.push(new Paragraph({
        children: [makeText("地址：" + data.contacts.location, { size: 18, color: "CBD5E1" })],
        spacing: { after: 40 }
      }));
    }
  }

  // 求职意向
  if (data.jobIntention) {
    leftChildren.push(new Paragraph({
      children: [makeText(data.jobIntention, { size: 20, bold: true, color: "FFFFFF" })],
      spacing: { before: 120, after: 120 }
    }));
  }

  // 教育背景
  if (data.education && data.education.length > 0) {
    leftChildren.push(new Paragraph({
      children: [makeText("教育背景", { size: 24, bold: true, color: "FFFFFF" })],
      spacing: { before: 200, after: 80 },
      border: {
        bottom: {
          color: "475569",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 4
        }
      }
    }));
    for (const edu of data.education) {
      leftChildren.push(new Paragraph({
        children: [makeText(edu.school, { size: 20, bold: true, color: "FFFFFF" })],
        spacing: { before: 80, after: 20 }
      }));
      leftChildren.push(new Paragraph({
        children: [makeText(edu.degree, { size: 18, color: "CBD5E1" })],
        spacing: { after: 20 }
      }));
      leftChildren.push(new Paragraph({
        children: [makeText(edu.date || "", { size: 18, color: "94A3B8" })],
        spacing: { after: 60 }
      }));
      if (edu.detail) {
        leftChildren.push(new Paragraph({
          children: [makeText(edu.detail, { size: 18, color: "94A3B8" })],
          spacing: { after: 80 }
        }));
      }
    }
  }

  // 技能
  if (data.skills) {
    leftChildren.push(new Paragraph({
      children: [makeText("技能", { size: 24, bold: true, color: "FFFFFF" })],
      spacing: { before: 200, after: 80 },
      border: {
        bottom: {
          color: "475569",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 4
        }
      }
    }));
    for (const [key, value] of Object.entries(data.skills)) {
      leftChildren.push(new Paragraph({
        children: [makeText(key, { size: 20, bold: true, color: "FFFFFF" })],
        spacing: { before: 80, after: 20 }
      }));
      leftChildren.push(new Paragraph({
        children: [makeText(value, { size: 18, color: "CBD5E1" })],
        spacing: { after: 60 }
      }));
    }
  }

  // --- 右侧栏内容 ---
  const rightChildren = [];

  // 个人优势
  if (data.summary && data.summary.length > 0) {
    rightChildren.push(makeCreativeHeading("个人优势", colors.dark));
    for (const item of data.summary) {
      rightChildren.push(makeBullet(item, numberingRef));
    }
  }

  // 工作经历
  if (data.experiences && data.experiences.length > 0) {
    rightChildren.push(makeCreativeHeading("工作经历", colors.dark));
    data.experiences.forEach((exp) => {
      rightChildren.push(...renderCreativeExperience(exp, colors, numberingRef));
    });
  }

  // 项目经历
  if (data.projects && data.projects.length > 0) {
    rightChildren.push(makeCreativeHeading("项目经历", colors.dark));
    data.projects.forEach((proj) => {
      rightChildren.push(...renderCreativeExperience(proj, colors, numberingRef));
    });
  }

  // 创建双栏表格
  const table = new Table({
    width: { size: 10800, type: WidthType.DXA },
    columnWidths: [3240, 7560],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: leftChildren.length > 0 ? leftChildren : [new Paragraph({ children: [] })],
            shading: {
              type: ShadingType.CLEAR,
              fill: colors.primary
            },
            width: { size: 3240, type: WidthType.DXA },
            verticalAlign: VerticalAlign.TOP,
            margins: {
              left: 200,
              right: 200,
              top: 200,
              bottom: 200
            }
          }),
          new TableCell({
            children: rightChildren.length > 0 ? rightChildren : [new Paragraph({ children: [] })],
            width: { size: 7560, type: WidthType.DXA },
            verticalAlign: VerticalAlign.TOP,
            margins: {
              left: 200,
              right: 200,
              top: 200,
              bottom: 200
            }
          })
        ]
      })
    ]
  });

  return [table];
}

// === 主入口 ===
function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("用法：node generate-docx.js <resume-json-path> <output-docx-path> [template]");
    console.error("  template 可选值：classic（默认）、modern、creative");
    process.exit(1);
  }

  const [jsonPath, outputPath, template = "classic"] = args;
  const validTemplates = ["classic", "modern", "creative"];
  if (!validTemplates.includes(template)) {
    console.error("错误：template 必须是 classic、modern 或 creative 之一");
    process.exit(1);
  }

  let data;
  try {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    data = JSON.parse(raw);
  } catch (err) {
    console.error("读取或解析 JSON 文件失败：", err.message);
    process.exit(1);
  }

  const colors = COLORS[template];

  // 构建 numberings（三种模板各一个 bullet 配置）
  const numberings = {
    config: [
      {
        reference: "bullet-classic",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: {
              indent: { left: 720, hanging: 360 }
            },
            run: {
              color: colors.accent,
              font: CJK_FONT
            }
          }
        }]
      },
      {
        reference: "bullet-modern",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: {
              indent: { left: 720, hanging: 360 }
            },
            run: {
              color: colors.accent,
              font: CJK_FONT
            }
          }
        }]
      },
      {
        reference: "bullet-creative",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: {
              indent: { left: 720, hanging: 360 }
            },
            run: {
              color: colors.accent,
              font: CJK_FONT
            }
          }
        }]
      }
    ]
  };

  // 构建 heading styles（必须设置 keepNext: false）
  const styles = {
    paragraphStyles: [
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: {
          bold: true,
          size: 26,
          color: colors.accent,
          font: CJK_FONT
        },
        paragraph: {
          keepNext: false,
          keepLines: false,
          spacing: { before: 240, after: 120 }
        }
      }
    ]
  };

  // 根据模板渲染内容
  let children;
  if (template === "classic") {
    children = renderClassic(data);
  } else if (template === "modern") {
    children = renderModern(data);
  } else {
    children = renderCreative(data);
  }

  // 页边距配置
  const margin = template === "creative" ? 720 : 1440;

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          width: A4_WIDTH,
          height: A4_HEIGHT,
          margin: {
            top: margin,
            right: margin,
            bottom: margin,
            left: margin
          }
        }
      },
      children: children
    }],
    numbering: numberings,
    styles: styles
  });

  Packer.toBuffer(doc)
    .then((buffer) => {
      fs.writeFileSync(outputPath, buffer);
      console.log("简历已生成：", outputPath);
    })
    .catch((err) => {
      console.error("生成 docx 失败：", err.message);
      process.exit(1);
    });
}

main();
