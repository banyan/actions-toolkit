declare module 'yurnalist' {
  type Tree = {
    name: string
    children?: Tree[]
    hint?: string
    hidden?: boolean
    color?: string
  }

  type ReporterOptions = {
    verbose?: boolean,
    stdout?: Stdout,
    stderr?: Stdout,
    stdin?: Stdin,
    emoji?: boolean,
    noProgress?: boolean,
    silent?: boolean,
    nonInteractive?: boolean,
    peekMemoryCounter?: boolean
  }

  export interface Reporter {
    close ()
    table (head: string[], body: string[])
    step (current: number, total: number, msg: string, emoji?: string)
    inspect (value: any)
    list (key: string, items: string[], hints?: object)
    header (command: string, pkg: { name: string, version: string })
    footer (showPeakMemory?: boolean)
    log (msg: string, opts: { force?: boolean })
    success (msg: string)
    error (msg: string)
    info (msg: string)
    command (command: string)
    warn (msg: string)
    question (question: string, options?: object): Promise<string>
    tree (key: string, trees: Trees, opts: { force?: boolean })
  }

  export function createReporter(options?: ReporterOptions): Reporter
}
