import { Download, ChevronDown } from "lucide-react";

export function IdeDownloadMenu() {
  return (
    <details className="group relative w-full">
      <summary className="list-none cursor-pointer flex items-center justify-between gap-3 px-4 py-3 text-xs text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all w-full [&::-webkit-details-marker]:hidden bg-white">
        <div className="flex items-center gap-3">
          <Download size={16} />
          <span>Download extension</span>
        </div>
        <ChevronDown
          size={14}
          className="text-gray-500 transition-transform group-open:rotate-180"
        />
      </summary>
      {/* Dropdown Menu */}
      <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden py-1 z-50">
        <a
          href="vscode:extension/GuideMyAI.guide-my-ai-extension"
          className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-indigo-600 truncate"
        >
          For VS Code
        </a>
        <a
          href="cursor:extension/GuideMyAI.guide-my-ai-extension"
          className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-indigo-600 truncate"
        >
          For Cursor
        </a>
        <a
          href="antigravity:extension/GuideMyAI.guide-my-ai-extension"
          className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-indigo-600 truncate"
        >
          For Antigravity
        </a>
      </div>
    </details>
  );
}
