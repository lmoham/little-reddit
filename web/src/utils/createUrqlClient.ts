import { dedupExchange, fetchExchange } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { LogoutMutation, MeDocument, MeQuery, LoginMutation, RegisterMutation } from "../generated/graphql";
import { betterUpdateQuery } from "../pages/betterUpdateQuery";

export const createUrqlClient = (ssrExchange: any) => ({
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
        logout: (result: LogoutMutation, args, cache, info) => {
          cache.updateQuery({ query: MeDocument }, (data: MeQuery) => {
            return {
              me: null
            };
          })
        },

        login: (_result, args, cache, info) => {
          // cache.updateQuery({ query: MeDocument }, (data: MeQuery) => {
          //   if (result.login.errors) {
          //     return data;
          //   } else {
          //     return {
          //       me: result.login.user,
          //     };
          //   }
          // });

          betterUpdateQuery<LoginMutation, MeQuery>(cache, 
            {query: MeDocument},
            _result,
            (result, query) => {
              if (result.login.errors) {
                return query;
              } else {
                return {
                  me: result.login.user,
                };
              }
            }
            );
        },
        

        register: (_result, args, cache, info) => {
          betterUpdateQuery<RegisterMutation, MeQuery>(cache, 
            {query: MeDocument},
            _result,
            (result, query) => {
              if (result.register.errors) {
                return query;
              } else {
                return {
                  me: result.register.user,
                };
              }
            }
            )
        },

      }
    }
  }),ssrExchange, fetchExchange]
});