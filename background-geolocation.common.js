"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractBackgroundGeolocation = (function () {
    function AbstractBackgroundGeolocation() {
    }
    return AbstractBackgroundGeolocation;
}());
AbstractBackgroundGeolocation.listeners = {
    location: [],
    http: [],
    motionchange: [],
    error: [],
    heartbeat: [],
    schedule: [],
    activitychange: [],
    providerchange: [],
    geofence: []
};
AbstractBackgroundGeolocation.events = [
    'location',
    'motionchange',
    'providerchange',
    'activitychange',
    'geofenceschange',
    'heartbeat',
    'geofence',
    'schedule',
    'error',
    'http'
];
AbstractBackgroundGeolocation.LOG_LEVEL_OFF = 0;
AbstractBackgroundGeolocation.LOG_LEVEL_ERROR = 1;
AbstractBackgroundGeolocation.LOG_LEVEL_WARNING = 2;
AbstractBackgroundGeolocation.LOG_LEVEL_INFO = 3;
AbstractBackgroundGeolocation.LOG_LEVEL_DEBUG = 4;
AbstractBackgroundGeolocation.LOG_LEVEL_VERBOSE = 5;
AbstractBackgroundGeolocation.DESIRED_ACCURACY_HIGH = 0;
AbstractBackgroundGeolocation.DESIRED_ACCURACY_MEDIUM = 10;
AbstractBackgroundGeolocation.DESIRED_ACCURACY_LOW = 100;
AbstractBackgroundGeolocation.DESIRED_ACCURACY_VERY_LOW = 1000;
AbstractBackgroundGeolocation.AUTHORIZATION_STATUS_NOT_DETERMINED = 0;
AbstractBackgroundGeolocation.AUTHORIZATION_STATUS_RESTRICTED = 1;
AbstractBackgroundGeolocation.AUTHORIZATION_STATUS_DENIED = 2;
AbstractBackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS = 3;
AbstractBackgroundGeolocation.AUTHORIZATION_STATUS_WHEN_IN_USE = 4;
AbstractBackgroundGeolocation.currentPositionCallbacks = [];
AbstractBackgroundGeolocation.watchPositionCallbacks = [];
AbstractBackgroundGeolocation.syncCallback = null;
exports.AbstractBackgroundGeolocation = AbstractBackgroundGeolocation;
//# sourceMappingURL=background-geolocation.common.js.map