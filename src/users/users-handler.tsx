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
import { UserSettings } from "./views/user-settings";

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
      async profiles(context) {
        const matches = routes.users.api.profiles.match(context.request.url);
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
      async profile(context) {
        const matches = routes.users.api.profile.match(context.request.url);
        const userName = matches?.params.user;
        const slug = matches?.params.slug;
        if (!userName || !slug) {
          return Response.json(
            { error: "Missing required information" },
            { status: 400 }
          );
        }
        const user = await usersRepository.getUserByUsername(userName);
        if (user) {
          const profile = await profilesRepository.getProfileBySlugAndUserId(
            slug,
            user.id
          );
          const { userId, ...rest } = profile?.toJson() ?? { userId: null };
          return Response.json(rest);
        }
        return Response.json(
          { msg: `No profle matching the requested data` },
          { status: 404 }
        );
      },
      async rule(context) {
        const matches = routes.users.api.rule.match(context.request.url);
        const userName = matches?.params.user;
        const slug = matches?.params.slug;
        if (!userName || !slug) {
          return Response.json(
            { error: "Missing required information" },
            { status: 400 }
          );
        }
        const user = await usersRepository.getUserByUsername(userName);
        if (user) {
          const rule = await rulesRepository.getRuleBySlugAndUserId(
            slug,
            user.id
          );
          const { userId, ...rest } = rule?.toJson() ?? { userId: null };
          return Response.json(rest);
        }
        return Response.json(
          { msg: `No slug matching the requested data` },
          { status: 404 }
        );
      },
      async mcp(context) {
        const matches = routes.users.api.mcp.match(context.request.url);
        const userName = matches?.params.user;
        const slug = matches?.params.slug;
        if (!userName || !slug) {
          return Response.json(
            { error: "Missing required information" },
            { status: 400 }
          );
        }
        const user = await usersRepository.getUserByUsername(userName);
        if (user) {
          const mcp = await mcpsRepository.getMcpBySlugAndUserId(slug, user.id);
          const { userId, ...rest } = mcp?.toJson() ?? { userId: null };
          return Response.json(rest);
        }
        return Response.json(
          { msg: `No mcp matching the requested data` },
          { status: 404 }
        );
      },
    },
    settings: {
      async index(context) {
        const currentUser = getUserContext(context);

        if (currentUser?.userId) {
          const user = await usersRepository.getUserById(currentUser.userId);
          if (user) {
            return render(<UserSettings user={user} />);
          }
        }

        return Response.redirect(routes.auth.login.index.href(), 302);
      },
      async action(context) {
        const currentUser = getUserContext(context);

        if (!currentUser?.userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await context.request.formData();
        const newName = formData.get("name");
        const isPrivate = formData.get("private") === "on";
        const user = await usersRepository.getUserById(currentUser.userId);

        if (user) {
          if (!newName || typeof newName !== "string") {
            return render(
              <UserSettings user={user} error="Username is required" />
            );
          }

          const trimmedName = newName.trim();

          // Check if username contains only valid characters (alphanumeric, dash, underscore)
          if (!/^[a-zA-Z0-9_-]+$/.test(trimmedName)) {
            return render(
              <UserSettings
                user={user}
                error="Username can only contain letters, numbers, dashes, and underscores"
              />
            );
          }

          // Check if username is taken
          const isTaken = await usersRepository.isUsernameTaken(
            trimmedName,
            currentUser.userId
          );

          if (isTaken) {
            return render(
              <UserSettings
                user={user}
                error="This username is already taken"
              />
            );
          }

          // Update the username and privacy settings
          await usersRepository.updateUser(currentUser.userId, {
            name: trimmedName,
            private: isPrivate,
          });
          return Response.redirect(
            routes.users.show.href({ user: trimmedName.toLowerCase() }),
            302
          );
        }
        const id = routes.users.settings.action.match(context.url)?.params.id;
        if (id) {
          return Response.redirect(routes.users.settings.index.href({ id }));
        }
        return Response.redirect(routes.home.href());
      },
    },
  } satisfies Controller<typeof routes.users>;
};
