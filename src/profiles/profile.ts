import { Mcp } from "../mcps/mcp";
import { Rule } from "../rules/rule";

export class Profile {
  constructor(
    public id: string,
    public name: string,
    public userId: string,
    public createdAt: Date,
    public updatedAt: Date,
    public rules: Array<Rule> = [],
    public mcps: Array<Mcp> = []
  ) {}

  toJson() {
    return {
      id: this.id,
      name: this.name,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      rules: this.rules.map((rule) => rule.toJson()),
      mcps: this.mcps.map((mcp) => mcp.toJson()),
    };
  }
}
