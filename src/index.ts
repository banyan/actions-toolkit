import Octokit from '@octokit/rest'
import execa, { Options as ExecaOptions } from 'execa'
import fs from 'fs'
import yaml from 'js-yaml'
import minimist, { ParsedArgs } from 'minimist'
import path from 'path'
import Context from './context'
import logger, { ActionLogger } from './logger'

export class Toolkit {
  public context: Context

  /**
   * Path to a clone of the repository
   */
  public workspace: string

  /**
   * GitHub API token
   */
  public token: string

  /**
   * An object of the parsed arguments passed to your action
   */
  public arguments: ParsedArgs

  /**
   * A fancy logger
   */
  public log: ActionLogger

  constructor (customLogger?: ActionLogger) {
    this.log = customLogger || logger

    // Print a console warning for missing environment variables
    this.warnForMissingEnvVars()

    this.context = new Context()
    this.workspace = process.env.GITHUB_WORKSPACE as string
    this.token = process.env.GITHUB_TOKEN as string
    this.arguments = minimist(process.argv.slice(2))
  }

  /**
   * Returns an Octokit SDK client authenticated for this repository. See https://octokit.github.io/rest.js for the API.
   *
   * ```js
   * const octokit = tools.createOctokit()
   * const newIssue = await octokit.issues.create(context.repo({
   *   title: 'New issue!',
   *   body: 'Hello Universe!'
   * }))
   * ```
   */
  public createOctokit () {
    if (!this.token) {
      throw new Error('No `GITHUB_TOKEN` environment variable found, could not authenticate Octokit client.')
    }

    const octokit = new Octokit()

    octokit.authenticate({
      token: this.token,
      type: 'token'
    })

    return octokit
  }

  /**
   * Gets the contents file in your project's workspace
   *
   * ```js
   * const myFile = tools.getFile('README.md')
   * ```
   *
   * @param filename - Name of the file
   * @param encoding - Encoding (usually utf8)
   */
  public getFile (filename: string, encoding = 'utf8') {
    const pathToFile = path.join(this.workspace, filename)
    if (!fs.existsSync(pathToFile)) throw new Error(`File ${filename} could not be found in your project's workspace.`)
    return fs.readFileSync(pathToFile, encoding)
  }

  /**
   * Get the package.json file in the project root
   *
   * ```js
   * const pkg = toolkit.getPackageJSON()
   * ```
   */
  public getPackageJSON (): object {
    const pathToPackage = path.join(this.workspace, 'package.json')
    if (!fs.existsSync(pathToPackage)) throw new Error('package.json could not be found in your project\'s root.')
    return require(pathToPackage)
  }

  /**
   * Get the configuration settings for this action in the project workspace.
   *
   * @param key - If this is a string like `.myfilerc` it will look for that file.
   * If it's a YAML file, it will parse that file as a JSON object. Otherwise, it will
   * return the value of the property in the `package.json` file of the project.
   *
   * @example This method can be used in three different ways:
   *
   * ```js
   * // Get the .rc file
   * const cfg = toolkit.config('.myactionrc')
   *
   * // Get the YAML file
   * const cfg = toolkit.config('myaction.yml')
   *
   * // Get the property in package.json
   * const cfg = toolkit.config('myaction')
   * ```
   */
  public config (key: string): object {
    if (/\..+rc/.test(key)) {
      // It's a file like .npmrc or .eslintrc!
      return JSON.parse(this.getFile(key))
    } else if (key.endsWith('.yml') || key.endsWith('.yaml')) {
      // It's a YAML file! Gotta serialize it!
      return yaml.safeLoad(this.getFile(key))
    } else {
      // It's a regular object key in the package.json
      const pkg = this.getPackageJSON() as any
      return pkg[key]
    }
  }

  /**
   * Run a CLI command in the workspace. This runs [execa](https://github.com/sindresorhus/execa)
   * under the hood so check there for the full options.
   *
   * @param command - Command to run
   * @param args - Argument (this can be a string or multiple arguments in an array)
   * @param cwd - Directory to run the command in
   * @param [opts] - Options to pass to the execa function
   */
  public async runInWorkspace (command: string, args?: string[] | string, opts?: ExecaOptions) {
    if (typeof args === 'string') args = [args]
    return execa(command, args, { cwd: this.workspace, ...opts })
  }

  /**
   * Log warnings to the console for missing environment variables
   */
  private warnForMissingEnvVars () {
    const requiredEnvVars = [
      'HOME',
      'GITHUB_WORKFLOW',
      'GITHUB_ACTION',
      'GITHUB_ACTOR',
      'GITHUB_REPOSITORY',
      'GITHUB_EVENT_NAME',
      'GITHUB_EVENT_PATH',
      'GITHUB_WORKSPACE',
      'GITHUB_SHA',
      'GITHUB_REF',
      'GITHUB_TOKEN'
    ]

    const requiredButMissing = requiredEnvVars.filter(key => !process.env.hasOwnProperty(key))
    if (requiredButMissing.length > 0) {
      // This isn't being run inside of a GitHub Action environment!
      const list = requiredButMissing.map(key => `- ${key}`).join('\n')
      const warning = `There are environment variables missing from this runtime, but would be present on GitHub.\n${list}`
      this.log.warn(warning)
    }
  }
}
