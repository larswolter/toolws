import { Mongo } from 'meteor/mongo';

const toolInstances =  new Mongo.Collection('toolInstances');

export {toolInstances};
