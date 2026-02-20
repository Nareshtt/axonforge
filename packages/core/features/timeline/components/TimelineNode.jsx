import { useEffect, useRef, useState } from 'react';
import { Clock, GitMerge } from 'lucide-react';
import { COMMIT_WIDTH, HORIZONTAL_SPACING, VERTICAL_SPACING } from './TimelinePanel';

const ACCENT_COLOR = '#6366f1';

export function TimelineNode({ commit, isCurrent, isHead, onCheckout, hasBranches }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleCheckout = () => {
    if (isCurrent || isCheckingOut) return;
    setIsCheckingOut(true);
    onCheckout();
  };

  const getNodeClassName = () => {
    const base = 'relative px-3 py-2.5 rounded border shadow-sm transition-all duration-200 cursor-pointer group';
    const checkingOut = isCheckingOut ? 'opacity-50 pointer-events-none' : '';

    let stateStyle = '';
    if (isHead && isCurrent) {
      stateStyle = `border-[${ACCENT_COLOR}]/50 bg-[${ACCENT_COLOR}]/10`;
    } else if (isCurrent) {
      stateStyle = 'border-[#f59e0b]/50 bg-[#f59e0b]/10';
    } else if (isHead) {
      stateStyle = 'border-[#333] bg-[#0a0a0a] hover:border-[#444]';
    } else {
      stateStyle = 'border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#333] hover:bg-[#0f0f0f]';
    }

    return `${base} ${stateStyle} ${checkingOut}`;
  };

  const getTextClassName = () => {
    const base = 'font-medium text-xs';
    if (isHead && isCurrent) return `${base} text-white`;
    if (isCurrent) return `${base} text-[#fbbf24]`;
    return `${base} text-[#888] group-hover:text-white`;
  };

  return (
    <div
      className={getNodeClassName()}
      style={{
        position: 'absolute',
        left: commit.depth * (COMMIT_WIDTH + HORIZONTAL_SPACING),
        top: commit.branch * VERTICAL_SPACING,
        width: COMMIT_WIDTH,
      }}
      onClick={handleCheckout}
    >
      {(isHead || isCurrent || hasBranches) && (
        <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 z-20 bg-black">
          {hasBranches && <GitMerge size={10} className="text-[#8b5cf6]" />}
          {isHead && isCurrent ? (
            <span className="text-[#6366f1]">HEAD</span>
          ) : isCurrent ? (
            <span className="text-[#f59e0b]">VIEWING</span>
          ) : isHead ? (
            <span className="text-[#666]">LATEST</span>
          ) : null}
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className={getTextClassName()}>{commit.message}</div>

          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#444]">
            <span className="font-mono">{commit.shortHash}</span>
            {commit.timestamp && (
              <>
                <span>•</span>
                <span>{new Date(commit.timestamp).toLocaleTimeString()}</span>
              </>
            )}
          </div>
        </div>

        <div className="relative z-20" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded hover:bg-[#1a1a1a] text-[#444] hover:text-white transition-colors"
          >
            <DotsIcon />
          </button>

          {showMenu && !isCurrent && (
            <div className="absolute right-0 top-full mt-1 w-36 py-1 bg-[#0a0a0a] border border-[#1f1f1f] rounded shadow-xl z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  handleCheckout();
                }}
                className="w-full px-2 py-1.5 text-left text-xs text-[#888] hover:text-white hover:bg-[#1a1a1a] flex items-center gap-2"
              >
                <Clock size={12} />
                Travel to this point
              </button>
            </div>
          )}
        </div>
      </div>

      {!isCurrent && (
        <div className="absolute inset-x-0 bottom-0 translate-y-full pt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="text-[10px] text-[#444] text-center">Click to time travel</div>
        </div>
      )}
    </div>
  );
}

function DotsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  );
}
