import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {toolInstances} from '/imports/collections';


Meteor.publish('myTools', function(uids) {
  check(uids,[String]);
  return toolInstances.find({_id:{$in:uids}});
});

Meteor.methods({
  createApp(appData) {
    check(appData,Object);
    check(appData.name,String);
    check(appData._id,String);
    toolInstances.insert(appData);
  }
})
