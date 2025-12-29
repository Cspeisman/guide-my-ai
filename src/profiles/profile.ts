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
}
