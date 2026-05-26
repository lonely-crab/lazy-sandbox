type RenderButtonProps = {
  disabled: boolean;
  onClick: () => void;
};

export function RenderButton({ disabled, onClick }: RenderButtonProps) {
  return (
    <button className="button" type="button" onClick={onClick} disabled={disabled}>
      Рендер
    </button>
  );
}
