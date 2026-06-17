import { ChevronDown } from 'lucide-react';

export interface WorkspaceDocTitleProps {
  docName: string;
  isEditing: boolean;
  inputValue: string;
  onStartEdit: () => void;
  onInputChange: (value: string) => void;
  onSave: () => void;
  /** Border color when editing — workspace accent color */
  accentColor?: string;
}

/**
 * Editable document name field — used in the left sidebar header of
 * Design, Slides, Make, Buzz, and Site workspaces.
 *
 * Accent color controls the input border color during edit mode.
 */
export function WorkspaceDocTitle({
  docName,
  isEditing,
  inputValue,
  onStartEdit,
  onInputChange,
  onSave,
  accentColor = 'border-pink-500',
}: WorkspaceDocTitleProps) {
  if (isEditing) {
    return (
      <input
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onBlur={onSave}
        onKeyDown={(e) => e.key === 'Enter' && onSave()}
        className={`bg-[#2c2c2c] text-white px-2 py-0.5 rounded ${accentColor} text-xs focus:outline-none w-36 font-semibold`}
        autoFocus
      />
    );
  }

  return (
    <button
      type="button"
      onClick={onStartEdit}
      className="text-xs font-bold text-white hover:bg-[#2c2c2c] px-1.5 py-1 rounded flex items-center gap-1 transition-colors truncate font-outfit max-w-[80%]"
      title="Rename Document"
    >
      <span className="truncate">{docName}</span>
      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
    </button>
  );
}
