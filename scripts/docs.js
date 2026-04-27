function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function flattenEntries(entries, result = []) {
  entries.forEach((entry) => {
    result.push(entry);
    if (entry.children && entry.children.length) {
      flattenEntries(entry.children, result);
    }
  });
  return result;
}

function findEntryByKey(entries, key) {
  for (const entry of entries) {
    if (entry.key === key) return entry;
    if (entry.children && entry.children.length) {
      const match = findEntryByKey(entry.children, key);
      if (match) return match;
    }
  }
  return null;
}

function renderDirectoryList(items, toSiteHref) {
  if (!items || !items.length) return "";

  return `
    <div class="docs-v2-directory-list">
      ${items.map((item) => {
        const title = escapeHtml(item.title);
        const description = item.description ? `<p class="docs-v2-directory-description">${escapeHtml(item.description)}</p>` : "";
        const metaItems = [];

        if (item.planned) {
          metaItems.push('<span class="docs-v2-directory-badge">Planned</span>');
        }

        if (item.children && item.children.length) {
          const childNames = item.children.map((child) => child.planned ? `${child.title} (planned)` : child.title);
          metaItems.push(`<span class="docs-v2-directory-meta-text">Includes ${escapeHtml(childNames.join(", "))}</span>`);
        }

        const meta = metaItems.length
          ? `<div class="docs-v2-directory-meta">${metaItems.join("")}</div>`
          : "";

        const titleMarkup = item.path
          ? `<a class="docs-v2-directory-link" href="${toSiteHref(item.path)}">${title}</a>`
          : `<span class="docs-v2-directory-link docs-v2-directory-link--static">${title}</span>`;

        return `
          <article class="docs-v2-directory-item">
            <div class="docs-v2-directory-item-head">
              ${titleMarkup}
              ${meta}
            </div>
            ${description}
          </article>
        `;
      }).join("")}
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const docsConfig = window.DOCS_CONFIG || { pages: [] };
  const topLevelPages = docsConfig.pages || [];
  const allEntries = flattenEntries(topLevelPages);
  const siteSections = new Set(
    topLevelPages
      .map((page) => (page.path || "").split("/")[0])
      .filter((part) => part && !part.endsWith(".html")),
  );

  const currentPath = window.location.pathname.replace(/\/+$/, "");
  const currentPathParts = currentPath.split("/").filter(Boolean);
  const firstSectionIndex = currentPathParts.findIndex((part) => siteSections.has(part));
  let siteBaseParts = firstSectionIndex >= 0
    ? currentPathParts.slice(0, firstSectionIndex)
    : [...currentPathParts];

  if (siteBaseParts.length && /\.[a-z0-9]+$/i.test(siteBaseParts[siteBaseParts.length - 1])) {
    siteBaseParts = siteBaseParts.slice(0, -1);
  }

  const siteBasePath = siteBaseParts.length ? `/${siteBaseParts.join("/")}` : "";
  const toSiteHref = (path) => `${siteBasePath}/${path}`;
  const normalizePath = (path) => String(path || "").replace(/\/+$/, "");
  const navMount = document.querySelector("[data-docs-v2-nav]");
  const navKicker = "EDPLAN NEXTGEN";
  const navTitle = "Design System";
  const navCopy = "Shared foundations, components, and patterns for consistent product UI decisions across the platform.";
  const navStateKey = "docs-v2-nav-state";
  const readNavState = () => {
    try {
      const raw = window.localStorage.getItem(navStateKey);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  };
  const writeNavState = (state) => {
    try {
      window.localStorage.setItem(navStateKey, JSON.stringify(state));
    } catch (error) {
      // Ignore storage write failures and fall back to current-page expansion.
    }
  };
  const navState = readNavState();

  const entryContainsCurrentPage = (entry) => {
    if (entry.path && normalizePath(toSiteHref(entry.path)) === currentPath) {
      return true;
    }

    return Boolean(entry.children && entry.children.some((child) => entryContainsCurrentPage(child)));
  };

  const seedNavState = (entries) => {
    let didChange = false;

    const visit = (items) => {
      (items || []).forEach((entry) => {
        const visibleChildren = (entry.children || []).filter((child) => child.path);
        if (visibleChildren.length && !Object.prototype.hasOwnProperty.call(navState, entry.key)) {
          navState[entry.key] = entryContainsCurrentPage(entry);
          didChange = true;
        }
        visit(visibleChildren);
      });
    };

    visit(entries);

    if (didChange) {
      writeNavState(navState);
    }
  };

  seedNavState(topLevelPages);

  const renderNavTree = (entries, level = 0) => {
    const visibleEntries = (entries || []).filter((entry) => entry.path);
    if (!visibleEntries.length) return "";

    return `
      <div class="docs-v2-nav-level docs-v2-nav-level--${level}">
        ${visibleEntries.map((entry) => {
          const childMarkup = renderNavTree(entry.children || [], level + 1);
          const label = escapeHtml(entry.navLabel || entry.title);
          const status = entry.status ? `<span class="docs-v2-nav-status docs-v2-nav-status--${escapeHtml(String(entry.status).toLowerCase())}">${escapeHtml(entry.status)}</span>` : "";
          const href = toSiteHref(entry.path);
          const linkClass = level === 0 ? "docs-v2-nav-link" : "docs-v2-nav-link docs-v2-nav-link--nested";
          const hasChildren = Boolean(childMarkup);
          const childId = hasChildren ? `docs-nav-children-${escapeHtml(entry.key)}` : "";
          const isExpanded = hasChildren && Boolean(navState[entry.key]);
          const toggle = hasChildren
            ? `<button class="docs-v2-nav-toggle" type="button" aria-expanded="${isExpanded ? "true" : "false"}" aria-controls="${childId}" data-docs-v2-nav-toggle data-docs-v2-nav-key="${escapeHtml(entry.key)}">
                <svg viewBox="0 0 14 7" focusable="false" aria-hidden="true">
                  <path d="M1 1 7 6 13 1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>`
            : `<span class="docs-v2-nav-toggle-spacer" aria-hidden="true"></span>`;
          return `
            <div class="docs-v2-nav-node docs-v2-nav-node--${level}">
              <div class="docs-v2-nav-node-head">
                ${toggle}
                <a class="${linkClass}" href="${href}" data-docs-v2-link>
                  <span class="docs-v2-nav-link-text">${label}</span>
                  ${status}
                </a>
              </div>
              ${hasChildren ? `<div id="${childId}" class="docs-v2-nav-children" ${isExpanded ? "" : "hidden"}>${childMarkup}</div>` : ""}
            </div>
          `;
        }).join("")}
      </div>
    `;
  };

  if (navMount) {
    navMount.setAttribute("aria-label", "Design system navigation");
    navMount.innerHTML = `
      <div class="docs-v2-brand">
        <p class="docs-v2-kicker">${escapeHtml(navKicker)}</p>
        <h1 class="docs-v2-brand-title">${escapeHtml(navTitle)}</h1>
        <p class="docs-v2-brand-copy">${escapeHtml(navCopy)}</p>
      </div>
      <nav class="docs-v2-nav">
        ${renderNavTree(topLevelPages)}
      </nav>
    `;
  }

  document.querySelectorAll("[data-docs-v2-link]").forEach((link) => {
    const href = new URL(link.href, window.location.href).pathname.replace(/\/+$/, "");
    if (href === currentPath) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  document.querySelectorAll("[data-docs-v2-nav-toggle]").forEach((toggle) => {
    const controlsId = toggle.getAttribute("aria-controls");
    const content = controlsId ? document.getElementById(controlsId) : null;
    const navKey = toggle.getAttribute("data-docs-v2-nav-key");
    if (!(toggle instanceof HTMLButtonElement) || !content) return;

    toggle.addEventListener("click", () => {
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      const nextExpanded = !isExpanded;
      toggle.setAttribute("aria-expanded", String(nextExpanded));
      content.hidden = !nextExpanded;
      if (navKey) {
        navState[navKey] = nextExpanded;
        writeNavState(navState);
      }
    });
  });

  document.querySelectorAll("[data-docs-directory]").forEach((mount) => {
    const key = mount.getAttribute("data-docs-directory");
    const entry = findEntryByKey(topLevelPages, key);
    if (!entry) return;

    const title = entry.directoryTitle || entry.title;
    const copy = entry.directoryCopy || entry.description || "";
    const items = entry.children || [];

    mount.innerHTML = `
      <div class="docs-v2-section-head">
        <h3 class="docs-v2-section-title">${escapeHtml(title)}</h3>
        <p class="docs-v2-section-copy">${escapeHtml(copy)}</p>
      </div>
      ${renderDirectoryList(items, toSiteHref)}
    `;
  });

  const pageNavLinks = Array.from(document.querySelectorAll(".docs-v2-page-nav-link"));
  const observedSections = pageNavLinks
    .map((link) => {
      const hash = link.getAttribute("href");
      if (!hash || !hash.startsWith("#")) return null;
      const target = document.querySelector(hash);
      if (!target) return null;
      return { link, target, id: hash };
    })
    .filter(Boolean);

  if (observedSections.length) {
    const setActivePageLink = (activeId) => {
      observedSections.forEach(({ link, id }) => {
        if (id === activeId) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const initialHash = window.location.hash && observedSections.some(({ id }) => id === window.location.hash)
      ? window.location.hash
      : observedSections[0].id;

    setActivePageLink(initialHash);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries.length) {
          setActivePageLink(`#${visibleEntries[0].target.id}`);
        }
      },
      {
        rootMargin: "-15% 0px -70% 0px",
        threshold: [0, 0.2, 0.5],
      },
    );

    observedSections.forEach(({ target }) => observer.observe(target));

    window.addEventListener("hashchange", () => {
      if (window.location.hash) {
        setActivePageLink(window.location.hash);
      }
    });
  }
});
