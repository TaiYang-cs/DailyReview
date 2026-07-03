// ============================================================
// MarkdownRenderer —— 轻量 Markdown 渲染组件
// 功能：把复盘内容（Markdown 纯文本）渲染成带样式的 HTML 结构
//       覆盖日常复盘常用的语法：标题、列表、任务列表、引用、
//       代码块、行内代码、粗体、斜体、链接、分割线、段落
//
// 使用方式：
//   <MarkdownRenderer content={"## 标题\n- 列表项"} />
//
// 说明：
//   1. 这是纯展示组件（服务端组件），不需要 "use client"。
//   2. 零依赖：不引入 react-markdown 等第三方库，避免改 package.json
//      （package.json 由成员T维护），只实现日常复盘需要的常用语法。
//   3. 不做原始 HTML 注入，所有节点都用 JSX 渲染，避免 XSS。
// ============================================================

import { type ReactNode } from "react";

type MarkdownRendererProps = {
  content: string; // Markdown 原文
};

// ------------------------------------------------------------
// 行内解析：把一行文本里的「粗体/斜体/行内代码/链接」拆成 JSX 节点
//   处理顺序很重要：先摘出行内代码（里面不再解析其他语法），
//   再处理链接，最后处理粗体和斜体。
// ------------------------------------------------------------

// 用占位符把行内代码的内容暂存起来，避免被后面的粗体/斜体规则误伤
const CODE_PLACEHOLDER = (i: number) => `\u0000CODE${i}\u0000`;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // 暂存行内代码片段
  const codeStore: ReactNode[] = [];

  // 1) 先把 `code` 摘出来，替换成占位符
  let working = text.replace(/`([^`]+)`/g, (_m, code: string) => {
    const idx = codeStore.length;
    codeStore.push(
      <code
        key={`code-${idx}`}
        className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-emerald-800"
      >
        {code}
      </code>,
    );
    return CODE_PLACEHOLDER(idx);
  });

  // 2) 把占位符之外的部分继续解析链接/粗体/斜体
  //    用正则逐段扫描，把文本切成 token
  const tokenRegex =
    /(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*]+\*)|(_[^_]+_)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = tokenRegex.exec(working)) !== null) {
    // match 之前的纯文本（可能含占位符）
    if (match.index > lastIndex) {
      nodes.push(
        ...restorePlaceholders(
          working.slice(lastIndex, match.index),
          codeStore,
          keyCounter,
        ),
      );
      keyCounter += 1;
    }

    const token = match[0];

    if (token.startsWith("[")) {
      // 链接 [text](url)
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        nodes.push(
          <a
            key={`link-${keyCounter}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800"
          >
            {linkMatch[1]}
          </a>,
        );
      }
    } else if (token.startsWith("**")) {
      // 粗体 **text**
      nodes.push(
        <strong key={`bold-${keyCounter}`} className="font-semibold text-slate-950">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("__")) {
      // 粗体 __text__
      nodes.push(
        <strong key={`bold-${keyCounter}`} className="font-semibold text-slate-950">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("*")) {
      // 斜体 *text*
      nodes.push(
        <em key={`italic-${keyCounter}`} className="italic text-slate-700">
          {token.slice(1, -1)}
        </em>,
      );
    } else if (token.startsWith("_")) {
      // 斜体 _text_
      nodes.push(
        <em key={`italic-${keyCounter}`} className="italic text-slate-700">
          {token.slice(1, -1)}
        </em>,
      );
    }

    lastIndex = tokenRegex.lastIndex;
    keyCounter += 1;
  }

  // 末尾剩余的纯文本
  if (lastIndex < working.length) {
    nodes.push(
      ...restorePlaceholders(working.slice(lastIndex), codeStore, keyCounter),
    );
  }

  return nodes;
}

// 把字符串里的占位符还原成之前暂存的 <code> 节点
function restorePlaceholders(
  text: string,
  codeStore: ReactNode[],
  baseKey: number,
): ReactNode[] {
  const parts = text.split(/\u0000CODE(\d+)\u0000/);
  const result: ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // 偶数下标是普通文本
      if (parts[i]) {
        result.push(<span key={`txt-${baseKey}-${i}`}>{parts[i]}</span>);
      }
    } else {
      // 奇数下标是占位符里的数字索引
      const idx = Number(parts[i]);
      result.push(codeStore[idx]);
    }
  }
  return result;
}

// ------------------------------------------------------------
// 块级解析：把整段 Markdown 按行扫描，归并成不同的块类型
// ------------------------------------------------------------

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "ul"; items: { text: string; checked?: boolean | null }[] }
  | { type: "ol"; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "code"; lang: string; text: string }
  | { type: "hr" };

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 空行：跳过
    if (line.trim() === "") {
      i += 1;
      continue;
    }

    // 代码块围栏 ```
    const fenceMatch = /^```(\w*)$/.exec(line.trim());
    if (fenceMatch) {
      const lang = fenceMatch[1] ?? "";
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && lines[i].trim() !== "```") {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1; // 跳过结束的 ```
      blocks.push({ type: "code", lang, text: codeLines.join("\n") });
      continue;
    }

    // 标题 # ~ ######
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      i += 1;
      continue;
    }

    // 分割线 --- / ***
    if (/^(\s*[-*]\s*){3,}$/.test(line)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    // 引用 >
    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "blockquote", text: quoteLines.join("\n") });
      continue;
    }

    // 无序列表 / 任务列表 - 或 *
    if (/^\s*[-*]\s+/.test(line)) {
      const items: { text: string; checked?: boolean | null }[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*[-*]\s+/, "");
        // 任务列表：- [ ] 或 - [x]
        const taskMatch = /^\[([ xX])\]\s+(.*)$/.exec(itemText);
        if (taskMatch) {
          const done = taskMatch[1].toLowerCase() === "x";
          items.push({ text: taskMatch[2], checked: done });
        } else {
          items.push({ text: itemText, checked: null });
        }
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // 有序列表 1. 2.
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // 普通段落：连续的非空、非特殊行合并成一段
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,6}\s+/.test(lines[i]) &&
      !/^```/.test(lines[i].trim()) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^(\s*[-*]\s*){3,}$/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: "paragraph", text: paraLines.join(" ") });
  }

  return blocks;
}

// 标题级别 → Tailwind 字号类
function headingClass(level: number): string {
  switch (level) {
    case 1:
      return "mt-6 mb-3 text-2xl font-bold text-slate-950";
    case 2:
      return "mt-5 mb-2 text-xl font-bold text-slate-950";
    case 3:
      return "mt-4 mb-2 text-lg font-semibold text-slate-900";
    case 4:
      return "mt-3 mb-1 text-base font-semibold text-slate-900";
    default:
      return "mt-3 mb-1 text-sm font-semibold text-slate-800";
  }
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const blocks = parseBlocks(content ?? "");

  return (
    <div className="space-y-3 text-sm leading-7 text-slate-700">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "heading": {
            // 根据级别用对应的标题标签，语义更清晰；样式由 headingClass 控制
            const HeadingTag = (`h${Math.min(block.level, 6)}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6");
            return (
              <HeadingTag key={idx} className={headingClass(block.level)}>
                {renderInline(block.text)}
              </HeadingTag>
            );
          }

          case "paragraph":
            return (
              <p key={idx} className="text-slate-700">
                {renderInline(block.text)}
              </p>
            );

          case "ul":
            return (
              <ul key={idx} className="list-disc space-y-1 pl-6 text-slate-700">
                {block.items.map((item, j) =>
                  item.checked === null ? (
                    <li key={j}>{renderInline(item.text)}</li>
                  ) : (
                    <li key={j} className="list-none">
                      <label className="inline-flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          readOnly
                          className="mt-1 h-4 w-4 accent-emerald-600"
                        />
                        <span
                          className={
                            item.checked
                              ? "text-slate-400 line-through"
                              : "text-slate-700"
                          }
                        >
                          {renderInline(item.text)}
                        </span>
                      </label>
                    </li>
                  ),
                )}
              </ul>
            );

          case "ol":
            return (
              <ol key={idx} className="list-decimal space-y-1 pl-6 text-slate-700">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ol>
            );

          case "blockquote":
            return (
              <blockquote
                key={idx}
                className="border-l-4 border-emerald-300 bg-emerald-50/60 py-2 pl-4 pr-2 text-slate-600"
              >
                {renderInline(block.text)}
              </blockquote>
            );

          case "code":
            return (
              <pre
                key={idx}
                className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-4"
              >
                <code className="font-mono text-[0.85em] leading-6 text-slate-100">
                  {block.text}
                </code>
              </pre>
            );

          case "hr":
            return (
              <hr
                key={idx}
                className="my-4 border-0 border-t border-slate-200"
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
