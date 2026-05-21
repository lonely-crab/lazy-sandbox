type TemplateInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TemplateInput({ value, onChange }: TemplateInputProps) {
  return (
    <label className="field">
      <span className="label">Template</span>
      <textarea
        className="textarea code"
        rows={10}
        placeholder="Enter template markup"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
