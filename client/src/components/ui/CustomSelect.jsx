import { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

/**
 * CustomSelect — a fully themed custom dropdown that replaces native <select>.
 *
 * Supports both controlled (value + onChange) and uncontrolled (react-hook-form
 * register) usage. A hidden native <select> is rendered for form compatibility.
 */
export const CustomSelect = forwardRef(function CustomSelect(
  {
    options: optionsProp,
    value: controlledValue,
    onChange,
    onBlur,
    name,
    label,
    error,
    placeholder,
    className = '',
    disabled = false,
    children,
    size = 'default',
    ...rest
  },
  ref,
) {
  // Internal state for uncontrolled mode (when value prop is undefined)
  const [internalValue, setInternalValue] = useState('');
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const hiddenSelectRef = useRef(null);

  // Merge forwarded ref with internal ref
  const setRefs = useCallback(
    (node) => {
      hiddenSelectRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  // Sync internal value from hidden select (for react-hook-form resets)
  useEffect(() => {
    if (!isControlled && hiddenSelectRef.current) {
      setInternalValue(hiddenSelectRef.current.value);
    }
  });

  // Extract options from children or options prop
  const options = (() => {
    if (optionsProp) return optionsProp;
    if (!children) return [];
    const items = [];
    const extractFromChild = (child) => {
      if (!child) return;
      if (Array.isArray(child)) {
        child.forEach(extractFromChild);
        return;
      }
      if (child.type === 'option') {
        items.push({
          value: child.props.value ?? '',
          label:
            typeof child.props.children === 'string'
              ? child.props.children
              : String(child.props.children ?? child.props.value ?? ''),
        });
      }
    };
    const childArray = Array.isArray(children) ? children : [children];
    childArray.forEach(extractFromChild);
    return items;
  })();

  const selectedOption = options.find((opt) => String(opt.value) === String(currentValue ?? ''));
  const displayLabel = selectedOption?.label || placeholder || 'Select...';
  const hasValue = selectedOption && selectedOption.value !== '';

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onBlur]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onBlur]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-option]');
    items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, isOpen]);

  const selectValue = (newValue) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }

    // Trigger change on hidden select for react-hook-form
    if (hiddenSelectRef.current) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        'value',
      )?.set;
      nativeInputValueSetter?.call(hiddenSelectRef.current, newValue);
      hiddenSelectRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
    onChange?.(newValue);
    setIsOpen(false);
    onBlur?.();
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(
            options.findIndex((opt) => String(opt.value) === String(currentValue ?? '')),
          );
        } else if (highlightedIndex >= 0) {
          selectValue(options[highlightedIndex].value);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(
            options.findIndex((opt) => String(opt.value) === String(currentValue ?? '')),
          );
        } else {
          setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          onBlur?.();
        }
        break;
      default:
        // Type-ahead search
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          clearTimeout(searchTimeoutRef.current);
          const query = searchQuery + event.key.toLowerCase();
          setSearchQuery(query);
          searchTimeoutRef.current = setTimeout(() => setSearchQuery(''), 600);

          const matchIndex = options.findIndex((opt) =>
            opt.label.toLowerCase().startsWith(query),
          );
          if (matchIndex >= 0) {
            if (isOpen) {
              setHighlightedIndex(matchIndex);
            } else {
              selectValue(options[matchIndex].value);
            }
          }
        }
        break;
    }
  };

  const isCompact = size === 'compact';

  return (
    <div className={`relative ${label ? 'block' : ''} ${className}`} ref={containerRef}>
      {label ? (
        <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      ) : null}

      {/* Hidden native select for form compatibility */}
      <select
        ref={setRefs}
        name={name}
        value={currentValue ?? ''}
        onChange={(e) => {
          if (!isControlled) setInternalValue(e.target.value);
          onChange?.(e.target.value);
        }}
        onBlur={onBlur}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Custom trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            if (!isOpen) {
              setHighlightedIndex(
                options.findIndex((opt) => String(opt.value) === String(currentValue ?? '')),
              );
            }
          }
        }}
        onKeyDown={handleKeyDown}
        className={`
          group flex w-full items-center justify-between
          ${isCompact ? 'rounded-2xl px-4 py-3' : 'rounded-xl px-4 py-3'}
          border bg-slate-950/50 text-left text-sm outline-none
          transition-all duration-200
          ${
            isOpen
              ? 'border-cyan-400/60 shadow-[0_0_0_2px_rgba(79,209,197,0.2)] bg-slate-900/80'
              : 'border-white/10 hover:border-white/20 hover:bg-slate-950/70'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${error ? 'border-rose-400/50' : ''}
        `}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span
          className={`truncate ${hasValue ? 'text-slate-100' : 'text-slate-500'}`}
        >
          {displayLabel}
        </span>
        <ChevronDownIcon
          className={`
            ml-2 h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-300 ease-out
            ${isOpen ? 'rotate-180 text-cyan-400' : 'group-hover:text-slate-300'}
          `}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="
            absolute z-50 mt-2 w-full
            animate-dropdown-in
            overflow-hidden rounded-2xl
            border border-white/10
            bg-slate-900/95 backdrop-blur-xl
            shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(79,209,197,0.08)]
          "
          role="listbox"
        >
          <div
            ref={listRef}
            className="max-h-64 overflow-y-auto py-1.5 scrollbar-thin"
          >
            {options.map((opt, index) => {
              const isSelected = String(opt.value) === String(currentValue ?? '');
              const isHighlighted = index === highlightedIndex;
              return (
                <button
                  key={`${opt.value}-${index}`}
                  type="button"
                  data-option
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectValue(opt.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm
                    transition-all duration-100
                    ${
                      isHighlighted
                        ? 'bg-cyan-400/10 text-white'
                        : isSelected
                          ? 'bg-white/5 text-cyan-300'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <span className="flex-1 truncate">{opt.label}</span>
                  {isSelected && (
                    <CheckIcon className="h-4 w-4 flex-shrink-0 text-cyan-400" />
                  )}
                </button>
              );
            })}

            {options.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                No options available
              </div>
            )}
          </div>
        </div>
      )}

      {error ? (
        <span className="mt-2 block text-xs text-rose-300">{error}</span>
      ) : null}
    </div>
  );
});
