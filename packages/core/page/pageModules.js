export const pageModules = import.meta.glob(
	[
		"/src/pages/page.jsx", // Root-level home page
		"/src/pages/**/page.jsx", // Folder-based pages
	],
	{ eager: true }
);
