import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TAILWIND_CLASSES, VARIANTS, resolveConflict } from '../constants/tailwindClasses';

export function TailwindInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 h-6 bg-[#0a0a0a] border border-[#1f1f1f] rounded px-2 py-1 text-xs text-[#888] focus:outline-none focus:border-[#333] font-mono"
    />
  );
}

export function TailwindClassGroup({ title, classes, selectedClass, onSelect }) {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[10px] text-[#666] hover:text-white"
      >
        <span className="font-medium">{title}</span>
        {isOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
      </button>
      {isOpen && (
        <div className="flex flex-wrap gap-1">
          {classes.slice(0, 12).map(cls => (
            <button
              key={cls}
              onClick={() => onSelect(cls)}
              className={`px-1.5 py-0.5 text-[9px] rounded font-mono transition-all ${
                selectedClass === cls 
                  ? 'bg-[#6366f1] text-white' 
                  : 'bg-[#1a1a1a] text-[#666] hover:text-white hover:bg-[#252525]'
              }`}
            >
              {cls || '(none)'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TailwindSection({ properties, updateProperty, addClass }) {
  const allClasses = Object.entries(properties.selectedClasses)
    .filter(([_, v]) => v)
    .map(([_, v]) => v)
    .join(' ');

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <span className="text-[10px] text-[#666] font-medium">Custom Classes</span>
        <TailwindInput 
          value={properties.customClasses}
          onChange={(v) => updateProperty('customClasses', v)}
          placeholder="Enter custom Tailwind classes..."
        />
      </div>

      <div className="border-t border-[#1f1f1f] pt-2 space-y-2">
        <span className="text-[10px] text-[#666] font-medium">Quick Add</span>
        
        <TailwindClassGroup 
          title="Display & Position" 
          classes={[...TAILWIND_CLASSES.layout.display, ...TAILWIND_CLASSES.layout.position]}
          selectedClass={properties.selectedClasses.layout}
          onSelect={(c) => addClass('layout', c)}
        />
        
        <TailwindClassGroup 
          title="Flexbox" 
          classes={[...TAILWIND_CLASSES.flexbox.flexDirection, ...TAILWIND_CLASSES.flexbox.justifyContent, ...TAILWIND_CLASSES.flexbox.alignItems]}
          selectedClass={properties.selectedClasses.flexbox}
          onSelect={(c) => addClass('flexbox', c)}
        />
        
        <TailwindClassGroup 
          title="Grid" 
          classes={[...TAILWIND_CLASSES.grid.gridTemplateColumns, ...TAILWIND_CLASSES.grid.gap]}
          selectedClass={properties.selectedClasses.grid}
          onSelect={(c) => addClass('grid', c)}
        />
        
        <TailwindClassGroup 
          title="Spacing (P/M)" 
          classes={[...TAILWIND_CLASSES.spacing.padding, ...TAILWIND_CLASSES.spacing.margin]}
          selectedClass={properties.selectedClasses.spacing}
          onSelect={(c) => addClass('spacing', c)}
        />
        
        <TailwindClassGroup 
          title="Size (W/H)" 
          classes={[...TAILWIND_CLASSES.sizing.width, ...TAILWIND_CLASSES.sizing.height]}
          selectedClass={properties.selectedClasses.sizing}
          onSelect={(c) => addClass('sizing', c)}
        />
        
        <TailwindClassGroup 
          title="Typography" 
          classes={[...TAILWIND_CLASSES.typography.fontSize, ...TAILWIND_CLASSES.typography.fontWeight, ...TAILWIND_CLASSES.typography.textAlign]}
          selectedClass={properties.selectedClasses.typography}
          onSelect={(c) => addClass('typography', c)}
        />
        
        <TailwindClassGroup 
          title="Text Color" 
          classes={TAILWIND_CLASSES.colors.textColors.slice(0, 20)}
          selectedClass={properties.selectedClasses.textColor}
          onSelect={(c) => addClass('textColor', c)}
        />
        
        <TailwindClassGroup 
          title="Background" 
          classes={TAILWIND_CLASSES.colors.backgroundColors.slice(0, 20)}
          selectedClass={properties.selectedClasses.bgColor}
          onSelect={(c) => addClass('bgColor', c)}
        />
        
        <TailwindClassGroup 
          title="Border" 
          classes={[...TAILWIND_CLASSES.borders.borderWidth, ...TAILWIND_CLASSES.borders.borderRadius.slice(0, 10)]}
          selectedClass={properties.selectedClasses.border}
          onSelect={(c) => addClass('border', c)}
        />
        
        <TailwindClassGroup 
          title="Effects" 
          classes={[...TAILWIND_CLASSES.effects.boxShadow, ...TAILWIND_CLASSES.effects.opacity]}
          selectedClass={properties.selectedClasses.effects}
          onSelect={(c) => addClass('effects', c)}
        />
      </div>

      {allClasses && (
        <div className="border-t border-[#1f1f1f] pt-2">
          <span className="text-[10px] text-[#666] font-medium">Applied</span>
          <div className="mt-1 p-2 bg-[#0a0a0a] rounded border border-[#1f1f1f]">
            <code className="text-[9px] text-[#6366f1] break-all">{allClasses}</code>
          </div>
        </div>
      )}
    </div>
  );
}
