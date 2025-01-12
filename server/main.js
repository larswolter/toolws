import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';
import { toolInstances } from '/imports/collections';
import './methods';
import './sw.js';

Meteor.publish('myTools', async function (uids) {
  check(uids, [String]);
  await toolInstances.updateAsync({ _id: { $in: uids } }, { $set: { lastAccess: new Date() } });
  return toolInstances.find({ _id: { $in: uids } });
});

Meteor.startup(() => {
  toolInstances.find({ 'name': 'Checklist', 'content': { $elemMatch: { _id: { $exists: false } } } }).forEachAsync((item) => {
    toolInstances.updateAsync(item._id, { $set: { content: item.content.map(x => ({ _id: Random.id(), ...x })) } });
  })
});
