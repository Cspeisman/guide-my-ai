export class Mcp {
  constructor(
    public id: string,
    public name: string,
    public slug: string,
    public context: string, // JSON string
    public createdAt: Date,
    public userId: string,
    public userName?: string,
    public communityDownloads?: number
  ) {}

  static fromPayload(obj: {
    id: string;
    name: string;
    slug: string;
    context: string;
    createdAt: Date;
    userId: string;
    userName?: string;
    communityDownloads?: number;
  }): Mcp {
    return new Mcp(
      obj.id,
      obj.name,
      obj.slug,
      obj.context,
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
      context: this.context,
      createdAt: this.createdAt,
      userId: this.userId,
      userName: this.userName,
      communityDownloads: this.communityDownloads,
    };
  }
}
