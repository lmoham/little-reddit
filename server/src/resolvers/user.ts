import { User } from "../entities/User";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { MyContext } from '../types';
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql'
import { COOKIE_NAME } from "../constants";

@InputType()
class UsernamePasswordInput{
    @Field()
    username: String;
    @Field()
    password: String;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    // ? = optional field
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];
    @Field(() => User, {nullable: true})
    user?: User;
}

@Resolver()
export class UserResolver {
    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() {em}: MyContext
    ) {
        // const user = await em.findOne(User, {email})
        return true;
    }

    @Query( () => User, { nullable: true})
    async me (
        @Ctx() { req, em}: MyContext
    ) {
        // If not logged in, return nothing
        if (!req.session.userID) {
            return null
        }
        else {
            const user = await em.findOne(User, { id: req.session.userID })
            return user
        }
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext): Promise<UserResponse> {
        if (options.username.length <= 2){
            return {
                errors: [{
                    field: 'username',
                    message: "Username must be greater than 2.",
                }]
            };
        }

        if (options.password.length <= 2){
            return {
                errors: [{
                    field: 'password',
                    message: "Password must be greater than 2.",
                }]
            };
        }

        const hashedPassword = await argon2.hash(options.password);
        // Using QueryBuilder instead
        // const user = em.create(User, { username: options.username, password: hashedPassword })
        let user;
        try {
            const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
                username: options.username, 
                password: hashedPassword,
                // Need to specify dates now because using Knex, not mikro-orm
                created_at: new Date(),
                updated_at: new Date(),
            })
            .returning("*");
            user = result[0]

            // Using QueryBuilder instead
            // await em.persistAndFlush(user);

        } catch (err) {
            if (err.code === "23505" || err.detail.includes("already exists")) {
                // Duplicate username error
                return {
                    errors: [{
                        field: 'username',
                        message: "Username already exists, use a different username.",
                    }]
                }
            }
        } 

        // Store userID session, which will create cookie for user
        // Keeps them logged in
        req.session.userID = user.id;

        return {
            user,
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username});
        if (!user){
            return {
                errors: [{
                    field: 'username',
                    message: "User does not exist.",
                }]
            };
        }
        const valid = await argon2.verify(user.password, options.password);
        if (!valid){
            return {
                errors: [{
                    field: 'password',
                    message: "Entered incorrect password.",
                }]
            }
        }

        // reg.session is an object where we can store whatever we want on it
        // ! = non-null assertion (we know we will get a userID)
        // Doesn't appear to have undefined error?
        req.session.userID = user.id;

        // return user is not accepted?
        return {
            user,
        };
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ) {
        return new Promise(resolve => req.session.destroy(err => {
            res.clearCookie(COOKIE_NAME);
            if (err) {
                console.log(err);
                resolve(false);
                return;
            }

            resolve(true);
        }))
    }

}