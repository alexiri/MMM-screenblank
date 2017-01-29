Module.register('MMM-screenblank', {
    // Default module config.
    defaults: {
        updateInterval: 10 * 1000,
        initialLoadDelay: 0, // 0 seconds delay
        default_state: false,
        schedule: {
            '08:30': true,
            '09:30': false,

            '11:07': true,
            '11:08': false,

            '11:30': true,
            '11:35': false,
        },
    },


    getScripts: function() {
        return [
            'moment.js',
            this.file('node_modules/underscore/underscore-min.js'),
        ];
    },

    start: function() {
        Log.info('Starting module: ' + this.name);
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
            Log.info('It is now', now.format('HH:mm:ss'));

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
            Log.info('final state', state);

            self.sendSocketNotification('SET_SCREEN_STATE', { state: state });

            self.checkTime();
        }, nextLoad);
    },

    socketNotificationReceived: function(notification, payload) {
  	     console.log ("socketNotificationReceived.", notification, payload);
         if (notification === 'SCREEN_STATE') {
             Log.info('Screen state: ' + payload.state);
             this.sendNotification(notification, payload);
         }
    },

    /*notificationReceived: function(notification, payload, sender) {
        console.log ("notificationReceived.", notification, payload, sender);
    },*/

});
