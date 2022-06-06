import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from 'path';
import { User } from "./entities/User";

export default {
    migrations: {
        path: path.join(__dirname,'./migrations'), // path to the folder with migrations
        glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files, but not .d.ts)
    },
    entities: [Post, User],
    dbName: 'little-reddit',
    user: 'postgres',
    password: 'postgres',
    type: 'postgresql',
    allowGlobalContext: true,
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
// as const works but this allows us to autocomplete fields if we want