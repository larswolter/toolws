import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';
import { toolInstances } from '/imports/collections';
import './methods';
import './sw.js';

Meteor.publish('myTools', function (uids) {
  check(uids, [String]);
  toolInstances.update({ _id: { $in: uids } }, { $set: { lastAccess: new Date() } });
  return toolInstances.find({ _id: { $in: uids } });
});

Meteor.startup(() => {
  toolInstances.find({ 'name': 'Checklist', 'content': { $elemMatch: { _id: { $exists: false } } } }).forEach((item) => {
    toolInstances.update(item._id, { $set: { content: item.content.map(x => ({ _id: Random.id(), ...x })) } });
  })
});
