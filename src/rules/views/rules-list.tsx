import React from "react";
import { Rule } from "../rule";
import { FileCode } from "lucide-react";
import { CreatedAt } from "../../utils/created-at";
import { routes } from "../../routes";

export function RulesList({ rules }: { rules: Rule[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="text-gray-900 flex items-center gap-3">
          <FileCode className="h-6 w-6 text-blue-500" />
          <h2 className="text-3xl font-bold font-mono">Rules</h2>
        </div>
        <a
          href={routes.rules.new.href()}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium underline hover:bg-indigo-50 hover:text-indigo-900 transition-colors px-3 py-2"
        >
          + New Rule
        </a>
      </div>
      {rules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
          <p className="text-gray-600 mb-4">
            No rules yet. Create your first rule!
          </p>
          <a
            href={routes.rules.new.href()}
            className="inline-block px-6 py-2 bg-indigo-50 text-indigo-900 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            Create Rule
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <a
              key={rule.id}
              href={routes.rules.show.href({ id: rule.id })}
              className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-slate-900">
                  {rule.name}
                </h3>
              </div>
              <p className="bg-gray-50 whitespace-pre-wrap font-mono text-sm p-4 rounded-lg">
                {rule.content.length > 200
                  ? rule.content.substring(0, 200) + "..."
                  : rule.content}
              </p>
              <CreatedAt date={rule.createdAt} className="mt-4" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
