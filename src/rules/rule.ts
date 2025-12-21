export class Rule {
  constructor(
    public id: string,
    public name: string,
    public content: string,
    public createdAt: Date
  ) {}

  toJson() {
    return {
      id: this.id,
      name: this.name,
      content: this.content,
      createdAt: this.createdAt,
    };
  }
}
