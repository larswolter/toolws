import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { toolInstances } from "/imports/collections";

Meteor.methods({
    async createApp(appData) {
        check(appData, Object);
        await toolInstances.insertAsync(appData);
    },
    async checklistInsert({ _id, entryId, text, after }) {
        await toolInstances.updateAsync(_id, {
            $push: {
                content: {
                    $each: [{ text, _id: entryId, checked: false }],
                    $position: after + 1
                }
            }
        });
    },
    async checklistUpdate({ _id, entryId, text }) {
        try {
            if (await toolInstances.findOneAsync({ _id, 'content._id': entryId })) {
                if (text === false)
                    await toolInstances.updateAsync(_id, { $pull: { content: { _id: entryId } } });
                else {
                    await toolInstances.updateAsync({ _id, 'content._id': entryId }, { $set: { 'content.$.text': text } });
                }
            }
        } catch (err) {
            console.log('failed updating', entryId, text);
        }
    },
    async checklistCheck({ _id, entryId, checked }) {
        const tool = await toolInstances.findOneAsync({ _id, 'content._id': entryId });
        if (tool) {
            await toolInstances.updateAsync(_id, { $pull: { content: { _id: entryId } } });
            const firstChecked = tool.content.findIndex(x => x.checked === true);
            const content = tool.content.find(x => x._id === entryId);
            await toolInstances.updateAsync(_id, {
                $push: {
                    content: {
                        $each: [{ ...content, checked }],
                        $position: firstChecked === -1 ? tool.content.length : firstChecked
                    }
                }
            });
        }
    },
})