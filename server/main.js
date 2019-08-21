import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { toolInstances } from '/imports/collections';
import './methods';
import './sw.js';

Meteor.publish('myTools', function (uids) {
  check(uids, [String]);
  toolInstances.update({ _id: { $in: uids } }, { $set: { lastAccess: new Date() } });
  return toolInstances.find({ _id: { $in: uids } });
});

