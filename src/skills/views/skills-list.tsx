import React from "react";
import { Skill } from "../skill";
import { Asterisk } from "lucide-react";
import { CreatedAt } from "../../utils/created-at";
import { routes } from "../../routes";

export function SkillsList({ skills }: { skills: Skill[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="text-gray-900 flex items-center gap-3">
          <Asterisk className="h-6 w-6 text-amber-500" />
          <h2 className="text-3xl font-bold font-mono">Skills</h2>
        </div>
        <a
          href={routes.skills.new.href()}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium underline hover:bg-indigo-50 hover:text-indigo-900 transition-colors px-3 py-2"
        >
          + New Skill
        </a>
      </div>
      {skills.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
          <p className="text-gray-600 mb-4">
            No skills yet. Create your first skill!
          </p>
          <a
            href={routes.skills.new.href()}
            className="inline-block px-6 py-2 bg-indigo-50 text-indigo-900 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Create Skill
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((skill) => (
            <a
              key={skill.id}
              href={routes.skills.show.href({ slug: skill.slug })}
              className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-slate-900">
                  {skill.name}
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                {skill.description.length > 200
                  ? skill.description.substring(0, 200) + "..."
                  : skill.description}
              </p>
              <div className="flex gap-4 text-sm text-gray-500 mb-3">
                <span>
                  {skill.files.length} file
                  {skill.files.length !== 1 ? "s" : ""}
                </span>
              </div>
              <CreatedAt date={skill.createdAt} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
