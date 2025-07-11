import { HttpLink } from "@apollo/client";
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";

export const getServerApolloClient = (url: string) => {
  const {getClient} = registerApolloClient(() => {
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
        uri: url,

        // you can disable result caching here if you want to
        // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
        fetchOptions: { cache: "no-store",  },
      }),
    });
  });

  return getClient()
}
