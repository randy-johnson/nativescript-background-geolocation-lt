"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var background_geolocation_common_1 = require("./background-geolocation.common");
var utils = require("utils/utils");
var TS_LOCATION_TYPE_MOTIONCHANGE = 0;
var TS_LOCATION_TYPE_CURRENT = 1;
var TS_LOCATION_TYPE_SAMPLE = 2;
var emptyFn = function (param) { };
var BackgroundGeolocation = (function (_super) {
    __extends(BackgroundGeolocation, _super);
    function BackgroundGeolocation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
    * Configuration Methods
    */
    BackgroundGeolocation.on = function (event, success, failure) {
        // Handle {Object} form #on({foo: fooHandler, bar: barHandler});
        if (typeof (event) === 'object') {
            var listener, key;
            for (key in event) {
                this.on(key, event[key]);
            }
            return;
        }
        if (this.events.indexOf(event) < 0) {
            throw "Invalid event: " + event;
        }
        if (typeof (this.listeners[event]) === 'object') {
            this.listeners[event].push({
                success: success,
                error: failure
            });
        }
        else {
            this.getLocationManager().addListenerCallback(event, function (event) {
                return success(this.getJsObjectFromNSDictionary(event));
            }.bind(this));
        }
    };
    BackgroundGeolocation.removeListeners = function () {
        var key;
        for (key in this.listeners) {
            this.listeners[key] = [];
        }
    };
    BackgroundGeolocation.configure = function (config, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var locationManager = this.getLocationManager();
        this.syncTaskId = null;
        this.state = locationManager.configure(config);
        this.isMoving = this.state.isMoving;
        this.enabled = this.state.enabled;
        success(this.getJsObjectFromNSDictionary(this.state));
    };
    BackgroundGeolocation.setConfig = function (config, success, failure) {
        var locationManager = this.getLocationManager();
        success = success || emptyFn;
        failure = failure || emptyFn;
        locationManager.setConfig(config);
        this.getState(success);
    };
    BackgroundGeolocation.getState = function (success) {
        success(this.getJsObjectFromNSDictionary(this.getLocationManager().getState()));
    };
    /**
    * Tracking Methods
    */
    BackgroundGeolocation.start = function (success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        this.getLocationManager().start();
        this.getState(success);
    };
    BackgroundGeolocation.stop = function (success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        this.getLocationManager().stop();
        this.getState(success);
    };
    BackgroundGeolocation.changePace = function (value, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        this.locationManager.changePace(value);
        success(value);
    };
    BackgroundGeolocation.startSchedule = function (success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        this.getLocationManager().startSchedule();
        this.getState(success);
    };
    BackgroundGeolocation.stopSchedule = function (success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        this.getLocationManager().stopSchedule();
        this.getState(success);
    };
    BackgroundGeolocation.getCurrentPosition = function (success, failure, options) {
        failure = failure || emptyFn;
        var mySuccess = function (location) {
            success(this.getJsObjectFromNSDictionary(location));
        }.bind(this);
        var myFailure = function (error) {
            failure(error.code);
        }.bind(this);
        this.getLocationManager().getCurrentPositionSuccessFailure(options || {}, mySuccess, myFailure);
    };
    BackgroundGeolocation.watchPosition = function (success, failure, options) {
        failure = failure || emptyFn;
        var mySuccess = function (location) {
            success(this.getJsObjectFromNSDictionary(location));
        }.bind(this);
        var myFailure = function (error) {
            failure(error.code);
        }.bind(this);
        this.getLocationManager().watchPositionSuccessFailure(options || {}, mySuccess, myFailure);
    };
    BackgroundGeolocation.stopWatchPosition = function (success, failure) {
        this.getLocationManager().stopWatchPosition();
        if (success) {
            success(true);
        }
    };
    BackgroundGeolocation.getOdometer = function (success, failure) {
        success(this.getLocationManager().getOdometer());
    };
    BackgroundGeolocation.setOdometer = function (value, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var mySuccess = function (location) {
            success(this.getJsObjectFromNSDictionary(location));
        }.bind(this);
        var myFailure = function (error) {
            failure(error.code);
        }.bind(this);
        this.getLocationManager().setOdometerSuccessFailure(value, mySuccess, myFailure);
    };
    BackgroundGeolocation.resetOdometer = function (success, failure) {
        this.setOdometer(0, success, failure);
    };
    /**
    * HTTP & Persistence Methods
    */
    BackgroundGeolocation.sync = function (success, failure) {
        if (this.syncCallback) {
            failure("A sync action is already in progress");
            return;
        }
        var locationManager = this.getLocationManager();
        failure = failure || emptyFn;
        // Important to set these before we execute #sync since this fires a *very fast* async NSNotification event!
        this.syncTaskId = locationManager.createBackgroundTask();
        var locations = locationManager.sync();
        if (locations == null) {
            locationManager.stopBackgroundTask(this.syncTaskId);
            this.syncCallback = null;
            this.syncTaskId = null;
            failure("Sync failed.  Is there a network connection or previous sync-task pending?");
            return;
        }
        else {
            this.syncCallback = {
                success: success,
                error: failure || this.emptyFn
            };
        }
    };
    BackgroundGeolocation.getLocations = function (success, failure) {
        failure = failure || emptyFn;
        var rs = this.getJsArrayFromNSArray(this.getLocationManager().getLocations());
        success(rs);
        //success(this.getJsArrayFromNSArray(this.getLocationManager().getLocations()));
    };
    BackgroundGeolocation.getCount = function (success) {
        success(this.getLocationManager().getCount());
    };
    BackgroundGeolocation.insertLocation = function (data, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        if (!data.timestamp) {
            return failure('Must contain a timestamp');
        }
        else if (!data.uuid) {
            return failure('Must contain a UUID');
        }
        else if (!data.latitude) {
            return failure('Must contain a latitude');
        }
        else if (!data.longitude) {
            return failure('Must contain a longitude');
        }
        if (this.getLocationManager().insertLocation(data)) {
            if (success) {
                success(true);
            }
        }
        else if (failure) {
            failure(false);
        }
    };
    // @deprecated
    BackgroundGeolocation.clearDatabase = function (success, failure) {
        this.destroyLocations(success, failure);
    };
    BackgroundGeolocation.destroyLocations = function (success, failure) {
        if (this.getLocationManager().destroyLocations()) {
            if (success) {
                success();
            }
        }
        else {
            if (failure) {
                failure();
            }
        }
    };
    /**
    * Geofencing Methods
    */
    BackgroundGeolocation.addGeofence = function (params, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        if (!params.identifier) {
            throw "#addGeofence requires an 'identifier'";
        }
        if (!(params.latitude && params.longitude)) {
            throw "#addGeofence requires a #latitude and #longitude";
        }
        if (!params.radius) {
            throw "#addGeofence requires a #radius";
        }
        if ((typeof (params.notifyOnDwell) === 'undefined') && (typeof (params.notifyOnEntry) === 'undefined') && (typeof (params.notifyOnExit) === 'undefined')) {
            throw "#addGeofence requires at least notifyOnDwell {Boolean} and/or notifyOnEntry {Boolean} and/or #notifyOnExit {Boolean}";
        }
        if (typeof (params.notifyOnEntry) === 'undefined') {
            params.notifyOnEntry = false;
        }
        if (typeof (params.notifyOnDwell) === 'undefined') {
            params.notifyOnDwell = false;
        }
        if (typeof (params.notifyOnExit) === 'undefined') {
            params.notifyOnEntry = false;
        }
        this.getLocationManager().addGeofenceSuccessError(params, success, failure);
    };
    BackgroundGeolocation.removeGeofence = function (identifier, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        this.getLocationManager().removeGeofenceSuccessError(identifier, success, failure);
    };
    BackgroundGeolocation.addGeofences = function (geofences, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        this.getLocationManager().addGeofencesSuccessError(geofences, success, failure);
    };
    BackgroundGeolocation.removeGeofences = function (geofences, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var geofences = geofences || [];
        this.getLocationManager().removeGeofencesSuccessError(geofences, success, failure);
    };
    BackgroundGeolocation.getGeofences = function (success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        success(this.getJsArrayFromNSArray(this.getLocationManager().getGeofences()));
    };
    BackgroundGeolocation.startBackgroundTask = function (success) {
        success(this.getLocationManager().createBackgroundTask());
    };
    BackgroundGeolocation.finish = function (taskId) {
        this.getLocationManager().stopBackgroundTask(taskId);
    };
    /**
    * Logging & Debug methods
    */
    BackgroundGeolocation.playSound = function (soundId) {
        this.getLocationManager().playSound(soundId);
    };
    BackgroundGeolocation.getLog = function (success, failure) {
        success(this.getLocationManager().getLog());
    };
    BackgroundGeolocation.destroyLog = function (success, failure) {
        if (this.getLocationManager().destroyLog()) {
            if (success) {
                success();
            }
        }
        else if (failure) {
            failure();
        }
    };
    BackgroundGeolocation.emailLog = function (email) {
        this.getLocationManager().emailLog(email);
    };
    /**
    * Private
    */
    BackgroundGeolocation.onLocation = function (location, type, isMoving) {
        var callbacks = this.listeners.location;
        var locationData = this.getJsObjectFromNSDictionary(location);
        for (var n = 0, len = callbacks.length; n < len; n++) {
            callbacks[n].success(locationData);
        }
        if (type != TS_LOCATION_TYPE_SAMPLE && this.currentPositionCallbacks.length) {
            for (var n = 0, len = this.currentPositionCallbacks.length; n < len; n++) {
                this.currentPositionCallbacks[n].success(locationData);
            }
            this.currentPositionCallbacks = [];
        }
    };
    BackgroundGeolocation.onMotionChange = function (location, isMoving) {
        var callbacks = this.listeners.motionchange;
        var locationData = this.getJsObjectFromNSDictionary(location);
        for (var n = 0, len = callbacks.length; n < len; n++) {
            callbacks[n].success(isMoving, locationData);
        }
    };
    BackgroundGeolocation.onGeofence = function (ev) {
        var event = this.getJsObjectFromNSDictionary(ev);
        var callbacks = this.listeners.geofence;
        for (var n = 0, len = callbacks.length; n < len; n++) {
            callbacks[n].success(event);
        }
    };
    BackgroundGeolocation.onHttp = function (statusCode, requestData, responseData, error) {
        var callbacks = this.listeners.http;
        var responseText = "";
        var callbackFn = 'success';
        if (error) {
            responseText = error.localizedDescription;
            callbackFn = 'error';
        }
        else {
            responseText = NSString.alloc().initWithDataEncoding(responseData, NSUTF8StringEncoding).toString();
            callbackFn = 'success';
        }
        for (var n = 0, len = callbacks.length; n < len; n++) {
            callbacks[n][callbackFn]({
                status: statusCode,
                responseText: responseText
            });
        }
    };
    BackgroundGeolocation.onError = function (type, error) {
        if (type === 'location') {
            var errorCode = error.code;
            var listeners = this.currentPositionCallbacks;
            if (listeners.length) {
                for (var n = 0, len = this.currentPositionCallbacks.length; n < len; n++) {
                    listeners[n].error(errorCode);
                }
                this.currentPositionCallbacks = [];
            }
            /* TODO broken
            listeners = this.listeners.location;
            for (var n=0,len=listeners.length;n<len;n++) {
              listeners[n].error[n](errorCode);
            }
            */
        }
    };
    BackgroundGeolocation.onHeartbeat = function (motionType, location) {
        var params = {
            motionType: motionType,
            location: this.getJsObjectFromNSDictionary(location)
        };
        var callbacks = this.listeners.heartbeat;
        for (var n = 0, len = callbacks.length; n < len; n++) {
            callbacks[n].success(params);
        }
    };
    BackgroundGeolocation.onSyncComplete = function (locations) {
        if (this.syncCallback == null) {
            return;
        }
        this.syncCallback.success(this.getJsArrayFromNSArray(locations));
        this.getLocationManager().stopBackgroundTask(this.syncTaskId);
        this.syncCallback = null;
        this.syncTaskId = null;
    };
    BackgroundGeolocation.onActivityChange = function (activityName) {
        var callbacks = this.listeners.activitychange;
        for (var n = 0, len = callbacks.length; n < len; n++) {
            callbacks[n].success(activityName);
        }
    };
    BackgroundGeolocation.onProviderChange = function (status) {
        var state = this.getLocationManager().getState();
        var authorizationRequest = state.objectForKey("locationAuthorizationRequest");
        var enabled = false;
        switch (status) {
            case CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedAlways:
                enabled = (authorizationRequest == "Always");
                break;
            case CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedWhenInUse:
                enabled = (authorizationRequest == "WhenInUse");
                break;
            case CLAuthorizationStatus.kCLAuthorizationStatusDenied:
            case CLAuthorizationStatus.kCLAuthorizationStatusRestricted:
            case CLAuthorizationStatus.kCLAuthorizationStatusNotDetermined:
                enabled = false;
                break;
        }
        var result = {
            enabled: enabled,
            gps: enabled,
            network: enabled,
            status: status
        };
        var callbacks = this.listeners.providerchange;
        for (var n = 0, len = callbacks.length; n < len; n++) {
            callbacks[n].success(result);
        }
    };
    BackgroundGeolocation.onSchedule = function (schedule) {
        var callbacks = this.listeners.schedule;
        for (var n = 0, len = callbacks.length; n < len; n++) {
            this.getState(callbacks[n].success);
        }
    };
    BackgroundGeolocation.getAdapter = function () {
    };
    BackgroundGeolocation.getLocationManager = function () {
        if (!this.locationManager) {
            var app = utils.ios.getter(UIApplication, UIApplication.sharedApplication);
            this.locationManager = TSLocationManager.sharedInstance();
            this.locationManager.locationChangedBlock = this.onLocation.bind(this);
            this.locationManager.httpResponseBlock = this.onHttp.bind(this);
            this.locationManager.motionChangedBlock = this.onMotionChange.bind(this);
            this.locationManager.geofenceBlock = this.onGeofence.bind(this);
            this.locationManager.activityChangedBlock = this.onActivityChange.bind(this);
            this.locationManager.authorizationChangedBlock = this.onProviderChange.bind(this);
            this.locationManager.errorBlock = this.onError.bind(this);
            this.locationManager.heartbeatBlock = this.onHeartbeat.bind(this);
            this.locationManager.syncCompleteBlock = this.onSyncComplete.bind(this);
            this.locationManager.scheduleBlock = this.onSchedule.bind(this);
            this.locationManager.viewController = app.keyWindow.rootViewController;
        }
        return this.locationManager;
    };
    BackgroundGeolocation.getJsObjectFromNSDictionary = function (dictionary) {
        var keys = dictionary.allKeys;
        var result = {};
        for (var loop = 0; loop < keys.count; loop++) {
            var key = keys[loop];
            var item = dictionary.objectForKey(key);
            result[key] = this.getJsObject(item);
        }
        return result;
    };
    BackgroundGeolocation.getJsArrayFromNSArray = function (array) {
        var result = [];
        for (var loop = 0; loop < array.count; loop++) {
            result.push(this.getJsObject(array.objectAtIndex(loop)));
        }
        return result;
    };
    BackgroundGeolocation.getJsObject = function (object) {
        if (object instanceof NSDictionary) {
            return this.getJsObjectFromNSDictionary(object);
        }
        if (object instanceof NSArray) {
            return this.getJsArrayFromNSArray(object);
        }
        return object;
    };
    return BackgroundGeolocation;
}(background_geolocation_common_1.AbstractBackgroundGeolocation));
exports.BackgroundGeolocation = BackgroundGeolocation;
//# sourceMappingURL=background-geolocation.ios.js.map