"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var background_geolocation_common_1 = require("./background-geolocation.common");
var permissions = require("nativescript-permissions");
var app = require("application");
var Callback = com.transistorsoft.locationmanager.adapter.TSCallback;
var TAG = "TSLocationnManager";
var REQUEST_ACTION_START = 1;
var REQUEST_ACTION_GET_CURRENT_POSITION = 2;
var REQUEST_ACTION_START_GEOFENCES = 3;
var emptyFn = function () { };
// Inform adapter.BackgroundGeolocation when Activity is destroyed.
app.android.on(app.AndroidApplication.activityDestroyedEvent, function (args) {
    BackgroundGeolocation.onActivityDestroyed(args);
});
var BackgroundGeolocation = (function (_super) {
    __extends(BackgroundGeolocation, _super);
    function BackgroundGeolocation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BackgroundGeolocation.onActivityDestroyed = function (args) {
        this.getAdapter().onActivityDestroy();
        this.intent = null;
    };
    BackgroundGeolocation.on = function (event, success, failure) {
        if (typeof (event) === 'object') {
            for (var key in event) {
                this.on(key, event[key]);
            }
            return;
        }
        if (this.events.indexOf(event) < 0) {
            throw "Invalid event: " + event;
        }
        failure = failure || emptyFn;
        var cb;
        switch (event) {
            case 'motionchange':
                cb = this.createMotionChangeCallback(success);
                break;
            case 'activitychange':
                cb = this.createActivityChangeCallback(success);
                break;
            case 'http':
                cb = this.createHttpCallback(success, failure);
                break;
            default:
                cb = new Callback({
                    success: function (response) {
                        success(JSON.parse(response.toString()));
                    },
                    error: failure
                });
                break;
        }
        this.getAdapter().on(event, cb);
    };
    BackgroundGeolocation.removeListeners = function () {
        this.getAdapter().removeListeners();
    };
    /**
    * Configuration Methods
    */
    BackgroundGeolocation.configure = function (config, success, failure) {
        var callback = new Callback({
            success: function (state) {
                success(JSON.parse(state.toString()));
            }.bind(this),
            error: function (error) {
                failure(error);
            }.bind(this)
        });
        this.getAdapter().configure(new org.json.JSONObject(JSON.stringify(config)), callback);
    };
    BackgroundGeolocation.setConfig = function (config, success, failure) {
        success = success || emptyFn;
        var callback = new Callback({
            success: function (state) {
                success(JSON.parse(state.toString()));
            },
            error: failure || emptyFn
        });
        this.getAdapter().setConfig(new org.json.JSONObject(JSON.stringify(config)), callback);
    };
    BackgroundGeolocation.getState = function (success) {
        var callback = new Callback({
            success: function (state) {
                success(JSON.parse(state.toString()));
            },
            error: emptyFn
        });
        this.getAdapter().getState(callback);
    };
    /**
    * Tracking Methods
    */
    BackgroundGeolocation.start = function (success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        if (this.hasPermission()) {
            this.setEnabled(true, success, failure);
        }
        else {
            this.requestPermission(function () {
                this.setEnabled(true, success, failure);
            }.bind(this), function () {
                console.log('- requestPermission failure');
            }.bind(this));
        }
    };
    BackgroundGeolocation.stop = function (success, failure) {
        success = success || emptyFn;
        this.getAdapter().stop(new Callback({
            success: function (state) {
                success(JSON.parse(state.toString()));
            },
            error: failure || emptyFn
        }));
    };
    BackgroundGeolocation.changePace = function (value, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var cb = new Callback({
            success: function (location) {
                success(JSON.parse(location.toString()));
            },
            error: failure
        });
        this.getAdapter().changePace(value, cb);
    };
    BackgroundGeolocation.startSchedule = function (success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        if (this.getAdapter().startSchedule()) {
            this.getState(success);
        }
        else {
            failure("Failed to start schedule.  Did you configure a #schedule?");
        }
    };
    BackgroundGeolocation.stopSchedule = function (success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        this.getAdapter().stopSchedule();
        this.getState(success);
    };
    BackgroundGeolocation.getCurrentPosition = function (success, failure, options) {
        failure = failure || emptyFn;
        options = options || {};
        var callback = new Callback({
            success: function (location) {
                success(JSON.parse(location.toString()));
            },
            error: function (error) {
                failure(error);
            }
        });
        this.getAdapter().getCurrentPosition(new org.json.JSONObject(JSON.stringify(options)), callback);
    };
    BackgroundGeolocation.watchPosition = function (success, failure, options) {
        failure = failure || emptyFn;
        options = options || {};
        var callback = new Callback({
            success: function (location) {
                success(JSON.parse(location.toString()));
            },
            error: function (error) {
                failure(error);
            }
        });
        this.getAdapter().watchPosition(new org.json.JSONObject(JSON.stringify(options)), callback);
    };
    BackgroundGeolocation.stopWatchPosition = function (success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var callback = new Callback({
            success: function (result) {
                success(result);
            },
            error: function (error) {
                failure(error);
            }
        });
        this.getAdapter().stopWatchPosition(callback);
    };
    BackgroundGeolocation.getOdometer = function (success, failure) {
        success(this.getAdapter().getOdometer());
    };
    BackgroundGeolocation.setOdometer = function (value, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var callback = new Callback({
            success: function (location) {
                success(JSON.parse(location.toString()));
            },
            error: function (error) {
                failure(error);
            }
        });
        if (this.hasPermission()) {
            this.getAdapter().setOdometer(new java.lang.Float(value), callback);
        }
        else {
            this.requestPermission(function () {
                this.getAdapter().setOdometer(new java.lang.Float(value), callback);
            }.bind(this), function () {
                console.log('- requestPermission failure');
            }.bind(this));
        }
    };
    BackgroundGeolocation.resetOdometer = function (success, failure) {
        this.setOdometer(0, success, failure);
    };
    /**
    * HTTP & Persistence Methods
    */
    BackgroundGeolocation.sync = function (success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var callback = new Callback({
            success: function (rs) {
                success(JSON.parse(rs.toString()));
            },
            error: function (error) {
                failure(error);
            }
        });
        this.getAdapter().sync(callback);
    };
    BackgroundGeolocation.getLocations = function (success, failure) {
        failure = failure || emptyFn;
        var callback = new Callback({
            success: function (rs) {
                success(JSON.parse(rs.toString()));
            },
            error: function (error) {
                failure(error);
            }
        });
        this.getAdapter().getLocations(callback);
    };
    BackgroundGeolocation.getCount = function (success) {
        var callback = new Callback({
            success: function (count) {
                success(count);
            },
            error: function (error) { }
        });
        this.getAdapter().getCount(callback);
    };
    BackgroundGeolocation.insertLocation = function (data, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var callback = new Callback({
            success: function (uuid) {
                success(uuid);
            },
            error: function (error) {
                failure(error);
            }
        });
        this.getAdapter().insertLocation(new org.json.JSONObject(JSON.stringify(data)), callback);
    };
    // @deprecated
    BackgroundGeolocation.clearDatabase = function (success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        this.destroyLocations(success, failure);
    };
    BackgroundGeolocation.destroyLocations = function (success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var callback = new Callback({
            success: function (result) {
                success(result);
            },
            error: function (error) {
                failure(error);
            }
        });
        this.getAdapter().destroyLocations(callback);
    };
    /**
    * Geofencing Methods
    */
    BackgroundGeolocation.addGeofence = function (params, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var callback = new Callback({
            success: function (result) {
                success(result);
            },
            error: function (error) {
                failure(error);
            }
        });
        this.getAdapter().addGeofence(new org.json.JSONObject(JSON.stringify(params)), callback);
    };
    BackgroundGeolocation.removeGeofence = function (identifier, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var callback = new Callback({
            success: function (result) {
                success(result);
            },
            error: function (error) {
                failure(error);
            }
        });
        this.getAdapter().removeGeofence(identifier, callback);
    };
    BackgroundGeolocation.addGeofences = function (geofences, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var callback = new Callback({
            success: function (result) {
                success(result);
            },
            error: function (error) {
                failure(error);
            }
        });
        this.getAdapter().addGeofences(new org.json.JSONArray(JSON.stringify(geofences)), callback);
    };
    BackgroundGeolocation.removeGeofences = function (geofences, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var callback = new Callback({
            success: function (result) {
                success(result);
            },
            error: function (error) {
                failure(error);
            }
        });
        geofences = geofences || [];
        this.getAdapter().removeGeofences(new org.json.JSONArray(JSON.stringify(geofences)), callback);
    };
    BackgroundGeolocation.getGeofences = function (success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var callback = new Callback({
            success: function (rs) {
                success(JSON.parse(rs.toString()));
            },
            error: function (error) {
                failure(error);
            }
        });
        this.getAdapter().getGeofences(callback);
    };
    /**
    * Logging & Debug methods
    */
    BackgroundGeolocation.getLog = function (success, failure) {
        failure = failure || emptyFn;
        var callback = new Callback({
            success: function (log) {
                success(log);
            },
            error: function (error) {
                failure(error);
            }
        });
        this.getAdapter().getLog(callback);
    };
    BackgroundGeolocation.emailLog = function (email, success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var callback = new Callback({
            success: function (result) {
                success(result);
            },
            error: function (error) {
                failure(error);
            }
        });
        console.warn('BackgroundGeolocation#emailLog -- NOT IMPLEMENTED');
    };
    BackgroundGeolocation.destroyLog = function (success, failure) {
        success = success || emptyFn;
        failure = failure || emptyFn;
        var callback = new Callback({
            success: function (response) {
                success(response);
            },
            error: function (error) {
                failure(error);
            }
        });
        this.getAdapter().destroyLog(callback);
    };
    BackgroundGeolocation.startBackgroundTask = function (success) {
        // Just return 0 for compatibility with iOS API.  Android has no concept of these iOS-only background-tasks.
        success(0);
    };
    BackgroundGeolocation.finish = function (taskId) {
        // Just an empty function for compatibility with iOS.  Android has no concept of these iOS-only background-tasks.
    };
    BackgroundGeolocation.playSound = function (soundId) {
        com.transistorsoft.locationmanager.adapter.BackgroundGeolocation.startTone(soundId);
    };
    /**
    * Private
    */
    BackgroundGeolocation.setEnabled = function (value, success, failure) {
        var adapter = this.getAdapter();
        if (value) {
            var me = this;
            var callback = new Callback({
                success: success,
                error: failure
            });
            adapter.start(callback);
        }
    };
    BackgroundGeolocation.createHttpCallback = function (success, failure) {
        failure = failure || emptyFn;
        return new Callback({
            success: function (response) {
                success(JSON.parse(response.toString()));
            },
            error: function (response) {
                failure(JSON.parse(response.toString()));
            }
        });
    };
    BackgroundGeolocation.createMotionChangeCallback = function (callback) {
        return new Callback({
            success: function (params) {
                var location = params.getJSONObject("location");
                var moving = params.getBoolean("isMoving");
                callback(moving, JSON.parse(location.toString()));
            },
            error: function (error) { }
        });
    };
    BackgroundGeolocation.createActivityChangeCallback = function (callback) {
        return new Callback({
            success: function (activityName) {
                callback(activityName);
            },
            error: function (error) { }
        });
    };
    BackgroundGeolocation.onGooglePlayServicesConnectError = function (errorCode) {
        com.google.android.gms.common.GoogleApiAvailability.getInstance().getErrorDialog(app.android.foregroundActivity, errorCode, 1001).show();
    };
    BackgroundGeolocation.hasPermission = function () {
        var result = android.os.Build.VERSION.SDK_INT < 23;
        if (!result) {
            result = ((permissions.hasPermission(android.Manifest.permission.ACCESS_FINE_LOCATION))
                && (permissions.hasPermission(android.Manifest.permission.ACCESS_COARSE_LOCATION)));
        }
        return result;
    };
    BackgroundGeolocation.init = function () {
        this.intent = app.android.foregroundActivity.getIntent();
        this.getAdapter().on("playservicesconnecterror", new Callback({
            success: this.onGooglePlayServicesConnectError.bind(this),
            error: emptyFn
        }));
    };
    BackgroundGeolocation.getAdapter = function () {
        if (!this.intent) {
            this.init();
        }
        return com.transistorsoft.locationmanager.adapter.BackgroundGeolocation.getInstance(app.android.context, this.intent);
    };
    BackgroundGeolocation.requestPermission = function (success, failure) {
        permissions.requestPermission(android.Manifest.permission.ACCESS_FINE_LOCATION, "Background tracking required").then(success).catch(failure);
    };
    return BackgroundGeolocation;
}(background_geolocation_common_1.AbstractBackgroundGeolocation));
BackgroundGeolocation.isStarting = false;
BackgroundGeolocation.startCallback = null;
exports.BackgroundGeolocation = BackgroundGeolocation;
//# sourceMappingURL=background-geolocation.android.js.map