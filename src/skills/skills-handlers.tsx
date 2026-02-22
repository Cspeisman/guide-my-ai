import { Controller } from "@remix-run/fetch-router";
import React from "react";
import { getUserContext } from "../auth/user-context";
import { Layout } from "../layouts/Layout";
import { routes } from "../routes";
import { render } from "../utils";
import { Skill } from "./skill";
import { SkillsRepository } from "./skills-repository";
import { validateSkill } from "./utils/validate-skill";
import { SkillsList } from "./views/skills-list";
import { New } from "./views/new";

export const skillsHandlers = (
  dependecies = { skillsRepository: new SkillsRepository() }
) => {
  const { skillsRepository } = dependecies;
  const NotFoundComponent = (props: { id: string }) => (
    <Layout>
      <pre>
        Sorry we were unable to find skill with ID: {props.id} assigned to this
        user.
      </pre>
    </Layout>
  );

  return {
    async index(context) {
      const user = getUserContext(context);
      const userSkills = await skillsRepository.getSkillsByUserId(
        user.userId!
      );

      return render(
        <Layout activeNav="skills" user={user}>
          <SkillsList skills={userSkills} />
        </Layout>
      );
    },
    async show(context) {
      const user = getUserContext(context);
      if (user.userId) {
        const skill = await skillsRepository.getSkillBySlugAndUserId(
          context.params.slug,
          user.userId
        );
        if (skill) {
          return render(
            <Layout
              assets={{ scripts: [routes.js.href({ path: "skill" })] }}
              user={user}
            />
          );
        }
      }
      return render(<NotFoundComponent id={context.params.slug} />);
    },
    new(context) {
      const user = getUserContext(context);
      return render(<New user={user} />);
    },
    async create(context) {
      const formData = await context.request.formData();
      const name = formData.get("name");
      const description = formData.get("description");
      const content = formData.get("content") ?? "";

      const validation = validateSkill({
        name: name?.toString(),
        description: description?.toString(),
      });
      if (!validation.valid) {
        return Response.json({ error: validation.error }, { status: 400 });
      }

      const user = getUserContext(context);

      if (!user.userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      await skillsRepository.createSkill({
        name: name!.toString(),
        description: description!.toString(),
        content: content.toString(),
        userId: user.userId,
      });

      return Response.redirect(routes.skills.index.href(), 302);
    },
    async destroy(context) {
      const user = getUserContext(context);

      const formData = await context.request.formData();
      const method = formData.get("_method");

      if (method !== "DELETE") {
        return new Response("Method not allowed", { status: 405 });
      }

      if (user.userId) {
        const skill = await skillsRepository.getSkillByIdAndUserId(
          context.params.id,
          user.userId
        );

        if (skill) {
          await skillsRepository.deleteSkill(skill.id, skill.userId);
          return Response.redirect(routes.skills.index.href(), 303);
        }
      }

      return render(<NotFoundComponent id={context.params.id} />);
    },
    api: {
      async index(context) {
        const user = getUserContext(context);
        const userSkills = await skillsRepository.getSkillsByUserId(
          user.userId!
        );

        return Response.json(userSkills.map((skill) => skill.toJson()));
      },
      show: {
        async index(context) {
          const user = getUserContext(context);
          if (user.userId) {
            const skill = await skillsRepository.getSkillBySlugAndUserId(
              context.params?.slug!,
              user.userId
            );
            if (skill) {
              return Response.json(skill.toJson());
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
            const currentSkill =
              await skillsRepository.getSkillBySlugAndUserId(
                context.params.slug,
                user.userId
              );
            if (currentSkill) {
              const body = await context.request.json();

              // Handle file add
              if (body.addFile) {
                const { fileName, fileContent } = body.addFile;
                await skillsRepository.addFileToSkill(
                  currentSkill.id,
                  fileName,
                  fileContent
                );
                const updatedSkill = await skillsRepository.getSkillByIdAndUserId(
                  currentSkill.id,
                  user.userId
                );
                return Response.json(updatedSkill?.toJson());
              }

              // Handle file update
              if (body.updateFile) {
                const { id: fileId, fileName, fileContent } = body.updateFile;
                await skillsRepository.updateFile(fileId, {
                  ...(fileName !== undefined && { fileName }),
                  ...(fileContent !== undefined && { fileContent }),
                });
                const updatedSkill = await skillsRepository.getSkillByIdAndUserId(
                  currentSkill.id,
                  user.userId
                );
                return Response.json(updatedSkill?.toJson());
              }

              // Handle file remove
              if (body.removeFileId) {
                await skillsRepository.removeFileFromSkill(body.removeFileId);
                const updatedSkill = await skillsRepository.getSkillByIdAndUserId(
                  currentSkill.id,
                  user.userId
                );
                return Response.json(updatedSkill?.toJson());
              }

              // Handle field updates
              const { name, description, content } = body;

              if (name !== undefined) {
                if (!name || typeof name !== "string") {
                  return Response.json(
                    { error: "Name is required" },
                    { status: 400 }
                  );
                }
              }

              if (description !== undefined) {
                if (!description || typeof description !== "string") {
                  return Response.json(
                    { error: "Description is required" },
                    { status: 400 }
                  );
                }
              }

              const updatedSkill = await skillsRepository.updateSkill(
                new Skill(
                  currentSkill.id,
                  name ?? currentSkill.name,
                  currentSkill.slug,
                  description ?? currentSkill.description,
                  content ?? currentSkill.content,
                  currentSkill.createdAt,
                  currentSkill.userId,
                  currentSkill.files
                )
              );

              return Response.json(updatedSkill.toJson());
            }
          }
          return Response.json(
            { msg: "unable to update skill" },
            { status: 404 }
          );
        },
      },
      async incrementDownloadCount(context) {
        const user = getUserContext(context);
        const skillId = context.params.id;

        const skill = await skillsRepository.getSkillById(skillId);

        if (!skill) {
          return Response.json({ msg: "Skill not found" }, { status: 404 });
        }

        if (user.userId && user.userId !== skill.userId) {
          await skillsRepository.incrementDownloadCount(skillId);
        }

        return Response.json({ success: true });
      },
    },
  } satisfies Controller<typeof routes.skills>;
};
