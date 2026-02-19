import { useEffect, useRef, useState } from 'react';
import { Clock, GitMerge } from 'lucide-react';
import { COMMIT_WIDTH, HORIZONTAL_SPACING, VERTICAL_SPACING } from './TimelinePanel';

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
    const base = 'relative px-4 py-3.5 rounded-lg border-2 shadow-lg transition-all duration-200 cursor-pointer group';
    const checkingOut = isCheckingOut ? 'opacity-50 pointer-events-none' : '';

    let stateStyle = '';
    if (isHead && isCurrent) {
      stateStyle = 'border-sky-500/60 bg-gradient-to-br from-sky-500/15 to-sky-600/10';
    } else if (isCurrent) {
      stateStyle = 'border-amber-500/60 bg-gradient-to-br from-amber-500/15 to-amber-600/10';
    } else if (isHead) {
      stateStyle = 'border-neutral-600/50 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 hover:border-neutral-500/50';
    } else {
      stateStyle = 'border-neutral-700/30 bg-gradient-to-br from-neutral-900/30 to-neutral-900/50 hover:border-neutral-600/40';
    }

    return `${base} ${stateStyle} ${checkingOut}`;
  };

  const getTextClassName = () => {
    const base = 'font-medium text-sm';
    if (isHead && isCurrent) return `${base} text-sky-200`;
    if (isCurrent) return `${base} text-amber-200`;
    return `${base} text-neutral-300 group-hover:text-neutral-200`;
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
        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-medium border shadow-lg flex items-center gap-1 z-20">
          {hasBranches && <GitMerge size={12} className="text-indigo-400" />}
          {isHead && isCurrent ? (
            <Badge text="HEAD" bgClass="bg-sky-500/20" borderClass="border-sky-500/50" textClass="text-sky-300" />
          ) : isCurrent ? (
            <Badge text="VIEWING" bgClass="bg-amber-500/20" borderClass="border-amber-500/50" textClass="text-amber-300" />
          ) : isHead ? (
            <Badge text="LATEST" bgClass="bg-neutral-700/20" borderClass="border-neutral-600/50" textClass="text-neutral-400" />
          ) : null}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className={getTextClassName()}>{commit.message}</div>

          <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
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
            className="p-1.5 rounded hover:bg-neutral-700/50 text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <DotsIcon />
          </button>

          {showMenu && !isCurrent && (
            <div className="absolute right-0 top-full mt-1 w-48 py-1 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  handleCheckout();
                }}
                className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
              >
                <Clock size={14} />
                Travel to this point
              </button>
            </div>
          )}
        </div>
      </div>

      {!isCurrent && (
        <div className="absolute inset-x-0 bottom-0 translate-y-full pt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="text-xs text-neutral-500 text-center">Click to time travel</div>
        </div>
      )}
    </div>
  );
}

function Badge({ text, bgClass, borderClass, textClass }) {
  return (
    <div className={`${bgClass} ${borderClass} backdrop-blur-sm px-2 py-0.5 rounded-full ${textClass}`}>
      {text}
    </div>
  );
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  );
}
