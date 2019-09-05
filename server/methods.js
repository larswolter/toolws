import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { toolInstances } from "/imports/collections";

Meteor.methods({
    createApp(appData) {
        check(appData, Object);
        toolInstances.insert(appData);
    },
    checklistInsert({ _id, entryId, text, after }) {
        toolInstances.update(_id, {
            $push: {
                content: {
                    $each: [{ text, _id: entryId, checked: false }],
                    $position: after + 1
                }
            }
        });
    },
    checklistUpdate({ _id, entryId, text }) {
        try {
            if (toolInstances.findOne({ _id, 'content._id': entryId })) {
                if (text === false)
                    toolInstances.update(_id, { $pull: { content: { _id: entryId } } });
                else {
                    toolInstances.update({ _id, 'content._id': entryId }, { $set: { 'content.$.text': text } });
                }
            }
        } catch (err) {
            console.log('failed updating', entryId, text, checked);
        }
    },
    checklistCheck({ _id, entryId, checked }) {
        const tool = toolInstances.findOne({ _id, 'content._id': entryId });
        if (tool) {
            const firstChecked = tool.content.findIndex(x => x.checked === true) || tool.content.length;
            const content = tool.content.find(x => x._id === entryId);
            toolInstances.update(_id, { $pull: { content: { _id: entryId } } });
            toolInstances.update(_id, {
                $push: {
                    content: {
                        $each: [{ ...content, checked }],
                        $position: firstChecked
                    }
                }
            });
        }
    },
})