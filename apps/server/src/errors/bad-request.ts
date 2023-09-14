export class BadRequest extends Error {
  public code = "BadRequest";
  constructor(public message: string) {
    super(message);
  }
}
