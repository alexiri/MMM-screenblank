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
                // already done
            } else {
                console.error('Unknown method:', payload.method);
            }

            this.screenState = payload.state

            this.sendSocketNotification('SCREEN_STATE', {state: payload.state});
        }
	},

});
