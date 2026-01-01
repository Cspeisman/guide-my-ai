export class Rule {
  constructor(
    public id: string,
    public name: string,
    public slug: string,
    public content: string,
    public createdAt: Date,
    public userId: string
  ) {}

  toJson() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      content: this.content,
      createdAt: this.createdAt,
      userId: this.userId,
    };
  }
}
