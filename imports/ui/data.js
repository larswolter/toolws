import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import { Ground } from 'meteor/ground:db';
import { toolInstances } from '../collections';
import localforage from 'localforage';
import { withSnackbar } from 'notistack'
import { Promise } from 'meteor/promise';

export const myTools = new Ground.Collection('myTools');
export const myToolIds = new ReactiveVar();
window._globalState_ = { toolInstances, myTools, myToolIds };
myTools.observeSource(toolInstances.find());

localforage.getItem('myToolIds').then((toolIds) => {
    if (!myToolIds.get()) {
        myToolIds.set(toolIds || []);
    }
});

Tracker.autorun(() => {
    const toolIds = myToolIds.get();
    toolIds && Meteor.subscribe('myTools', toolIds, () => {
        myTools.keep(toolInstances.find());
    });
});

export const addItemId = (id) => {
    const promise = new Promise((resolve, reject) => {
        localforage.getItem('myToolIds').then((toolIds) => {
            if (!toolIds) toolIds = [];
            if (!toolIds.includes(id)) {
                toolIds.push(id);
                myToolIds.set(toolIds);
                localforage.setItem('myToolIds', toolIds).then(() => {
                    resolve();
                });
            }
        }).catch(reject);
    });
    return promise;
}

export const onRouteWithId = withSnackbar(({ match, enqueueSnackbar }) => {
    const id = match.params.id;
    addItemId(id).then(() => {
        enqueueSnackbar(match.params.type + ' lokal gespeichert');
    });
    return null;
});
