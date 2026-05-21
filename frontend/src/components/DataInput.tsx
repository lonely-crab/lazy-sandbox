type DataInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DataInput({ value, onChange }: DataInputProps) {
  return (
    <label className="field">
      <span className="label">JSON data</span>
      <textarea
        className="textarea code"
        rows={10}
        placeholder='Example: { "name": "John" }'
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
