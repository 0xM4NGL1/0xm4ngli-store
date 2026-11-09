declare module "node:sqlite" {
  export type SQLInputValue = string | number | bigint | null | Uint8Array;

  export class StatementSync {
    all(...params: SQLInputValue[]): Record<string, unknown>[];
    get(...params: SQLInputValue[]): Record<string, unknown> | undefined;
    run(...params: SQLInputValue[]): {
      changes: number | bigint;
      lastInsertRowid: number | bigint;
    };
  }

  export class DatabaseSync {
    constructor(
      path: string,
      options?: {
        open?: boolean;
        readOnly?: boolean;
        enableForeignKeyConstraints?: boolean;
        enableDoubleQuotedStringLiterals?: boolean;
      },
    );
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
