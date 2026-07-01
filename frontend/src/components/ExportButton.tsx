import { useState, useRef, useEffect } from 'react';
import { FileDown, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';

interface ExportButtonProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  disabled?: boolean;
  label?: string;
}

export default function ExportButton({
  onExportPDF,
  onExportExcel,
  disabled = false,
  label = 'Exportar',
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="btn btn-secondary flex items-center gap-2"
      >
        <FileDown className="h-4 w-4" />
        <span>{label}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 animate-fade-in">
          <button
            onClick={() => {
              onExportPDF();
              setOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileText className="h-4 w-4 text-red-500" />
            Exportar PDF
          </button>
          <button
            onClick={() => {
              onExportExcel();
              setOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            Exportar Excel
          </button>
        </div>
      )}
    </div>
  );
}