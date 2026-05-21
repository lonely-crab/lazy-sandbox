import { useEffect, useId, useMemo, useRef, useState } from 'react';

import type { TemplateEngine } from '../types/template';

type TemplateSelectorProps = {
  value: TemplateEngine;
  onChange: (value: TemplateEngine) => void;
};

const OPTIONS: Array<{ value: TemplateEngine; label: string }> = [
  { value: 'handlebars', label: 'Handlebars' },
  { value: 'mustache', label: 'Mustache' },
  { value: 'ejs', label: 'EJS' },
];

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const labelId = useId();
  const buttonId = useId();
  const listboxId = useId();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedIndex = useMemo(
    () =>
      Math.max(
        0,
        OPTIONS.findIndex((option) => option.value === value),
      ),
    [value],
  );
  const selectedOption = OPTIONS[selectedIndex];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveIndex(selectedIndex);
    const selectedRef = optionRefs.current[selectedIndex];
    selectedRef?.focus();
  }, [isOpen, selectedIndex]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (option: TemplateEngine) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => {
        const next = (prev + 1) % OPTIONS.length;
        optionRefs.current[next]?.focus();
        return next;
      });
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => {
        const next = (prev - 1 + OPTIONS.length) % OPTIONS.length;
        optionRefs.current[next]?.focus();
        return next;
      });
    }

    if (event.key === 'Home') {
      event.preventDefault();
      optionRefs.current[0]?.focus();
      setActiveIndex(0);
    }

    if (event.key === 'End') {
      event.preventDefault();
      const lastIndex = OPTIONS.length - 1;
      optionRefs.current[lastIndex]?.focus();
      setActiveIndex(lastIndex);
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(OPTIONS[activeIndex].value);
    }
  };

  return (
    <div className="field select-wrapper" ref={wrapperRef}>
      <span className="label" id={labelId}>
        Шаблонизатор
      </span>
      <button
        className="select-trigger"
        type="button"
        id={buttonId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${labelId} ${buttonId}`}
        aria-controls={listboxId}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="select-value">{selectedOption.label}</span>
        <span className="select-chevron" aria-hidden="true" />
      </button>
      {isOpen ? (
        <div
          className="select-menu"
          role="listbox"
          id={listboxId}
          aria-labelledby={labelId}
          onKeyDown={handleMenuKeyDown}
        >
          {OPTIONS.map((option, index) => (
            <button
              key={option.value}
              className="select-option"
              role="option"
              type="button"
              aria-selected={option.value === value}
              tabIndex={index === activeIndex ? 0 : -1}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
