export function scoreText(label, value) {
  return `${label} ${(value / 20).toFixed(1)}`;
}

export function featureMiniCard(title, copy, page, imageSrc) {
  return `
    <button class="mini-card feature-mini" type="button" data-page="${page}">
      <img class="line-icon image-icon" src="${imageSrc}" alt="" />
      <div>
        <strong>${title}</strong>
        <p>${copy}</p>
      </div>
      <span class="card-arrow">→</span>
    </button>
  `;
}

export function placeMiniCard(place, imageSrc) {
  return `
    <article class="mini-card">
      <img class="mini-thumb image-thumb" src="${imageSrc}" alt="" />
      <div>
        <strong>${place.name}</strong>
        <p>${place.category} · ${place.area} · ${place.distance}</p>
      </div>
      <span class="score">${scoreText("Safe", place.safe)}</span>
    </article>
  `;
}

export function placePickCard(place, imageSrc, options = {}) {
  const selectedClass = options.selected ? " is-selected" : "";
  return `
    <button class="mini-card place-pick${selectedClass}" type="button" data-place="${place.id}">
      <img class="mini-thumb image-thumb" src="${imageSrc}" alt="" />
      <div>
        <strong>${place.name}</strong>
        <p>${place.category} · ${place.distance}</p>
        <span>${scoreText("Safe", place.safe)} · ${scoreText("Solo", place.solo)}</span>
      </div>
      <span>${options.saved ? "◆" : "◇"}</span>
    </button>
  `;
}

export function featureActionCard(imageSrc, title, copy, page) {
  return `
    <button class="feature-card safe-action-card" type="button" data-page="${page}">
      <img src="${imageSrc}" alt="" />
      <strong>${title}</strong>
      <span>${copy}</span>
    </button>
  `;
}

export function categoryButton(label, selected, dataAttribute, iconHtml = "") {
  return `
    <button class="category-button ${selected ? "is-selected" : ""}" type="button" ${dataAttribute}>
      ${iconHtml}${label}
    </button>
  `;
}

export function filterChip(label, selected, dataAttribute) {
  return `<button class="filter-chip ${selected ? "is-selected" : ""}" type="button" ${dataAttribute}>${label}</button>`;
}

export function choiceChip(label, selected, dataAttribute, imageSrc = "") {
  const image = imageSrc ? `<img src="${imageSrc}" alt="" />` : "";
  const chipClass = imageSrc ? "choice-chip mood-chip" : "choice-chip";
  return `<button class="${chipClass} ${selected ? "is-selected" : ""}" type="button" ${dataAttribute}>${image}${label}</button>`;
}

export function tabButton(label, selected, dataAttribute) {
  return `<button class="tab ${selected ? "is-selected" : ""}" type="button" ${dataAttribute}>${label}</button>`;
}

export function listRow(title, meta, badge = "", badgeClass = "pill") {
  const badgeMarkup = badge ? `<span class="${badgeClass}">${badge}</span>` : "";
  return `<div class="list-row"><div><strong>${title}</strong><span>${meta}</span></div>${badgeMarkup}</div>`;
}

export function stepItem(title, body) {
  return `<div class="step"><strong>${title}</strong><span>${body}</span></div>`;
}
