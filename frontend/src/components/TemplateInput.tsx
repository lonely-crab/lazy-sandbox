type TemplateInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TemplateInput({ value, onChange }: TemplateInputProps) {
  return (
    <label className="field">
      <span className="label">Шаблон</span>
      <textarea
        className="textarea code"
        rows={10}
        placeholder="Например: Hello {{name}} или Hello <%= name %>"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
