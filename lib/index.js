"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var execa_1 = __importDefault(require("execa"));
var fs_1 = __importDefault(require("fs"));
var js_yaml_1 = __importDefault(require("js-yaml"));
var minimist_1 = __importDefault(require("minimist"));
var path_1 = __importDefault(require("path"));
var signale_1 = require("signale");
var context_1 = require("./context");
var exit_1 = require("./exit");
var get_body_1 = require("./get-body");
var github_1 = require("./github");
var store_1 = require("./store");
var Toolkit = /** @class */ (function () {
    function Toolkit(opts) {
        if (opts === void 0) { opts = {}; }
        this.opts = opts;
        // Create the logging instance
        this.log = this.wrapLogger(opts.logger || new signale_1.Signale({ config: { underlineLabel: false } }));
        // Print a console warning for missing environment variables
        this.warnForMissingEnvVars();
        // Memoize environment variables and arguments
        this.workspace = process.env.GITHUB_WORKSPACE;
        this.token = process.env.GITHUB_TOKEN;
        this.arguments = minimist_1.default(process.argv.slice(2));
        // Setup nested objects
        this.exit = new exit_1.Exit(this.log);
        this.context = new context_1.Context();
        this.github = new github_1.GitHub(this.token);
        this.store = new store_1.Store(this.context.workflow, this.workspace);
        // Check stuff
        this.checkAllowedEvents(this.opts.event);
        this.checkRequiredSecrets(this.opts.secrets);
    }
    /**
     * Run an asynchronous function that accepts a toolkit as its argument, and fail if
     * an error occurs.
     *
     * @param func - Async function to run
     * @param [opts] - Options to pass to the toolkit
     *
     * @example This is generally used to run a `main` async function:
     *
     * ```js
     * Toolkit.run(async tools => {
     *   // Action code here.
     * }, { event: 'push' })
     * ```
     */
    Toolkit.run = function (func, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var tools, ret, _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tools = new Toolkit(opts);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        ret = func(tools);
                        if (!(ret instanceof Promise)) return [3 /*break*/, 3];
                        return [4 /*yield*/, ret];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = ret;
                        _b.label = 4;
                    case 4: 
                    // If the return value of the provided function is an unresolved Promise
                    // await that Promise before return the value, otherwise return as normal
                    return [2 /*return*/, _a];
                    case 5:
                        err_1 = _b.sent();
                        tools.exit.failure(err_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
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
    Toolkit.prototype.getFile = function (filename, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        var pathToFile = path_1.default.join(this.workspace, filename);
        if (!fs_1.default.existsSync(pathToFile))
            throw new Error("File " + filename + " could not be found in your project's workspace.");
        return fs_1.default.readFileSync(pathToFile, encoding);
    };
    /**
     * Get the package.json file in the project root
     *
     * ```js
     * const pkg = toolkit.getPackageJSON()
     * ```
     */
    Toolkit.prototype.getPackageJSON = function () {
        var pathToPackage = path_1.default.join(this.workspace, 'package.json');
        if (!fs_1.default.existsSync(pathToPackage))
            throw new Error('package.json could not be found in your project\'s root.');
        return require(pathToPackage);
    };
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
    Toolkit.prototype.config = function (key) {
        if (/\..+rc/.test(key)) {
            // It's a file like .npmrc or .eslintrc!
            return JSON.parse(this.getFile(key));
        }
        else if (key.endsWith('.yml') || key.endsWith('.yaml')) {
            // It's a YAML file! Gotta serialize it!
            return js_yaml_1.default.safeLoad(this.getFile(key));
        }
        else {
            // It's a regular object key in the package.json
            var pkg = this.getPackageJSON();
            return pkg[key];
        }
    };
    /**
     * Run a CLI command in the workspace. This runs [execa](https://github.com/sindresorhus/execa)
     * under the hood so check there for the full options.
     *
     * @param command - Command to run
     * @param args - Argument (this can be a string or multiple arguments in an array)
     * @param cwd - Directory to run the command in
     * @param [opts] - Options to pass to the execa function
     */
    Toolkit.prototype.runInWorkspace = function (command, args, opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (typeof args === 'string')
                    args = [args];
                return [2 /*return*/, execa_1.default(command, args, __assign({ cwd: this.workspace }, opts))];
            });
        });
    };
    /**
     * Run the handler when someone triggers the `/command` in a comment body.
     *
     * @param command - Command to listen for
     * @param handler - Handler to run when the command is used
     */
    Toolkit.prototype.command = function (command, handler) {
        return __awaiter(this, void 0, void 0, function () {
            var reg, body, match;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Don't trigger for bots
                        if (this.context.payload.sender && this.context.payload.sender.type === 'Bot') {
                            return [2 /*return*/];
                        }
                        this.checkAllowedEvents([
                            'pull_request',
                            'issues',
                            'issue_comment',
                            'commit_comment',
                            'pull_request_review',
                            'pull_request_review_comment'
                        ]);
                        reg = new RegExp("^/" + command + "(?:$|\\s(.*))", 'gm');
                        body = get_body_1.getBody(this.context.payload);
                        if (!body)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        if (!(match = reg.exec(body))) return [3 /*break*/, 6];
                        if (!match[1]) return [3 /*break*/, 3];
                        return [4 /*yield*/, handler(minimist_1.default(match[1].split(' ')), match)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, handler({}, match)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns true if this event is allowed
     */
    Toolkit.prototype.eventIsAllowed = function (event) {
        var _a = event.split('.'), eventName = _a[0], action = _a[1];
        if (action) {
            return eventName === this.context.event && this.context.payload.action === action;
        }
        return eventName === this.context.event;
    };
    Toolkit.prototype.checkAllowedEvents = function (event) {
        var _this = this;
        if (!event)
            return;
        var passed = Array.isArray(event)
            ? event.some(function (e) { return _this.eventIsAllowed(e); })
            : this.eventIsAllowed(event);
        if (!passed) {
            var actionStr = this.context.payload.action ? "." + this.context.payload.action : '';
            this.log.error("Event `" + this.context.event + actionStr + "` is not supported by this action.");
            this.exit.neutral();
        }
    };
    /**
     * Wrap a Signale logger so that its a callable class
     */
    Toolkit.prototype.wrapLogger = function (logger) {
        // Create a callable function
        var fn = logger.info.bind(logger);
        // Add the log methods onto the function
        var wrapped = Object.assign(fn, logger);
        // Clone the prototype
        Object.setPrototypeOf(wrapped, logger);
        return wrapped;
    };
    /**
     * Log warnings to the console for missing environment variables
     */
    Toolkit.prototype.warnForMissingEnvVars = function () {
        var requiredEnvVars = [
            'HOME',
            'GITHUB_WORKFLOW',
            'GITHUB_ACTION',
            'GITHUB_ACTOR',
            'GITHUB_REPOSITORY',
            'GITHUB_EVENT_NAME',
            'GITHUB_EVENT_PATH',
            'GITHUB_WORKSPACE',
            'GITHUB_SHA'
        ];
        var requiredButMissing = requiredEnvVars.filter(function (key) { return !process.env.hasOwnProperty(key); });
        if (requiredButMissing.length > 0) {
            // This isn't being run inside of a GitHub Action environment!
            var list = requiredButMissing.map(function (key) { return "- " + key; }).join('\n');
            var warning = "There are environment variables missing from this runtime, but would be present on GitHub.\n" + list;
            this.log.warn(warning);
        }
    };
    /**
     * The Action should fail if there are secrets it needs but does not have
     */
    Toolkit.prototype.checkRequiredSecrets = function (secrets) {
        if (!secrets || secrets.length === 0)
            return;
        // Filter missing but required secrets
        var requiredButMissing = secrets.filter(function (key) { return !process.env.hasOwnProperty(key); });
        // Everything we need is here
        if (requiredButMissing.length === 0)
            return;
        // Exit with a failing status
        var list = requiredButMissing.map(function (key) { return "- " + key; }).join('\n');
        this.exit.failure("The following secrets are required for this GitHub Action to run:\n" + list);
    };
    return Toolkit;
}());
exports.Toolkit = Toolkit;
//# sourceMappingURL=index.js.map