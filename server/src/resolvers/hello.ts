import { Query, Resolver } from "type-graphql";

// Put mutations and queries in here

@Resolver()
export class HelloResolver {
    @Query(() => String)
    hello() {
        return 'Bye.';
    }

}