import { Mcp } from "../mcps/mcp";
import { Rule } from "../rules/rule";
import { Skill } from "../skills/skill";

export class Profile {
  constructor(
    public id: string,
    public name: string,
    public slug: string,
    public userId: string,
    public createdAt: Date,
    public updatedAt: Date,
    public rules: Array<Rule> = [],
    public mcps: Array<Mcp> = [],
    public skills: Array<Skill> = [],
    public userName?: string,
    public communityDownloads: number = 0
  ) {}

  static fromPayload(obj: {
    id: string;
    name: string;
    slug: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    rules: Array<ReturnType<Rule["toJson"]>>;
    mcps: Array<ReturnType<Mcp["toJson"]>>;
    skills?: Array<ReturnType<Skill["toJson"]>>;
    userName?: string;
    communityDownloads?: number;
  }): Profile {
    return new Profile(
      obj.id,
      obj.name,
      obj.slug,
      obj.userId,
      obj.createdAt,
      obj.updatedAt,
      obj.rules.map((rule) => Rule.fromPayload(rule)),
      obj.mcps.map((mcp) => Mcp.fromPayload(mcp)),
      (obj.skills ?? []).map((skill) => Skill.fromPayload(skill)),
      obj.userName,
      obj.communityDownloads ?? 0
    );
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      rules: this.rules.map((rule) => rule.toJson()),
      mcps: this.mcps.map((mcp) => mcp.toJson()),
      skills: this.skills.map((skill) => skill.toJson()),
      userName: this.userName,
      communityDownloads: this.communityDownloads,
    };
  }
}
