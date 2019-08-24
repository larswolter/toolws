import { Mongo } from 'meteor/mongo';

const toolInstances = new Mongo.Collection('toolInstances');

toolInstances.allow({
    insert() {
        return true
    },
    update() {
        return true
    }
});


export { toolInstances };
