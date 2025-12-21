import { Controller } from "@remix-run/fetch-router";
import React from "react";
import { userIdKey } from "../auth/auth-middleware";
import { Layout } from "../layouts/Layout";
import { routes } from "../routes";
import { render } from "../utils";
import { ProfilesRepository } from "./profiles-repository";
import { Index, New, Show } from "./views";

export const profileHandlers = (
  dependencies = { profilesRepository: new ProfilesRepository() }
) => {
  const { profilesRepository } = dependencies;
  return {
    async index(context) {
      const userId = context.storage.get(userIdKey);
      const userProfiles = await profilesRepository.getProfilesByUserId(
        userId!
      );

      return render(<Index userProfiles={userProfiles} />);
    },
    async show(context) {
      const id = context.params.id;
      const profile = await profilesRepository.getProfileById(id);

      if (!profile) {
        return new Response("Profile not found", { status: 404 });
      }

      return render(<Show profile={profile} />);
    },
    new() {
      return render(<New />);
    },
    async create(context) {
      const userId = context.storage.get(userIdKey);
      const formData = await context.request.formData();
      const name = formData.get("name");

      if (!name || typeof name !== "string") {
        return new Response("Name is required", { status: 400 });
      }

      const profile = await profilesRepository.createProfile({
        name,
        userId: userId!,
      });

      return Response.redirect(
        routes.profiles.edit.href({ id: profile.id }),
        303
      );
    },
    async edit() {
      return render(
        <Layout
          assets={{ scripts: [routes.js.href({ path: "edit-form" })] }}
          activeNav="profiles"
        />
      );
    },
    async destroy(context) {
      const id = context.params.id;
      const userId = context.storage.get(userIdKey);

      // Parse the form data to check the _method field
      const formData = await context.request.formData();
      const method = formData.get("_method");

      // Validate that the _method field is DELETE
      if (method !== "DELETE") {
        return new Response("Method not allowed", { status: 405 });
      }

      // Get the profile to check ownership
      const profile = await profilesRepository.getProfileById(id);

      if (!profile) {
        return new Response("Profile not found", { status: 404 });
      }

      // Verify the user owns the profile
      if (profile.userId !== userId) {
        return new Response("Unauthorized", { status: 403 });
      }

      // Delete the profile
      await profilesRepository.deleteProfile(id);

      // Redirect to profiles index
      return Response.redirect(routes.profiles.index.href(), 303);
    },
    api: {
      async index(context) {
        const userId = context.storage.get(userIdKey);
        const userProfiles = await profilesRepository.getProfilesByUserId(
          userId!
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
          const id = context.params?.id;
          const profile = await profilesRepository.getProfileById(id);

          if (!profile) {
            return Response.json(
              { error: "Profile not found" },
              { status: 404 }
            );
          }

          return Response.json({
            id: profile.id,
            name: profile.name,
            userId: profile.userId,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
            rules: profile.rules,
            mcps: profile.mcps,
          });
        },
        async action(context) {
          const id = context.params?.id;
          const userId = context.storage.get(userIdKey);
          const body = await context.request.json();
          const { name, ruleIds, mcpIds } = body;
          if (!Array.isArray(ruleIds) || !Array.isArray(mcpIds)) {
            return Response.json(
              { error: "ruleIds and mcpIds must be arrays" },
              { status: 400 }
            );
          }

          let profileId: string;

          try {
            // If no id, create a new profile
            if (!id) {
              if (!name) {
                return Response.json(
                  { error: "Name is required when creating a profile" },
                  { status: 400 }
                );
              }
              const newProfile = await profilesRepository.createProfile({
                name,
                userId: userId!,
              });
              profileId = newProfile.id;
            } else {
              // If id exists, update the profile name if provided
              const existingProfile = await profilesRepository.getProfileById(
                id
              );

              if (!existingProfile) {
                return Response.json(
                  { error: "Profile not found" },
                  { status: 404 }
                );
              }

              if (name && name !== existingProfile.name) {
                existingProfile.name = name;
                await profilesRepository.updateProfile(existingProfile);
              }
              profileId = id;
            }

            // Update associations for both create and update cases
            await profilesRepository.updateProfileAssociations(
              profileId,
              ruleIds,
              mcpIds
            );

            // Fetch the updated profile
            const updatedProfile = await profilesRepository.getProfileById(
              profileId
            );

            if (!updatedProfile) {
              return Response.json(
                { error: "Profile not found" },
                { status: 404 }
              );
            }

            return Response.json({
              id: updatedProfile.id,
              name: updatedProfile.name,
              userId: updatedProfile.userId,
              createdAt: updatedProfile.createdAt,
              updatedAt: updatedProfile.updatedAt,
              rules: updatedProfile.rules,
              mcps: updatedProfile.mcps,
            });
          } catch (error: any) {
            // Handle unique constraint violation
            if (
              error?.code === "SQLITE_CONSTRAINT_UNIQUE" ||
              error?.message?.includes("UNIQUE constraint")
            ) {
              return Response.json(
                { error: "A profile with this name already exists" },
                { status: 409 }
              );
            }
            // Re-throw other errors
            throw error;
          }
        },
      },
    },
  } satisfies Controller<typeof routes.profiles>;
};
