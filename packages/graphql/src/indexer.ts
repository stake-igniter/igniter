import { graphql } from './gql'

export const indexerStatusDocument = graphql(`
  query indexerStatus {
    status: _metadata {
      chain
      lastProcessedHeight
      lastProcessedTimestamp
      targetHeight
    }
  }
`)
