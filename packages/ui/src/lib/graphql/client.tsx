"use client";

import { HttpLink, split } from '@apollo/client'
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import React from 'react'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'

function makeClient(url: string) {
  const httpLink = new HttpLink({
    uri: url,
    // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
    fetchOptions: { cache: "no-store" },
  });

  const wsLink = new GraphQLWsLink(createClient({
    url,
  }));

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  );

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: splitLink,
  });
}

export default function ApolloWrapper({ children, url }: {children: React.ReactNode, url: string}) {
  return (
    <ApolloNextAppProvider makeClient={() => makeClient(url)}>
      {children}
    </ApolloNextAppProvider>
  );
}
