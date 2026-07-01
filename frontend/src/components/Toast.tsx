import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

interface ToastProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  onClose: () => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const bgColors = {
  success: "bg-green-50 border-green-200",
  error: "bg-red-50 border-red-200",
  warning: "bg-yellow-50 border-yellow-200",
  info: "bg-blue-50 border-blue-200",
};

const textColors = {
  success: "text-green-800",
  error: "text-red-800",
  warning: "text-yellow-800",
  info: "text-blue-800",
};

export default function Toast({ type, title, message, onClose }: ToastProps) {
  const Icon = icons[type];
  return (
    <div
      className={`flex items-start p-4 rounded-lg border shadow-lg animate-slide-in ${bgColors[type]}`}
    >
      <Icon className={`h-5 w-5 mt-0.5 ${textColors[type]}`} />
      <div className="ml-3 flex-1">
        <p className={`text-sm font-medium ${textColors[type]}`}>{title}</p>
        {message && <p className="mt-1 text-sm text-gray-600">{message}</p>}
      </div>
      <button onClick={onClose} className={`ml-4 ${textColors[type]} hover:opacity-70`}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}