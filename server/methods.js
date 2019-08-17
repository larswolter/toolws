import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { toolInstances } from "/imports/collections";

Meteor.methods({
    createApp(appData) {
        check(appData,Object);
        toolInstances.insert(appData);
    }
})