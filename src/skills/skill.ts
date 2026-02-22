export interface SkillFile {
  id: string;
  fileName: string;
  fileContent: string;
  createdAt: Date;
}

export class Skill {
  constructor(
    public id: string,
    public name: string,
    public slug: string,
    public description: string,
    public content: string,
    public createdAt: Date,
    public userId: string,
    public files: SkillFile[] = [],
    public userName?: string,
    public communityDownloads?: number
  ) {}

  static fromPayload(obj: {
    id: string;
    name: string;
    slug: string;
    description: string;
    content: string;
    createdAt: Date;
    userId: string;
    files?: SkillFile[];
    userName?: string;
    communityDownloads?: number;
  }): Skill {
    return new Skill(
      obj.id,
      obj.name,
      obj.slug,
      obj.description,
      obj.content,
      obj.createdAt,
      obj.userId,
      obj.files ?? [],
      obj.userName,
      obj.communityDownloads
    );
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      content: this.content,
      createdAt: this.createdAt,
      userId: this.userId,
      files: this.files,
      userName: this.userName,
      communityDownloads: this.communityDownloads,
    };
  }
}
