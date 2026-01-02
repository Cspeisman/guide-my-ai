import { Controller, RequestContext } from "@remix-run/fetch-router";
import { Layout } from "../layouts/Layout";
import { routes } from "../routes";
import { render } from "../utils";
import { UsersRepository } from "./users-repository";
import { ProfilesRepository } from "../profiles/profiles-repository";
import { RulesRepository } from "../rules/rules-repository";
import { McpsRepository } from "../mcps/mcps-repository";
import { UserProfile } from "./views/user-profile";
import { getUserContext } from "../auth/user-context";
import { UserResource } from "./views/user-rule";
import { UserDashboard } from "./views/user-dashboard";

export const usersHandler = (
  dependencies = {
    usersRepository: new UsersRepository(),
    profilesRepository: new ProfilesRepository(),
    rulesRepository: new RulesRepository(),
    mcpsRepository: new McpsRepository(),
  }
) => {
  const {
    usersRepository,
    profilesRepository,
    rulesRepository,
    mcpsRepository,
  } = dependencies;

  const NotFoundComponent = (props: { id: string; type: string }) => (
    <Layout>
      <pre>
        Sorry we were unable to find {props.type} with ID: {props.id}
      </pre>
    </Layout>
  );

  return {
    async show(context: RequestContext) {
      const matches = routes.users.show.match(context.request.url);
      const userName = matches?.params.user;

      if (!userName) {
        return Response.json(
          { error: "Username is required" },
          { status: 400 }
        );
      }
      const result = await usersRepository.getProfilesByUsername(userName);
      const { userId, profiles } = result ?? { userId: null, profiles: [] };

      // Get the user to access GitHub profile info
      const user = await usersRepository.getUserByUsername(userName);

      // Query rules and MCPs directly from their repositories using userId
      const userRules = userId
        ? await rulesRepository.getRulesByUserId(userId)
        : [];
      const userMcps = userId
        ? await mcpsRepository.getMcpsByUserId(userId)
        : [];
      const currentUser = getUserContext(context);
      return render(
        <UserDashboard
          userName={userName}
          user={user}
          profiles={profiles}
          userRules={userRules}
          userMcps={userMcps}
          currentUser={currentUser}
        />
      );
    },
    async profile(context) {
      const matches = routes.users.profile.match(context.request.url);
      const userName = matches?.params.user;
      const slug = matches?.params.slug;
      if (userName && slug) {
        const user = await usersRepository.getUserByUsername(userName);
        if (user) {
          const profile = await profilesRepository.getProfileBySlugAndUserId(
            slug,
            user.id
          );
          if (profile) {
            const currentUser = getUserContext(context);
            return render(
              <UserProfile
                profile={profile}
                user={user}
                currentUser={currentUser ?? {}}
              />
            );
          }
        }
      }
      return render(<NotFoundComponent id={slug ?? ""} type="profile" />);
    },
    async rule(context) {
      const matches = routes.users.rule.match(context.request.url);
      const userName = matches?.params.user;
      const slug = matches?.params.slug;
      if (userName && slug) {
        const user = await usersRepository.getUserByUsername(userName);
        if (user) {
          const rule = await rulesRepository.getRuleBySlugAndUserId(
            slug,
            user.id
          );
          if (rule) {
            const currentUser = getUserContext(context);
            return render(
              <UserResource
                name={rule.name}
                content={rule.content}
                createdAt={rule.createdAt}
                currentUser={currentUser ?? {}}
                userName={user.name}
              />
            );
          }
        }
      }
      return render(<NotFoundComponent id={slug ?? ""} type="rule" />);
    },
    async mcp(context) {
      const matches = routes.users.mcp.match(context.request.url);
      const userName = matches?.params.user;
      const slug = matches?.params.slug;
      if (userName && slug) {
        const user = await usersRepository.getUserByUsername(userName);
        if (user) {
          const mcp = await mcpsRepository.getMcpBySlugAndUserId(slug, user.id);
          if (mcp) {
            const currentUser = getUserContext(context);
            return render(
              <UserResource
                name={mcp.name}
                content={mcp.context}
                createdAt={mcp.createdAt}
                currentUser={currentUser ?? {}}
                userName={user.name}
              />
            );
          }
        }
      }
      return render(<NotFoundComponent id={slug ?? ""} type="mcp" />);
    },
    api: {
      async show(context) {
        const matches = routes.users.api.show.match(context.request.url);
        const userName = matches?.params.user;

        if (!userName) {
          return Response.json(
            { error: "Username is required" },
            { status: 400 }
          );
        }

        // Get user information
        const user = await usersRepository.getUserByUsername(userName);

        if (!user) {
          return Response.json(
            { error: `User '${userName}' not found` },
            { status: 404 }
          );
        }

        // Get all profiles with their rules and mcps
        const result = await usersRepository.getProfilesByUsername(userName);
        const { profiles } = result ?? { profiles: [] };

        return Response.json(profiles.map((p) => p.toJson()));
      },
    },
  } satisfies Controller<typeof routes.users>;
};
