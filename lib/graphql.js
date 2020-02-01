"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("@octokit/graphql");
exports.withDefaults = function (token) { return graphql_1.graphql.defaults({
    headers: { authorization: "token " + token }
}); };
//# sourceMappingURL=graphql.js.map