export const pageModules = import.meta.glob(
  [
    '/src/pages/page.jsx',
    '/src/pages/**/page.jsx',
  ],
  { eager: true }
);

export function getPageModule(pageId) {
  const key = pageId === 'Home'
    ? '/src/pages/page.jsx'
    : `/src/pages/${pageId}/page.jsx`;

  return pageModules[key]?.default;
}

export function getPageModuleKey(pageId) {
  return pageId === 'Home'
    ? '/src/pages/page.jsx'
    : `/src/pages/${pageId}/page.jsx`;
}
