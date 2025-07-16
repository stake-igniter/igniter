import { graphql } from './gql'

export const latestBlockDocument = graphql(`
  query latestBlock {
    blocks(orderBy: ID_DESC, first: 1) {
      nodes {
        height: id
        timestamp
      }
    }
  }
`)

export const blockSubscriptionDocument = graphql(`
  subscription blocks {
    blocks {
      id
      mutation_type
      _entity {
        id
        height: id
        timestamp
      }
    }
  }
`)

export const numBlocksPerSessionDocument = graphql(`
  query numBlocksPerSession {
    params(
      filter:  {
        key:  {
          equalTo: "num_blocks_per_session"
        }
        namespace:  {
          equalTo: "shared"
        }
      }
      orderBy: [BLOCK_ID_DESC]
      first: 1
    ) {
      nodes {
        blockId
        key
        namespace
        value
      }
    }
  }
`)
