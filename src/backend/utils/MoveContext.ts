import type { ErrorLogger_ } from "./ErrorLogger";

export class MoveContext_ {
  public sourceID: string;
  public destinationID: string;
  public path: Array<string>;
  public logger: ErrorLogger_;

  public constructor(
    sourceID: string,
    destinationID: string,
    path: Array<string>,
    logger: ErrorLogger_
  ) {
    this.sourceID = sourceID;
    this.destinationID = destinationID;
    this.path = path;
    this.logger = logger;
  }

  public childContext(
    sourceID: string,
    destinationID: string,
    childName: string
  ): MoveContext_ {
    return new MoveContext_(
      sourceID,
      destinationID,
      this.path.concat([childName]),
      this.logger
    );
  }
}
