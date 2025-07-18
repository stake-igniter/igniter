/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query latestBlock {\n    blocks(orderBy: ID_DESC, first: 1) {\n      nodes {\n        height: id\n        timestamp\n      }\n    }\n  }\n": typeof types.LatestBlockDocument,
    "\n  subscription blocks {\n    blocks {\n      id\n      mutation_type\n      _entity {\n        id\n        height: id\n        timestamp\n      }\n    }\n  }\n": typeof types.BlocksDocument,
    "\n  query numBlocksPerSession {\n    params(\n      filter:  {\n        key:  {\n          equalTo: \"num_blocks_per_session\"\n        }\n        namespace:  {\n          equalTo: \"shared\"\n        }\n      }\n      orderBy: [BLOCK_ID_DESC]\n      first: 1\n    ) {\n      nodes {\n        blockId\n        key\n        namespace\n        value\n      }\n    }\n  }\n": typeof types.NumBlocksPerSessionDocument,
    "\n  query indexerStatus {\n    status: _metadata {\n      chain\n      lastProcessedHeight\n      lastProcessedTimestamp\n      targetHeight\n    }\n  }\n": typeof types.IndexerStatusDocument,
    "\n  query getRewardsByAddressesAndTimeGroupByAddressAndDate($addresses: [String!]!, $startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {\n    rewards: getRewardsByAddressesAndTimeGroupByAddressAndDate(\n      addresses: $addresses, \n      startDate: $startDate, \n      endDate: $endDate, \n      truncInterval: $truncInterval\n    )\n  }\n": typeof types.GetRewardsByAddressesAndTimeGroupByAddressAndDateDocument,
    "\n  query nodesSummary(\n    $filter: SupplierFilter!,\n    $addresses: [String!]!,\n    $currentDate: Datetime!,\n    $last24Hours: Datetime!,\n    $last48Hours: Datetime!\n  ) {\n    suppliers(\n      filter: $filter\n    ) {\n      totalCount\n      aggregates {\n        sum {\n          stakeAmount\n        }\n      }\n    }\n    last24h: getRewardsByAddressesAndTime(\n      addresses: $addresses,\n      startDate: $last24Hours,\n      endDate: $currentDate,\n    )\n\n    last48h: getRewardsByAddressesAndTime(\n      addresses: $addresses,\n      startDate: $last48Hours,\n      endDate: $currentDate,\n    )\n  }\n": typeof types.NodesSummaryDocument,
};
const documents: Documents = {
    "\n  query latestBlock {\n    blocks(orderBy: ID_DESC, first: 1) {\n      nodes {\n        height: id\n        timestamp\n      }\n    }\n  }\n": types.LatestBlockDocument,
    "\n  subscription blocks {\n    blocks {\n      id\n      mutation_type\n      _entity {\n        id\n        height: id\n        timestamp\n      }\n    }\n  }\n": types.BlocksDocument,
    "\n  query numBlocksPerSession {\n    params(\n      filter:  {\n        key:  {\n          equalTo: \"num_blocks_per_session\"\n        }\n        namespace:  {\n          equalTo: \"shared\"\n        }\n      }\n      orderBy: [BLOCK_ID_DESC]\n      first: 1\n    ) {\n      nodes {\n        blockId\n        key\n        namespace\n        value\n      }\n    }\n  }\n": types.NumBlocksPerSessionDocument,
    "\n  query indexerStatus {\n    status: _metadata {\n      chain\n      lastProcessedHeight\n      lastProcessedTimestamp\n      targetHeight\n    }\n  }\n": types.IndexerStatusDocument,
    "\n  query getRewardsByAddressesAndTimeGroupByAddressAndDate($addresses: [String!]!, $startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {\n    rewards: getRewardsByAddressesAndTimeGroupByAddressAndDate(\n      addresses: $addresses, \n      startDate: $startDate, \n      endDate: $endDate, \n      truncInterval: $truncInterval\n    )\n  }\n": types.GetRewardsByAddressesAndTimeGroupByAddressAndDateDocument,
    "\n  query nodesSummary(\n    $filter: SupplierFilter!,\n    $addresses: [String!]!,\n    $currentDate: Datetime!,\n    $last24Hours: Datetime!,\n    $last48Hours: Datetime!\n  ) {\n    suppliers(\n      filter: $filter\n    ) {\n      totalCount\n      aggregates {\n        sum {\n          stakeAmount\n        }\n      }\n    }\n    last24h: getRewardsByAddressesAndTime(\n      addresses: $addresses,\n      startDate: $last24Hours,\n      endDate: $currentDate,\n    )\n\n    last48h: getRewardsByAddressesAndTime(\n      addresses: $addresses,\n      startDate: $last48Hours,\n      endDate: $currentDate,\n    )\n  }\n": types.NodesSummaryDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query latestBlock {\n    blocks(orderBy: ID_DESC, first: 1) {\n      nodes {\n        height: id\n        timestamp\n      }\n    }\n  }\n"): (typeof documents)["\n  query latestBlock {\n    blocks(orderBy: ID_DESC, first: 1) {\n      nodes {\n        height: id\n        timestamp\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription blocks {\n    blocks {\n      id\n      mutation_type\n      _entity {\n        id\n        height: id\n        timestamp\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription blocks {\n    blocks {\n      id\n      mutation_type\n      _entity {\n        id\n        height: id\n        timestamp\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query numBlocksPerSession {\n    params(\n      filter:  {\n        key:  {\n          equalTo: \"num_blocks_per_session\"\n        }\n        namespace:  {\n          equalTo: \"shared\"\n        }\n      }\n      orderBy: [BLOCK_ID_DESC]\n      first: 1\n    ) {\n      nodes {\n        blockId\n        key\n        namespace\n        value\n      }\n    }\n  }\n"): (typeof documents)["\n  query numBlocksPerSession {\n    params(\n      filter:  {\n        key:  {\n          equalTo: \"num_blocks_per_session\"\n        }\n        namespace:  {\n          equalTo: \"shared\"\n        }\n      }\n      orderBy: [BLOCK_ID_DESC]\n      first: 1\n    ) {\n      nodes {\n        blockId\n        key\n        namespace\n        value\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query indexerStatus {\n    status: _metadata {\n      chain\n      lastProcessedHeight\n      lastProcessedTimestamp\n      targetHeight\n    }\n  }\n"): (typeof documents)["\n  query indexerStatus {\n    status: _metadata {\n      chain\n      lastProcessedHeight\n      lastProcessedTimestamp\n      targetHeight\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getRewardsByAddressesAndTimeGroupByAddressAndDate($addresses: [String!]!, $startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {\n    rewards: getRewardsByAddressesAndTimeGroupByAddressAndDate(\n      addresses: $addresses, \n      startDate: $startDate, \n      endDate: $endDate, \n      truncInterval: $truncInterval\n    )\n  }\n"): (typeof documents)["\n  query getRewardsByAddressesAndTimeGroupByAddressAndDate($addresses: [String!]!, $startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {\n    rewards: getRewardsByAddressesAndTimeGroupByAddressAndDate(\n      addresses: $addresses, \n      startDate: $startDate, \n      endDate: $endDate, \n      truncInterval: $truncInterval\n    )\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query nodesSummary(\n    $filter: SupplierFilter!,\n    $addresses: [String!]!,\n    $currentDate: Datetime!,\n    $last24Hours: Datetime!,\n    $last48Hours: Datetime!\n  ) {\n    suppliers(\n      filter: $filter\n    ) {\n      totalCount\n      aggregates {\n        sum {\n          stakeAmount\n        }\n      }\n    }\n    last24h: getRewardsByAddressesAndTime(\n      addresses: $addresses,\n      startDate: $last24Hours,\n      endDate: $currentDate,\n    )\n\n    last48h: getRewardsByAddressesAndTime(\n      addresses: $addresses,\n      startDate: $last48Hours,\n      endDate: $currentDate,\n    )\n  }\n"): (typeof documents)["\n  query nodesSummary(\n    $filter: SupplierFilter!,\n    $addresses: [String!]!,\n    $currentDate: Datetime!,\n    $last24Hours: Datetime!,\n    $last48Hours: Datetime!\n  ) {\n    suppliers(\n      filter: $filter\n    ) {\n      totalCount\n      aggregates {\n        sum {\n          stakeAmount\n        }\n      }\n    }\n    last24h: getRewardsByAddressesAndTime(\n      addresses: $addresses,\n      startDate: $last24Hours,\n      endDate: $currentDate,\n    )\n\n    last48h: getRewardsByAddressesAndTime(\n      addresses: $addresses,\n      startDate: $last48Hours,\n      endDate: $currentDate,\n    )\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;