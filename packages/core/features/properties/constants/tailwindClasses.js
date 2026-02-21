export const TAILWIND_CLASSES = {
  layout: {
    display: ['', 'block', 'inline-block', 'flex', 'inline-flex', 'grid', 'none'],
    position: ['', 'relative', 'absolute', 'fixed', 'sticky'],
    overflow: ['', 'overflow-auto', 'overflow-hidden', 'overflow-visible', 'overflow-scroll'],
    zIndex: ['', 'z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50'],
  },
  flexbox: {
    flexDirection: ['', 'flex-row', 'flex-col'],
    flexWrap: ['', 'flex-wrap', 'flex-nowrap'],
    justifyContent: ['', 'justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around'],
    alignItems: ['', 'items-start', 'items-end', 'items-center', 'items-stretch'],
    flexGrow: ['', 'flex-grow', 'flex-grow-0'],
  },
  grid: {
    gridTemplateColumns: ['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-6', 'grid-cols-12'],
    gridTemplateRows: ['', 'grid-rows-1', 'grid-rows-2', 'grid-rows-3'],
    gap: ['', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8'],
  },
  spacing: {
    padding: ['', 'p-1', 'p-2', 'p-3', 'p-4', 'p-6', 'p-8', 'p-12', 'p-16'],
    paddingX: ['', 'px-1', 'px-2', 'px-4', 'px-6', 'px-8'],
    paddingY: ['', 'py-1', 'py-2', 'py-4', 'py-6', 'py-8'],
    margin: ['', 'm-1', 'm-2', 'm-4', 'm-6', 'm-auto'],
    marginX: ['', 'mx-1', 'mx-2', 'mx-4', 'mx-auto'],
    marginY: ['', 'my-1', 'my-2', 'my-4', 'my-auto'],
  },
  sizing: {
    width: ['w-auto', 'w-full', 'w-1/2', 'w-1/3', 'w-2/3', 'w-1/4', 'w-3/4', 'w-screen', 'w-min', 'w-max'],
    height: ['h-auto', 'h-full', 'h-screen', 'h-min', 'h-max'],
    minWidth: ['', 'min-w-0', 'min-w-full'],
    minHeight: ['', 'min-h-0', 'min-h-full', 'min-h-screen'],
    maxWidth: ['', 'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-full'],
    maxHeight: ['', 'max-h-full', 'max-h-screen'],
  },
  typography: {
    fontFamily: ['', 'font-sans', 'font-serif', 'font-mono'],
    fontSize: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'],
    fontWeight: ['', 'font-thin', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold'],
    fontStyle: ['', 'italic', 'not-italic'],
    letterSpacing: ['', 'tracking-tighter', 'tracking-tight', 'tracking-normal', 'tracking-wide'],
    lineHeight: ['', 'leading-none', 'leading-tight', 'leading-normal', 'leading-relaxed', 'leading-loose'],
    textAlign: ['', 'text-left', 'text-center', 'text-right', 'text-justify'],
    textDecoration: ['', 'underline', 'overline', 'line-through', 'no-underline'],
    textTransform: ['', 'uppercase', 'lowercase', 'capitalize', 'normal-case'],
  },
  colors: {
    textColors: [
      'text-transparent', 'text-current', 'text-black', 'text-white',
      'text-gray-50', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400', 'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
      'text-red-50', 'text-red-500', 'text-red-600', 'text-red-700',
      'text-orange-50', 'text-orange-500', 'text-orange-600',
      'text-yellow-50', 'text-yellow-500', 'text-yellow-600',
      'text-green-50', 'text-green-500', 'text-green-600',
      'text-teal-50', 'text-teal-500', 'text-teal-600',
      'text-blue-50', 'text-blue-500', 'text-blue-600',
      'text-indigo-50', 'text-indigo-500', 'text-indigo-600',
      'text-purple-50', 'text-purple-500', 'text-purple-600',
      'text-pink-50', 'text-pink-500', 'text-pink-600',
    ],
    backgroundColors: [
      'bg-transparent', 'bg-current', 'bg-black', 'bg-white',
      'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900',
      'bg-red-50', 'bg-red-500', 'bg-red-600',
      'bg-orange-50', 'bg-orange-500', 'bg-orange-600',
      'bg-yellow-50', 'bg-yellow-500', 'bg-yellow-600',
      'bg-green-50', 'bg-green-500', 'bg-green-600',
      'bg-teal-50', 'bg-teal-500', 'bg-teal-600',
      'bg-blue-50', 'bg-blue-500', 'bg-blue-600',
      'bg-indigo-50', 'bg-indigo-500', 'bg-indigo-600',
      'bg-purple-50', 'bg-purple-500', 'bg-purple-600',
      'bg-pink-50', 'bg-pink-500', 'bg-pink-600',
    ],
    borderColors: [
      'border-transparent', 'border-current', 'border-black', 'border-white',
      'border-gray-50', 'border-gray-100', 'border-gray-200', 'border-gray-300', 'border-gray-400', 'border-gray-500', 'border-gray-600', 'border-gray-700', 'border-gray-800', 'border-gray-900',
      'border-red-500', 'border-red-600',
      'border-blue-500', 'border-blue-600',
      'border-green-500', 'border-green-600',
      'border-yellow-500', 'border-yellow-600',
      'border-purple-500', 'border-purple-600',
    ],
  },
  borders: {
    borderWidth: ['', 'border', 'border-0', 'border-2', 'border-4', 'border-8'],
    borderStyle: ['', 'border-solid', 'border-dashed', 'border-dotted'],
    borderRadius: [
      '', 'rounded-none', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full',
      'rounded-t-none', 'rounded-t', 'rounded-t-lg', 'rounded-t-full',
      'rounded-r-none', 'rounded-r', 'rounded-r-lg', 'rounded-r-full',
      'rounded-b-none', 'rounded-b', 'rounded-b-lg', 'rounded-b-full',
      'rounded-l-none', 'rounded-l', 'rounded-l-lg', 'rounded-l-full',
    ],
  },
  effects: {
    boxShadow: ['', 'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-none'],
    opacity: ['opacity-0', 'opacity-25', 'opacity-50', 'opacity-75', 'opacity-100'],
    backdropBlur: ['', 'backdrop-blur-sm', 'backdrop-blur', 'backdrop-blur-md', 'backdrop-blur-lg'],
  },
  transforms: {
    transform: ['', 'transform', 'transform-gpu', 'transform-none'],
    scale: ['', 'scale-0', 'scale-50', 'scale-75', 'scale-90', 'scale-95', 'scale-100', 'scale-105', 'scale-110', 'scale-125'],
    rotate: ['', 'rotate-0', 'rotate-1', 'rotate-2', 'rotate-3', 'rotate-6', 'rotate-12', 'rotate-45', 'rotate-90', 'rotate-180'],
    translate: ['', 'translate-x-0', 'translate-x-1', 'translate-x-2', 'translate-x-4', 'translate-x-8', 'translate-x-full', 
                'translate-y-0', 'translate-y-1', 'translate-y-2', 'translate-y-4', 'translate-y-8', 'translate-y-full'],
    transformOrigin: ['', 'origin-center', 'origin-top', 'origin-right', 'origin-bottom', 'origin-left'],
  },
  transitions: {
    transition: ['', 'transition-none', 'transition-all', 'transition', 'transition-colors', 'transition-opacity', 'transition-transform'],
    transitionDuration: ['', 'duration-0', 'duration-75', 'duration-100', 'duration-150', 'duration-200', 'duration-300', 'duration-500'],
    transitionTimingFunction: ['', 'ease-linear', 'ease-in', 'ease-out', 'ease-in-out'],
    animation: ['', 'animate-none', 'animate-spin', 'animate-ping', 'animate-pulse', 'animate-bounce'],
  },
  interactivity: {
    cursor: ['', 'cursor-auto', 'cursor-default', 'cursor-pointer', 'cursor-wait', 'cursor-text', 'cursor-move', 'cursor-help', 'cursor-not-allowed'],
    userSelect: ['', 'select-none', 'select-text', 'select-all', 'select-auto'],
    pointerEvents: ['', 'pointer-events-auto', 'pointer-events-none'],
    resize: ['', 'resize-none', 'resize', 'resize-y', 'resize-x'],
  },
};

export const VARIANTS = ['base', 'hover', 'focus', 'active', 'dark'];

export const CLASS_CONFLICTS = {
  'display': {
    'block': ['inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none'],
    'inline-block': ['block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none'],
    'flex': ['block', 'inline-block', 'inline-flex', 'grid', 'inline-grid', 'none'],
    'inline-flex': ['block', 'inline-block', 'flex', 'grid', 'inline-grid', 'none'],
    'grid': ['block', 'inline-block', 'flex', 'inline-flex', 'inline-grid', 'none'],
    'inline-grid': ['block', 'inline-block', 'flex', 'inline-flex', 'grid', 'none'],
    'none': ['block', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid'],
  },
  'flexDirection': {
    'flex-row': ['flex-col', 'flex-col-reverse', 'flex-row-reverse'],
    'flex-col': ['flex-row', 'flex-row-reverse', 'flex-col-reverse'],
    'flex-row-reverse': ['flex-row', 'flex-col', 'flex-col-reverse'],
    'flex-col-reverse': ['flex-row', 'flex-row-reverse', 'flex-col'],
  },
  'flexWrap': {
    'flex-nowrap': ['flex-wrap', 'flex-wrap-reverse'],
    'flex-wrap': ['flex-nowrap', 'flex-wrap-reverse'],
    'flex-wrap-reverse': ['flex-nowrap', 'flex-wrap'],
  },
  'justifyContent': {
    'justify-start': ['justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly'],
    'justify-end': ['justify-start', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly'],
    'justify-center': ['justify-start', 'justify-end', 'justify-between', 'justify-around', 'justify-evenly'],
    'justify-between': ['justify-start', 'justify-end', 'justify-center', 'justify-around', 'justify-evenly'],
    'justify-around': ['justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-evenly'],
    'justify-evenly': ['justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around'],
  },
  'alignItems': {
    'items-start': ['items-end', 'items-center', 'items-baseline', 'items-stretch'],
    'items-end': ['items-start', 'items-center', 'items-baseline', 'items-stretch'],
    'items-center': ['items-start', 'items-end', 'items-baseline', 'items-stretch'],
    'items-baseline': ['items-start', 'items-end', 'items-center', 'items-stretch'],
    'items-stretch': ['items-start', 'items-end', 'items-center', 'items-baseline'],
  },
  'fontSize': {
    'text-xs': ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'],
    'text-sm': ['text-xs', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'],
    'text-base': ['text-xs', 'text-sm', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'],
    'text-lg': ['text-xs', 'text-sm', 'text-base', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'],
    'text-xl': ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-2xl', 'text-3xl', 'text-4xl'],
    'text-2xl': ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-3xl', 'text-4xl'],
    'text-3xl': ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-4xl'],
    'text-4xl': ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'],
  },
  'fontWeight': {
    'font-thin': ['font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black'],
    'font-extralight': ['font-thin', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black'],
    'font-light': ['font-thin', 'font-extralight', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black'],
    'font-normal': ['font-thin', 'font-extralight', 'font-light', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black'],
    'font-medium': ['font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black'],
    'font-semibold': ['font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-bold', 'font-extrabold', 'font-black'],
    'font-bold': ['font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-extrabold', 'font-black'],
    'font-extrabold': ['font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-black'],
    'font-black': ['font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold'],
  },
  'textAlign': {
    'text-left': ['text-center', 'text-right', 'text-justify'],
    'text-center': ['text-left', 'text-right', 'text-justify'],
    'text-right': ['text-left', 'text-center', 'text-justify'],
    'text-justify': ['text-left', 'text-center', 'text-right'],
  },
  'borderRadius': {
    'rounded-none': ['rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full'],
    'rounded-sm': ['rounded-none', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full'],
    'rounded': ['rounded-none', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full'],
    'rounded-md': ['rounded-none', 'rounded-sm', 'rounded', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full'],
    'rounded-lg': ['rounded-none', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-xl', 'rounded-2xl', 'rounded-full'],
    'rounded-xl': ['rounded-none', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-2xl', 'rounded-full'],
    'rounded-2xl': ['rounded-none', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full'],
    'rounded-full': ['rounded-none', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl'],
  },
};

export function resolveConflict(currentClasses, category, newClass) {
  if (!newClass) return currentClasses;
  
  const conflicts = CLASS_CONFLICTS[category];
  if (!conflicts) return [...currentClasses, newClass].filter(c => c !== newClass);
  
  const toRemove = conflicts[newClass] || [];
  return [...currentClasses.filter(c => !toRemove.includes(c)), newClass];
}
