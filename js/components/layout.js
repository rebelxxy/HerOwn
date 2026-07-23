export function pageShell(content, className = "") {
  const extraClass = className ? ` ${className}` : "";
  return `<section class="page section${extraClass}">${content}</section>`;
}

export function sectionHead(eyebrow, title, copy, action = "") {
  return `
    <div class="section-head">
      <div>
        <p class="eyebrow">${eyebrow}</p>
        <h1 class="section-title">${title}</h1>
        <p class="section-copy">${copy}</p>
      </div>
      ${action}
    </div>
  `;
}
