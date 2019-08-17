import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { toolInstances } from "./collections";
import { myToolIds } from "./ui/MyTools";
import localforage from 'localforage';

Meteor.methods({
    createApp(appData) {
//        check(appData,Object);
        if(Meteor.isClient){
            myToolIds.set(myToolIds.get().concat([appData._id]));
            localforage.setItem('myToolIds',myToolIds.get());
        }
        toolInstances.insert(appData);
        }
})