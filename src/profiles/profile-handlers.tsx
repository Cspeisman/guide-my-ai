import { Controller } from "@remix-run/fetch-router";
import { getUserContext } from "../auth/user-context";
import { Layout } from "../layouts/Layout";
import { routes } from "../routes";
import { render } from "../utils";
import { ProfilesRepository } from "./profiles-repository";
import { Index, New, Show } from "./views";

export const profileHandlers = (
  dependencies = { profilesRepository: new ProfilesRepository() }
) => {
  const { profilesRepository } = dependencies;
  const NotFoundComponent = (props: { id: string }) => (
    <Layout>
      <pre>
        Sorry we were unable to find profile with ID: {props.id} assigned to
        this user
      </pre>
    </Layout>
  );

  return {
    async index(context) {
      const user = getUserContext(context);
      const userProfiles = await profilesRepository.getProfilesByUserId(
        user.userId!
      );

      return render(<Index userProfiles={userProfiles} user={user} />);
    },
    async show(context) {
      const user = getUserContext(context);
      if (user.userId) {
        const profile = await profilesRepository.getProfileByIdAndUserId(
          context.params.id,
          user.userId
        );
        if (profile) {
          return render(
            <Show
              profile={profile}
              userName={user.userName}
              githubUrl={user.githubUrl}
              githubUsername={user.githubUsername}
            />
          );
        }
      }
      return render(<NotFoundComponent id={context.params.id} />);
    },
    new(context) {
      const user = getUserContext(context);
      return render(
        <New
          userName={user.userName}
          githubUrl={user.githubUrl}
          githubUsername={user.githubUsername}
        />
      );
    },
    async create(context) {
      const user = getUserContext(context);
      const formData = await context.request.formData();
      const name = formData.get("name");

      if (!name || typeof name !== "string") {
        return new Response("Name is required", { status: 400 });
      }

      const profile = await profilesRepository.createProfile({
        name,
        userId: user.userId!,
      });

      return Response.redirect(
        routes.profiles.edit.href({ id: profile.id }),
        303
      );
    },
    edit(context) {
      const user = getUserContext(context);
      return render(
        <Layout
          assets={{ scripts: [routes.js.href({ path: "edit-form" })] }}
          activeNav="profiles"
          user={user}
        />
      );
    },
    async destroy(context) {
      const user = getUserContext(context);

      const formData = await context.request.formData();
      const method = formData.get("_method");

      // Validate that the _method field is DELETE
      if (method !== "DELETE") {
        return new Response("Method not allowed", { status: 405 });
      }

      if (user.userId) {
        const profile = await profilesRepository.getProfileByIdAndUserId(
          context.params.id,
          user.userId
        );

        if (profile) {
          // Delete the profile
          await profilesRepository.deleteProfile(profile.id);

          // Redirect to profiles index
          return Response.redirect(routes.profiles.index.href(), 303);
        }
      }

      return render(<NotFoundComponent id={context.params.id} />);
    },
    api: {
      async index(context) {
        const user = getUserContext(context);
        const userProfiles = await profilesRepository.getProfilesByUserId(
          user.userId!
        );

        return Response.json(
          userProfiles.map((p) => ({
            id: p.id,
            name: p.name,
            userId: p.userId,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            rules: p.rules,
            mcps: p.mcps,
          }))
        );
      },
      edit: {
        async index(context) {
          const user = getUserContext(context);
          if (user.userId) {
            const profile = await profilesRepository.getProfileByIdAndUserId(
              context.params?.id,
              user.userId!
            );
            if (profile) {
              return Response.json({
                id: profile.id,
                name: profile.name,
                userId: profile.userId,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt,
                rules: profile.rules,
                mcps: profile.mcps,
              });
            }
          }
          return Response.json(
            { msg: "unable to find the resource for current user" },
            { status: 404 }
          );
        },
        async action(context) {
          const user = getUserContext(context);
          if (user.userId) {
            const existProfile =
              await profilesRepository.getProfileByIdAndUserId(
                context.params.id,
                user.userId
              );
            if (existProfile) {
              const body = await context.request.json();
              const { name, ruleIds, mcpIds } = body;
              if (name && name !== existProfile.name) {
                existProfile.name = name;
                await profilesRepository.updateProfile(existProfile);
              }

              // Update associations
              await profilesRepository.updateProfileAssociations(
                existProfile.id,
                ruleIds,
                mcpIds
              );

              const updatedProfile =
                await profilesRepository.getProfileByIdAndUserId(
                  existProfile.id,
                  user.userId
                );
              if (updatedProfile) {
                return Response.json({
                  id: updatedProfile.id,
                  name: updatedProfile.name,
                  userId: updatedProfile.userId,
                  createdAt: updatedProfile.createdAt,
                  updatedAt: updatedProfile.updatedAt,
                  rules: updatedProfile.rules,
                  mcps: updatedProfile.mcps,
                });
              }
            }
          }
          return Response.json(
            { msg: "unable to update profile" },
            { status: 404 }
          );
        },
      },
    },
  } satisfies Controller<typeof routes.profiles>;
};
