import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { toolInstances } from "./collections";
import { myToolIds, myTools, updateForage } from "./ui/data";
import localforage from 'localforage';

Meteor.methods({
    createApp(appData) {
        check(appData, Object);
        myToolIds.set(myToolIds.get().concat([appData._id]));
        localforage.setItem('myToolIds', myToolIds.get());
        myTools.insert(appData);
        toolInstances.insert(appData);
        updateForage();
    },
    checklistInsert({ _id, entryId, text, after }) {
        myTools.update(_id, {
            $push: {
                content: {
                    $each: [{ text, _id: entryId, checked: false }],
                    $position: after + 1
                }
            }
        });
        toolInstances.update(_id, {
            $push: {
                content: {
                    $each: [{ text, _id: entryId, checked: false }],
                    $position: after + 1
                }
            }
        });
        updateForage();
    },
    checklistUpdate({ _id, entryId, text }) {
        if (myTools.findOne({ _id, 'content._id': entryId })) {
            if (text === false) {
                myTools.update(_id, { $pull: { content: { _id: entryId } } });
                toolInstances.update(_id, { $pull: { content: { _id: entryId } } });
            } else {
                myTools.update({ _id, 'content._id': entryId }, { $set: { 'content.$.text': text } });
                toolInstances.update({ _id, 'content._id': entryId }, { $set: { 'content.$.text': text } });
            }
            updateForage();
        }
    },
    checklistCheck({ _id, entryId, checked }) {
        const tool = myTools.findOne({ _id, 'content._id': entryId });
        if (tool) {
            myTools.update(_id, { $pull: { content: { _id: entryId } } });
            toolInstances.update(_id, { $pull: { content: { _id: entryId } } });
            const firstChecked = tool.content.findIndex(x => x.checked === true);
            const content = tool.content.find(x => x._id === entryId);
            myTools.update(_id, {
                $push: {
                    content: {
                        $each: [{ ...content, checked }],
                        $position: firstChecked === -1 ? tool.content.length : firstChecked
                    }
                }
            });
            toolInstances.update(_id, {
                $push: {
                    content: {
                        $each: [{ ...content, checked }],
                        $position: firstChecked === -1 ? tool.content.length : firstChecked
                    }
                }
            });
            updateForage();
        }
    },
});
