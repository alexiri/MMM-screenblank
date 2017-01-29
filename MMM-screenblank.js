Module.register('MMM-screenblank', {
    // Default module config.
    defaults: {
        updateInterval: 10 * 1000, // 10 seconds
        initialLoadDelay: 0, // 0 seconds delay

        default_state: false,
        schedule: {
            '08:30': true,
            '09:30': false,
        },

        screen_control_method: 'HIDE_ALL', // one of HIDE_ALL, etc.

        wake_on_notifications: ['SKYWRITER_GESTURE'],
        wake_time: 5 * 60 * 1000, // 5 minutes
    },


    getScripts: function() {
        return [
            'moment.js',
            this.file('node_modules/underscore/underscore-min.js'),
        ];
    },

    start: function() {
        Log.info('Starting module: ' + this.name);

        var screen_state;
        var disable_schedule = false;
        var wake_timer;
        this.checkTime(this.config.initialLoadDelay);
    },

    checkTime: function(delay) {
        var nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
          nextLoad = delay;
        }

        var self = this;
        setTimeout(function() {
            var now = moment();

            if (!self.disable_schedule) {
                var times = _.keys(self.config.schedule);
                times = _.sortBy(times, function(time) { return moment(time, 'HH:mm');});

                state = self.config.default_state;
                for(var i = 0; i < times.length; i++) {
                    if (moment(times[i], 'HH:mm') <= now) {
                        state = self.config.schedule[times[i]];
                    } else {
                        break;
                    }
                }

                self.setScreenState(state);
            }

            self.checkTime();
        }, nextLoad);
    },

    setScreenState: function(state) {
        if (this.screen_state == state) { return; }

        if (this.config.screen_control_method == 'HIDE_ALL') {
            var self = this;
            MM.getModules().enumerate(function(module) {
                if (state) {
                    Log.info('Showing all modules');
                    module.show(1000, {lockString: self.name});
                } else {
                    Log.info('Hiding all modules');
                    module.hide(1000, {lockString: self.name});
                }
            });
            this.screen_state = state;

        } else {
            this.sendSocketNotification('SET_SCREEN_STATE', { state: state, method: self.config.screen_control_method });
        }
    },

    socketNotificationReceived: function(notification, payload) {
  	     console.log ("socketNotificationReceived.", notification, payload);
         if (notification === 'SCREEN_STATE') {
             this.screen_state = payload.state;
             Log.info('Screen state: ' + this.screen_state);
             this.sendNotification(notification, payload);
         }
    },

    notificationReceived: function(notification, payload, sender) {
        if (this.config.wake_on_notifications.indexOf(notification) >= 0) {
            Log.info('Waking up as ordered');
            this.disable_schedule = true;
            this.setScreenState(true);

            if (this.wake_timer) {
                clearTimeout(this.wake_timer);
            }

            var self = this;
            this.wake_timer = setTimeout(function() {
                Log.info('Returning to the schedules');
                self.disable_schedule = false;
            }, this.config.wake_time);
        }
    },

});
