import type { MoveContext } from "../../interfaces/MoveContext";
import type { MoveError } from "../../interfaces/MoveError";

import { DriveBackedValue_ } from "./DriveBackedValue";

export class MoveState_ {
  private readonly driveBackedState: DriveBackedValue_<{
    errors: Array<MoveError>;
    pathsToDelete: Array<MoveContext>; // Currently unused.
    pathsToProcess: Array<MoveContext>;
  }>;
  private errors: Array<MoveError>;
  private pathsToProcess: Array<MoveContext> | null;

  public constructor(
    sourceID: string,
    destinationID: string,
    copyComments: boolean,
    mergeFolders: boolean,
  ) {
    this.driveBackedState = new DriveBackedValue_(
      JSON.stringify({
        copyComments,
        destinationID,
        mergeFolders,
        sourceID,
      }),
    );
    this.pathsToProcess = null;
    this.errors = [];
  }

  public addPath(
    sourceID: string,
    destinationID: string,
    path: Array<string>,
  ): void {
    if (this.pathsToProcess === null) {
      this.pathsToProcess = [];
    }
    this.pathsToProcess.push({ destinationID, path, sourceID });
  }

  public destroyState(): void {
    this.driveBackedState.deleteValue();
    this.pathsToProcess = null;
    this.errors = [];
  }

  public getErrors(): Array<MoveError> {
    return this.errors;
  }

  public getNextPath(): MoveContext | null {
    if (this.isNull() || this.pathsToProcess!.length === 0) {
      return null;
    }
    return this.pathsToProcess![this.pathsToProcess!.length - 1];
  }

  public isNull(): boolean {
    return this.pathsToProcess === null;
  }

  public loadState(): void {
    const state = this.driveBackedState.loadValue();
    if (state !== null) {
      this.pathsToProcess = state.pathsToProcess;
      this.errors = state.errors;
    } else {
      this.pathsToProcess = null;
      this.errors = [];
    }
  }

  public logError(file: Array<string>, error: string): void {
    this.errors.push({ error, file });
    this.saveState();
  }

  public removePath(path: MoveContext): void {
    if (this.pathsToProcess === null) {
      return;
    }
    this.pathsToProcess = this.pathsToProcess.filter(
      (value) =>
        value.sourceID !== path.sourceID ||
        value.destinationID !== path.destinationID,
    );
  }

  public saveState(): void {
    if (this.pathsToProcess !== null) {
      this.driveBackedState.saveValue({
        errors: this.errors,
        pathsToDelete: [],
        pathsToProcess: this.pathsToProcess,
      });
    }
  }

  public tryOrLog<T>(
    context: MoveContext,
    fn: () => T,
    filename?: string,
  ): T | null {
    try {
      return fn();
    } catch (e) {
      const path =
        filename !== undefined ? context.path.concat([filename]) : context.path;
      this.logError(path, (e as Error).message);
    }
    return null;
  }
}
