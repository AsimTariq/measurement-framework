import forEach from "lodash-es/forEach";
import merge from "lodash-es/merge";
import customTask from "./customTask";
import isFunction from "lodash-es/isFunction";

let sendHitTaskFunctions = [];
let customFunctionIsMounted = false;
/**
 * Registrating the Send Hit Task Callback
 */



export default function sendHitTask(func) {
    if (isFunction(func)) {
        sendHitTaskFunctions.push(func);
        if (!customFunctionIsMounted) {
            customTask(function (model) {
                // Grab a reference to the default sendHitTask function.
                const taskToOverride = 'sendHitTask';
                const originalSendHitTask = model.get(taskToOverride);
                let dataLayerObject = {};
                // The tracking system will allow for the maximum of one custom Task, this function let us have infinite.
                model.set(taskToOverride, function (sendHitTaskModel) {
                    console.log("sendHitTaskRunner running these tasks: ", sendHitTaskFunctions);
                    forEach(sendHitTaskFunctions, function (taskFunction) {
                        try {
                            /**
                             * Wrapping this in a try/catch as its madly critical.
                             */
                            let result = taskFunction(sendHitTaskModel);
                            dataLayerObject = merge(dataLayerObject, result);
                        } catch (e) {
                            console.error(e.message);
                        }
                    });
                    originalSendHitTask(sendHitTaskModel);
                });
                dataLayerObject.debug = "Registered " + sendHitTaskFunctions.length + " number of hit-tasks.";
                return dataLayerObject;
            });
            customFunctionIsMounted = true;
        }
    } else {
        console.warn("Measurement Framework received a non-function.", func);
    }
}