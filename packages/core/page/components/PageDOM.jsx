import { getPageModule } from '../utils/pageModules';

export function PageDOM({ page }) {
  if (!page.render) return null;

  const Mod = getPageModule(page.id);

  if (!Mod) {
    console.warn(`[PageDOM] Module not found for page "${page.id}"`);
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: `
          translate(${page.render.x}px, ${page.render.y}px)
          scale(${page.render.scale})
        `,
        transformOrigin: 'top left',
        width: page.width,
        height: page.height,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      <Mod />
    </div>
  );
}
