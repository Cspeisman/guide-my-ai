export class Rule {
  constructor(
    public id: string,
    public name: string,
    public slug: string,
    public content: string,
    public createdAt: Date,
    public userId: string,
    public userName?: string,
    public communityDownloads?: number
  ) {}

  static fromPayload(obj: {
    id: string;
    name: string;
    slug: string;
    content: string;
    createdAt: Date;
    userId: string;
    userName?: string;
    communityDownloads?: number;
  }): Rule {
    return new Rule(
      obj.id,
      obj.name,
      obj.slug,
      obj.content,
      obj.createdAt,
      obj.userId,
      obj.userName,
      obj.communityDownloads
    );
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      content: this.content,
      createdAt: this.createdAt,
      userId: this.userId,
      userName: this.userName,
      communityDownloads: this.communityDownloads,
    };
  }
}
