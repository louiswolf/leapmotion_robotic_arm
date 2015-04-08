'use strict';

var Cylon = require('cylon');

var IP = '10.2.2.35';
var PORT = '3001';

var EVENT_ONE_FINGER_LEFT = 'one_finger_left';
var EVENT_ONE_FINGER_RIGHT = 'one_finger_right';
var EVENT_TWO_FINGERS_LEFT = 'two_fingers_left';
var EVENT_TWO_FINGERS_RIGHT = 'two_fingers_right';

var fingerCount = 0;

Cylon.robot({
	name: 'oddstream',

	connections: {
		leapmotion: {adaptor: 'leapmotion', port: '127.0.0.1:6437'}
	},

	devices: {
	    leapmotion: { driver: 'leapmotion', connection: 'leapmotion' }
	},

	work: function(my) {

	    my.leapmotion.on('hand', function(hand) {
	       
	        var handOpen = !!hand.fingers.filter(function(f) {
	          return f.extended;
	        }).length;

	        var count = 0;
	        if (handOpen) {
	          count = hand.fingers.filter(function(f) {
	            return f.extended;
	          }).length;
	        }

	        fingerCount = count;
	    });

	    my.leapmotion.on('gesture', function(gesture) {

	      if (gesture.type == 'circle' && (fingerCount == 1 || fingerCount == 2)) {

	        var fingerEvent = '';
	        if (gesture.normal[2] > 0) {

	            fingerEvent = EVENT_ONE_FINGER_LEFT;
	            if (fingerCount == 2) {
	            	fingerEvent = EVENT_TWO_FINGERS_LEFT;
	            }
	        } else {

	          fingerEvent = EVENT_ONE_FINGER_RIGHT;
	          if (fingerCount == 2) {
	          	fingerEvent = EVENT_TWO_FINGERS_RIGHT;
	          }
	        }
	        
			var XMLHttpRequest = require('./XMLHttpRequest.js').XMLHttpRequest;
			var xhr = new XMLHttpRequest();
	    
	        xhr.open('GET', 'http://' + IP + ':' + PORT + '/' + fingerEvent, true);
	        xhr.send();

	        console.log("" + fingerCount + " finger(s) moving in a " + gesture.type + " (" + fingerEvent + ")");
	      }
	    });

	}
});

Cylon.start();