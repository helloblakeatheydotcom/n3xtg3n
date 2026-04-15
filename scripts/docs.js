document.addEventListener("DOMContentLoaded", () => {
  const SITE_SECTIONS = new Set(["components", "foundations", "archive", "patterns"]);
  const NAV_GROUPS = [
    {
      label: "Overview",
      links: [
        { label: "Home", path: "index.html" },
      ],
    },
    {
      label: "Foundations",
      links: [
        { label: "Spacing", path: "foundations/spacing.html" },
        { label: "Typography", path: "foundations/typography.html" },
        { label: "Color", path: "foundations/color.html" },
        { label: "Decorative Color", path: "foundations/decorative-color.html" },
      ],
    },
    {
      label: "Components",
      links: [
        { label: "Buttons", path: "components/buttons.html" },
        { label: "Fields", path: "components/forms.html" },
        { label: "Inline Notices", path: "components/inline-notices.html" },
        { label: "Panels", path: "components/panels.html" },
        { label: "Sections", path: "components/sections.html" },
        { label: "Cards", path: "components/cards.html" },
        { label: "Badges and Tags", path: "components/badges-tags.html" },
        { label: "Record Rows", path: "components/record-rows.html" },
      ],
    },
  ];

  const currentPath = window.location.pathname.replace(/\/+$/, "");
  const currentPathParts = currentPath.split("/").filter(Boolean);
  const firstSectionIndex = currentPathParts.findIndex((part) => SITE_SECTIONS.has(part));
  let siteBaseParts = firstSectionIndex >= 0
    ? currentPathParts.slice(0, firstSectionIndex)
    : [...currentPathParts];

  if (siteBaseParts.length && /\.[a-z0-9]+$/i.test(siteBaseParts[siteBaseParts.length - 1])) {
    siteBaseParts = siteBaseParts.slice(0, -1);
  }

  const siteBasePath = siteBaseParts.length ? `/${siteBaseParts.join("/")}` : "";
  const navMount = document.querySelector("[data-docs-v2-nav]");
  const navTitle = document.body.dataset.docsV2NavTitle || "Design System";
  const navCopy = document.body.dataset.docsV2NavCopy || "Shared foundations and reusable components for the product UI.";
  const navKicker = document.body.dataset.docsV2NavKicker || "EdPlan NextGen";

  if (navMount) {
    navMount.setAttribute("aria-label", "Design system navigation");
    navMount.innerHTML = `
      <div class="docs-v2-brand">
        <p class="docs-v2-kicker">${navKicker}</p>
        <h1 class="docs-v2-brand-title">${navTitle}</h1>
        <p class="docs-v2-brand-copy">${navCopy}</p>
      </div>
      <nav class="docs-v2-nav">
        ${NAV_GROUPS.map((group) => `
          <div class="docs-v2-nav-group">
            <p class="docs-v2-nav-label">${group.label}</p>
            <div class="docs-v2-nav-list">
              ${group.links.map((link) => {
                const href = `${siteBasePath}/${link.path}`;
                return `<a class="docs-v2-nav-link" href="${href}" data-docs-v2-link>${link.label}</a>`;
              }).join("")}
            </div>
          </div>
        `).join("")}
      </nav>
    `;
  }

  const navLinks = document.querySelectorAll("[data-docs-v2-link]");

  navLinks.forEach((link) => {
    const href = new URL(link.href, window.location.href).pathname.replace(/\/+$/, "");
    if (href === currentPath) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
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
