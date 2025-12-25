export class Profile {
  constructor(
    public id: string,
    public name: string,
    public userId: string,
    public createdAt: Date,
    public updatedAt: Date,
    public rules: Array<{ id: string; name: string; content: string }> = [],
    public mcps: Array<{ id: string; name: string; context: string }> = []
  ) {}
}
