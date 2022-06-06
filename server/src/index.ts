import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from "express-session";
import { createClient } from "redis";
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    const app = express();
    const RedisStore = connectRedis(session)

    // redis@v4
    const redisClient = createClient({ legacyMode: true })
    redisClient.connect().catch(console.error)

    app.use(cors({
        origin: ["http://localhost:3000", "https://studio.apollographql.com"],
        credentials: true,
    }))
    // placed here so session middleware will run inside of apollo middleware
    app.use(
    session({
        name: COOKIE_NAME,
        store: new RedisStore({ 
            client: redisClient,
            // disableTTL: true,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 86000,
            httpOnly: true,
            sameSite: 'lax', // something to do with csrf
            secure: __prod__ // not using https locally
        },
        saveUninitialized: false, // if we don't need to store sessions (i.e. just testing out stuff), then set to false
        secret: "keyboard cat",
        resave: false,
        
    })
    )

    // Testing cookies
    // const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core')

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        
        // plugins: [
        //     ApolloServerPluginLandingPageGraphQLPlayground ({
        //         // options
        //     })
        // ],

        // express provides req and res objects. apollo allows us to access these objects with context()
        context: ({req, res}) => ({ em: orm.em, req, res }),
    });

    // Because graphql takes us to a different place, need to specify for cookies
    // const corsOptions = { origin: ["http://localhost:3000","https://studio.apollographql.com"], credentials: true }

    // Here, we explicitly define applyMiddleware as the response
    apolloServer.start().then(res => {
        apolloServer.applyMiddleware({ 
            app,
            // More convenient to set cors globally with express
            cors: false });
        app.listen({ port: 4000 }, () =>
            console.log('Now browse to http://localhost:4000' + apolloServer.graphqlPath)
        )
       })

    // await apolloServer.start();
    // apolloServer.getMiddleware({app});

    // app.get('/', (_, res) => {
    //     res.send('Hello.');
    // })


    // app.listen(4000, () => {
    //     console.log('Server started on localhost:4000' + apolloServer.graphqlPath);
    // })

    // const post = orm.em.fork({}).create(Post, { title: "My first post" });
    // await orm.em.persistAndFlush(post);

    // const posts = await orm.em.find(Post, {});
    // console.log(posts);/
}

main().catch(err => {
    console.log(err);
})
