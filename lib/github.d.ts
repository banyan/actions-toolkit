import { graphql } from '@octokit/graphql';
import Octokit from '@octokit/rest';
export declare class GitHub extends Octokit {
    graphql: typeof graphql;
    constructor(token: string);
}
