import { usePageStore } from '../../stores/pageStore';
import { PageDOM } from './PageDOM';

export function PageDOMRoot() {
  const pages = usePageStore((s) => s.pages);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {pages.map((page) => (
        <PageDOM key={page.id} page={page} />
      ))}
    </div>
  );
}
