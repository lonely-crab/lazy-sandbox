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
  return (
    <label className="field">
      <span className="label">Template engine</span>
      <select
        className="select"
        value={value}
        onChange={(event) => onChange(event.target.value as TemplateEngine)}
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
