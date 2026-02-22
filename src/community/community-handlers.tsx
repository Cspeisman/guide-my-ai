import { Controller } from "@remix-run/fetch-router";
import { getUserContext } from "../auth/user-context";
import { Layout } from "../layouts/Layout";
import { routes } from "../routes";
import { render } from "../utils";
import { ProfilesRepository } from "../profiles/profiles-repository";
import { RulesRepository } from "../rules/rules-repository";
import { McpsRepository } from "../mcps/mcps-repository";
import { SkillsRepository } from "../skills/skills-repository";

export const communityHandlers = (
  dependencies = {
    profilesRepository: new ProfilesRepository(),
    rulesRepository: new RulesRepository(),
    mcpsRepository: new McpsRepository(),
    skillsRepository: new SkillsRepository(),
  }
) => {
  const { profilesRepository, rulesRepository, mcpsRepository, skillsRepository } =
    dependencies;

  return {
    async index(context) {
      const user = getUserContext(context);
      return render(
        <Layout
          assets={{ scripts: [routes.js.href({ path: "community" })] }}
          activeNav="community"
          user={user}
        />
      );
    },
    api: {
      async index(context) {
        const url = new URL(context.request.url);
        const type = url.searchParams.get("type");

        if (type === "profiles") {
          // Get all profiles (we could add pagination later)
          // For now, we'll fetch a limited number
          const allProfiles = await profilesRepository.getAllProfiles();
          return Response.json(
            allProfiles.map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              userId: p.userId,
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
              rules: p.rules,
              mcps: p.mcps,
              userName: p.userName,
              communityDownloads: p.communityDownloads,
            }))
          );
        }

        if (type === "rules") {
          const allRules = await rulesRepository.getAllRules();
          return Response.json(allRules.map((r) => r.toJson()));
        }

        if (type === "mcps") {
          const allMcps = await mcpsRepository.getAllMcps();
          return Response.json(allMcps.map((m) => m.toJson()));
        }

        if (type === "skills") {
          const allSkills = await skillsRepository.getAllSkills();
          return Response.json(allSkills.map((s) => s.toJson()));
        }

        return Response.json({
          message: "Specify ?type=profiles|rules|mcps|skills",
        });
      },
    },
  } satisfies Controller<typeof routes.community>;
};
