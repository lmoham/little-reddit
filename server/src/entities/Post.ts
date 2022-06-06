import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import 'reflect-metadata';
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
  @Field(() => Int)
  @PrimaryKey({ type: 'number'})
  id!: number;

  @Field(() => String)
  @Property({ type: 'date'})
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({ type: 'text'})
  title!: string;

}