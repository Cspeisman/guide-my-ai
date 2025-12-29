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

      {/* Invisible overlay to close menu when clicking outside - purely CSS trick utilizing focus/blur behavior often requires tabindex, 
          but for pure details/summary, clicking outside doesn't auto-close without JS. 
          However, usually clicking the summary again toggles it. 
          The Request was "css only? no client side javascript". 
          Standard behavior for details is it stays open until toggled. 
          If a "click outside to close" is strictly needed without JS, it's very hacky (e.g. peer inputs).
          I will stick to the standard details behavior as requested.
      */}
    </details>
  );
}
