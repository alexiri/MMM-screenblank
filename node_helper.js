'use strict';

const NodeHelper = require('node_helper');
var screenState;

module.exports = NodeHelper.create({

    // Subclass socketNotificationReceived received.
	socketNotificationReceived: function(notification, payload) {
		console.log ("socketNotificationReceived.", notification, payload);
        if (notification === 'SET_SCREEN_STATE' && this.screenState != payload.state) {
            console.log ("setting screen", payload.state);

            // Do some Magic
            if (payload.method === 'HIDE_ALL') {
                this.hide_all(payload.state);
            } else {
                console.error('Unknown method:', payload.method);
            }

            this.screenState = payload.state

            this.sendSocketNotification('SCREEN_STATE', {state: payload.state});
        }
	},

    hide_all: function(state) {
        var self = this;
        MM.getModules().enumerate(function(module) {
            if (state) {
                module.show(1000, {lockString: self.name});
            } else {
                module.hide(1000, {lockString: self.name});
            }
        });
    },

});
