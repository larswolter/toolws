import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import { toolInstances } from '../collections';
import localforage from 'localforage';
import { withSnackbar } from 'notistack'
import { Promise } from 'meteor/promise';
import { debounce } from 'lodash';

export const myTools = new Mongo.Collection(null);
export const myToolIds = new ReactiveVar();
window._globalState_ = { toolInstances, myTools, myToolIds };

localforage.getItem('myToolIds').then((toolIds) => {
    if (!myToolIds.get()) {
        myToolIds.set(toolIds || []);
    }
});
localforage.getItem('myTools').then((tools) => {
    if (tools && !myTools.find().count()) {
        tools.forEach(tool=>myTools.insert(tool));
    }
});

export const updateForage = debounce(()=> {
    localforage.setItem('myTools',myTools.find().fetch()).then(()=>{
    });
},200);

toolInstances.find().observe({

    added(tool) {
        const toolIds = myToolIds.get();
        if(toolIds.includes(tool._id)) {
            myTools.upsert(tool._id,tool);
            updateForage();
        }
    },
    changed(tool) {
        myTools.update(tool._id,tool);
        updateForage();
    },
    removed(toolId) {
        const toolIds = myToolIds.get();
        if(!toolIds.includes(toolId)) {
            myTools.remove(toolId);
            updateForage();
        }
    }
})

Tracker.autorun(() => {
    const toolIds = myToolIds.get();
    toolIds && Meteor.subscribe('myTools', toolIds);
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
