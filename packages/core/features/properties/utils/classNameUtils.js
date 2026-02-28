const CLASS_MAPPINGS = {
  // Sizing
  width: 'w-',
  height: 'h-',
  minWidth: 'min-w-',
  maxWidth: 'max-w-',
  minHeight: 'min-h-',
  maxHeight: 'max-h-',
  aspectRatio: 'aspect-',
  
  // Layout
  display: '',
  flex: 'flex-',
  flexDirection: 'flex-',
  justifyContent: 'justify-',
  alignItems: 'items-',
  gridTemplateColumns: 'grid-cols-',
  gap: 'gap-',
  
  // Typography
  fontFamily: 'font-',
  fontSize: 'text-',
  fontWeight: 'font-',
  textAlign: 'text-',
  leading: 'leading-',
  tracking: 'tracking-',
  
  // Color
  color: 'text-',
  backgroundColor: 'bg-',
  borderColor: 'border-',
  
  // Effects
  borderRadius: 'rounded-',
  borderWidth: 'border-',
  opacity: 'opacity-',
  blur: 'blur-',
  shadow: 'shadow-',
  
  // Spacing
  padding: 'p-',
  paddingTop: 'pt-',
  paddingRight: 'pr-',
  paddingBottom: 'pb-',
  paddingLeft: 'pl-',
  margin: 'm-',
  marginTop: 'mt-',
  marginRight: 'mr-',
  marginBottom: 'mb-',
  marginLeft: 'ml-',
};

const REVERSE_MAPPINGS = Object.fromEntries(
  Object.entries(CLASS_MAPPINGS).map(([key, prefix]) => [prefix, key])
);

export function parseClassName(className) {
  const selectedClasses = {};
  if (!className) return selectedClasses;
  
  const classes = className.split(/\s+/).filter(Boolean);
  
  for (const cls of classes) {
    // Check exact matches first
    if (cls === 'block') { selectedClasses.display = 'block'; continue; }
    if (cls === 'flex') { selectedClasses.display = 'flex'; continue; }
    if (cls === 'grid') { selectedClasses.display = 'grid'; continue; }
    if (cls === 'inline-block') { selectedClasses.display = 'inline-block'; continue; }
    if (cls === 'inline-flex') { selectedClasses.display = 'inline-flex'; continue; }
    if (cls === 'hidden') { selectedClasses.display = 'hidden'; continue; }

    // Position
    if (cls === 'static' || cls === 'relative' || cls === 'absolute' || cls === 'fixed' || cls === 'sticky') {
      selectedClasses.position = cls;
      continue;
    }

    // Offsets
    if (cls.startsWith('top-')) { selectedClasses.top = cls; continue; }
    if (cls.startsWith('right-')) { selectedClasses.right = cls; continue; }
    if (cls.startsWith('bottom-')) { selectedClasses.bottom = cls; continue; }
    if (cls.startsWith('left-')) { selectedClasses.left = cls; continue; }
    if (cls === 'flex-row') { selectedClasses.flexDirection = 'flex-row'; continue; }
    if (cls === 'flex-col') { selectedClasses.flexDirection = 'flex-col'; continue; }
    if (cls === 'flex-auto') { selectedClasses.flex = 'flex-auto'; continue; }
    if (cls === 'flex-none') { selectedClasses.flex = 'flex-none'; continue; }
    if (cls === 'flex-initial') { selectedClasses.flex = 'flex-initial'; continue; }
    if (cls.startsWith('flex-')) { selectedClasses.flex = cls; continue; }
    if (cls === 'object-cover') { selectedClasses.objectCover = 'object-cover'; continue; }
    if (cls === 'uppercase') { selectedClasses.uppercase = 'uppercase'; continue; }
    if (cls === 'lowercase') { selectedClasses.lowercase = 'lowercase'; continue; }
    if (cls === 'grayscale') { selectedClasses.grayscale = 'grayscale'; continue; }
    if (cls === 'invert') { selectedClasses.invert = 'invert'; continue; }
    
    // Width classes
    if (cls === 'w-full') { selectedClasses.width = 'w-full'; continue; }
    if (cls === 'w-auto') { selectedClasses.width = 'w-auto'; continue; }
    if (cls === 'w-screen') { selectedClasses.width = 'w-screen'; continue; }
    if (cls === 'w-min') { selectedClasses.width = 'w-min'; continue; }
    if (cls === 'w-max') { selectedClasses.width = 'w-max'; continue; }
    if (cls === 'w-fit') { selectedClasses.width = 'w-fit'; continue; }
    if (cls.startsWith('w-')) { selectedClasses.width = cls; continue; }
    
    // Height classes
    if (cls === 'h-full') { selectedClasses.height = 'h-full'; continue; }
    if (cls === 'h-auto') { selectedClasses.height = 'h-auto'; continue; }
    if (cls === 'h-screen') { selectedClasses.height = 'h-screen'; continue; }
    if (cls === 'h-min') { selectedClasses.height = 'h-min'; continue; }
    if (cls === 'h-max') { selectedClasses.height = 'h-max'; continue; }
    if (cls === 'h-fit') { selectedClasses.height = 'h-fit'; continue; }
    if (cls === 'min-h-screen') { selectedClasses.height = 'min-h-screen'; continue; }
    if (cls.startsWith('h-')) { selectedClasses.height = cls; continue; }
    
    // Gradient classes
    if (cls.startsWith('bg-gradient-to-')) { selectedClasses.gradientDirection = cls; continue; }
    if (cls.startsWith('from-[')) { selectedClasses.gradientFrom = cls; continue; }
    if (cls.startsWith('to-[')) { selectedClasses.gradientTo = cls; continue; }
    if (cls.startsWith('via-[')) { selectedClasses.gradientVia = cls; continue; }

    // Text alignment (must be checked BEFORE text color/font size)
    if (cls === 'text-left' || cls === 'text-center' || cls === 'text-right' || cls === 'text-justify') {
      selectedClasses.textAlign = cls;
      continue;
    }

    // Padding / Margin (p-4, pt-4, px-6, p-[50px], mt-[12px], etc)
    if (/^p[trblxy]?-.+/.test(cls)) {
      selectedClasses[cls.split('-')[0]] = cls;
      continue;
    }
    if (/^m[trblxy]?-.+/.test(cls)) {
      selectedClasses[cls.split('-')[0]] = cls;
      continue;
    }
    
    // Handle padding/margin with arbitrary values like p-[50px]
    if (cls.match(/^[pm]-[tbrlx]?-\[/)) { 
      const prefix = cls.split('-')[0]; // 'p' or 'm'
      const dir = cls.split('-')[1]; // 't', 'r', 'b', 'l', 'x', 'y'
      const key = dir ? prefix + dir : prefix;
      selectedClasses[key] = cls; 
      continue; 
    }
    if (cls.startsWith('p-') || cls.startsWith('m-')) { selectedClasses[cls.split('-')[0]] = cls; continue; }
    
    // BACKGROUND COLOR - handle bg-[#00000000], bg-red-500, etc
    if (cls.startsWith('bg-')) { 
      selectedClasses.backgroundColor = cls; 
      continue; 
    }
    
    // TEXT COLOR - handle text-[#ffffff], text-red-500, etc (but NOT font sizes)
    // Font sizes are: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, etc, AND text-[any number]
    if (cls.startsWith('text-') && 
        !cls.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/) &&
        !cls.match(/^text-\[\d+(\.\d+)?(px|em|rem|%)?\]$/)) { 
      // This is a text color (text-white, text-[#ffffff], text-red-500)
      selectedClasses.textColor = cls; 
      continue; 
    }
    
    // Font size (text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-[160px], etc)
    if (cls.startsWith('text-')) { 
      selectedClasses.fontSize = cls; 
      continue; 
    }
    
    // Other classes - check CLASS_MAPPINGS
    if (cls.startsWith('font-')) { selectedClasses.fontWeight = cls; continue; }
    if (cls.startsWith('leading-')) { selectedClasses.leading = cls; continue; }
    if (cls.startsWith('tracking-')) { selectedClasses.tracking = cls; continue; }
    if (cls === 'rounded' || cls.startsWith('rounded-')) { selectedClasses.borderRadius = cls; continue; }

    // Border width vs border color
    if (cls === 'border' || /^border-(0|2|4|8)$/.test(cls)) { selectedClasses.borderWidth = cls; continue; }
    if (cls.startsWith('border-')) { selectedClasses.borderColor = cls; continue; }
    if (cls.startsWith('opacity-')) { selectedClasses.opacity = cls; continue; }
    if (cls.startsWith('blur-')) { selectedClasses.blur = cls; continue; }
    if (cls.startsWith('shadow-')) { selectedClasses.shadow = cls; continue; }
    if (cls.startsWith('gap-')) { selectedClasses.gap = cls; continue; }
    if (cls.startsWith('grid-cols-')) { selectedClasses.gridTemplateColumns = cls; continue; }
    if (cls.startsWith('justify-')) { selectedClasses.justifyContent = cls; continue; }
    if (cls.startsWith('items-')) { selectedClasses.alignItems = cls; continue; }
    if (cls.startsWith('aspect-')) { selectedClasses.aspectRatio = cls; continue; }
    if (cls.startsWith('min-w-')) { selectedClasses.minWidth = cls; continue; }
    if (cls.startsWith('max-w-')) { selectedClasses.maxWidth = cls; continue; }
    if (cls.startsWith('min-h-')) { selectedClasses.minHeight = cls; continue; }
    if (cls.startsWith('max-h-')) { selectedClasses.maxHeight = cls; continue; }
  }
  
  return selectedClasses;
}

export function generateClassName(selectedClasses) {
  const classes = [];
  
  const order = [
    'gradientDirection',
    'gradientFrom',
    'gradientVia', 
    'gradientTo',
    'display',
    'position',
    'top',
    'right',
    'bottom',
    'left',
    'flex',
    'flexDirection',
    'justifyContent',
    'alignItems',
    'width',
    'height',
    'minWidth',
    'maxWidth',
    'minHeight',
    'maxHeight',
    'padding',
    'margin',
    'gap',
    'gridTemplateColumns',
    'aspectRatio',
    'backgroundColor',
    'textColor',
    'borderColor',
    'fontSize',
    'fontWeight',
    'textAlign',
    'leading',
    'tracking',
    'uppercase',
    'lowercase',
    'objectCover',
    'borderRadius',
    'shadow',
  ];
  
  const ordered = [...order, ...Object.keys(selectedClasses).filter(k => !order.includes(k))];
  
  for (const key of ordered) {
    const value = selectedClasses[key];
    if (value && value !== '') {
      classes.push(value);
    }
  }
  
  return classes.join(' ');
}

export function getPageFilePath(pageId) {
  if (pageId === 'Home') {
    return '/src/pages/page.jsx';
  }
  return `/src/pages/${pageId}/page.jsx`;
}

export function getPageModuleKey(pageId) {
  if (pageId === 'Home') {
    return '/src/pages/page.jsx';
  }
  return `/src/pages/${pageId}/page.jsx`;
}
