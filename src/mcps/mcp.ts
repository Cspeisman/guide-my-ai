export class Mcp {
  constructor(
    public id: string,
    public name: string,
    public slug: string,
    public context: string, // JSON string
    public createdAt: Date,
    public userId: string
  ) {}

  toJson() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      context: this.context,
      createdAt: this.createdAt,
      userId: this.userId,
    };
  }
}
