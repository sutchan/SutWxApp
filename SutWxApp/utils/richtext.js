/**
 * 文件名: richtext.js
 * 版本号: 3.0.12
 * 更新日期: 2026-09-13
 * 描述: 文章 HTML 安全清洗（供 rich-text 渲染）
 *       相比 request-security 的 sanitizeHtml（激进移除所有 src/href，用于接口字段清洗），
 *       本模块保留文章正文所需的 <img src>、<a href>，仅移除危险标签/事件属性/危险协议。
 */

// 允许保留的标签白名单（rich-text 会进一步做标签级过滤）
const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "strong", "b", "em", "i", "u", "sub", "sup",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "pre", "code",
  "img", "a", "span", "div", "section", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td",
]);

// 允许的资源协议（仅 http/https，阻断 javascript:/data: 等）
const SAFE_PROTOCOL = /^https?:\/\//i;

// 整块移除的危险标签
const BLOCK_REMOVE_TAGS = [
  "script", "iframe", "object", "embed", "style", "link", "meta", "base",
  "form", "input", "button", "textarea", "select", "option", "noscript",
  "template", "head", "body", "html", "frameset", "frame", "applet", "svg",
];

/**
 * 文章 HTML 安全清洗
 * @param {string} html 原始 HTML（通常来自 WordPress 文章正文）
 * @returns {string} 仅含白名单标签且属性安全的 HTML，可直接喂给 rich-text 的 nodes(html)
 */
function sanitizeArticleHtml(html) {
  if (!html || typeof html !== "string") return "";
  let out = html;

  // 1. 整块移除危险标签（含内容与自闭合）
  for (const tag of BLOCK_REMOVE_TAGS) {
    out = out
      .replace(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"), "")
      .replace(new RegExp(`<${tag}[^>]*\\/>`, "gi"), "");
  }

  // 2. 移除事件属性（on*）
  out = out
    .replace(/\s+on[a-z]+="[^"]*"/gi, "")
    .replace(/\s+on[a-z]+='[^']*'/gi, "")
    .replace(/\s+on[a-z]+=[^\s>]+/gi, "");

  // 3. 重写 <img>：仅保留 http(s) 的 src 与 alt
  out = out.replace(/<img([^>]*)>/gi, (m, attrs) => {
    const src = /src="([^"]*)"/i.exec(attrs);
    const alt = /alt="([^"]*)"/i.exec(attrs);
    const srcVal = src ? src[1] : "";
    if (srcVal && !SAFE_PROTOCOL.test(srcVal)) return "";
    return `<img src="${srcVal}"${alt ? ` alt="${alt[1]}"` : ""}/>`;
  });

  // 4. 重写 <a>：仅保留 http(s) 的 href，否则降级为 <span>
  out = out.replace(/<a([^>]*)>/gi, (m, attrs) => {
    const href = /href="([^"]*)"/i.exec(attrs);
    const hrefVal = href ? href[1] : "";
    if (hrefVal && SAFE_PROTOCOL.test(hrefVal)) return `<a href="${hrefVal}">`;
    return "<span>";
  });
  out = out.replace(/<\/a>/gi, "</span>");

  // 5. 移除其余不安全属性（class/style/id 等），仅保留白名单标签本身
  out = out.replace(/\s+(class|style|id|target|rel)="[^"]*"/gi, "");

  // 6. 去除白名单之外的标签（保留其内部文本）
  out = out.replace(/<(\/?)([a-zA-Z0-9]+)([^>]*)>/g, (m, close, tag) => {
    if (ALLOWED_TAGS.has(tag.toLowerCase())) return m;
    return "";
  });

  return out.trim();
}

module.exports = { sanitizeArticleHtml, ALLOWED_TAGS };
