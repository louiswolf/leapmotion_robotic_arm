(function () { 'use strict'; }());

var Cylon = require('cylon');

var IP = '10.2.2.35';
var PORT = '3001';
var TIMER_INTERVAL = 100;
var STEP_SIZE = 4;

var DIRECTION_LEFT = "left";
var DIRECTION_RIGHT = "right";

var fingerCount = 0;
var angles = [0, 0];
var previous = '0000';
var timer = 0;
var time = 0;

function sendMessage(message) {
	var XMLHttpRequest = require('./XMLHttpRequest.js').XMLHttpRequest;
	var xhr = new XMLHttpRequest();

	xhr.open('GET', 'http://' + IP + ':' + PORT + '/' + message, true);
	xhr.send();
}

sendMessage("1000");
sendMessage("2000");

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
			fingerCount = my.countFingersOn(hand);
		});

		my.leapmotion.on('gesture', function(gesture) {

			if (my.isAreRequirementsMet(my, gesture)) {

				timer = Date.now();

				var id = my.getIdByFingerCount();
				var direction = my.calculateAndSetAngle(gesture, id);
				var angle = my.addLeadingZerosForLength(angles[id], 3);

				var message = fingerCount + angle;
				if (message !== previous) {
					my.sendMessage(message);
					console.log("Je beweegt nu " + fingerCount + " vinger" + (fingerCount > 1 ? "s" : "") + " in een " + (gesture.type == "circle" ? "cirkel" : gesture.type) + " naar " + (direction == DIRECTION_LEFT ? "links" : "rechts") + " (" + message + ")");
					previous = message;
				}
			}
		});
	},

	calculateAndSetAngle: function(gesture, id) {
		var angle = angles[id];
		var direction = DIRECTION_RIGHT;
		if (gesture.normal[2] > 0) {
			direction = DIRECTION_LEFT;
			if (angle > 0) {
				angle = angle - STEP_SIZE;
			}
		} else {
			if (angle < 180) {
				angle = angle + STEP_SIZE;
			}
		}
		angles[id] = angle;
		return direction;
	},

	getIdByFingerCount: function() {
		var angleId = 0;
		if (fingerCount == 2) {
			angleId = 1;
		}
		return angleId;
	},

	isAreRequirementsMet: function(my, gesture) {
		return my.isSurpassedInterval() && my.isGestureCircle(gesture) && my.isValidFingerCount();
	},

	isSurpassedInterval: function() {
		return (Date.now() - timer > TIMER_INTERVAL);
	},

	isGestureCircle: function(gesture) {
		return gesture.type === 'circle';
	},

	isValidFingerCount: function() {
		return (fingerCount == 1 || fingerCount == 2);
	},

	countFingersOn: function(hand) {
		var handOpen = !!hand.fingers.filter(function(f) {
			return f.extended;
		}).length;

		var count = 0;
		if (handOpen) {
			count = hand.fingers.filter(function(f) {
				return f.extended;
			}).length;
		}

		return count;
	},

	addLeadingZerosForLength: function(angle, length) {
		var angleString = "" + angle;
		while (angleString.length < length) {
			angleString = "0" + angleString;
		}
		return angleString;
	},

	sendMessage: function(message) {
		var XMLHttpRequest = require('./XMLHttpRequest.js').XMLHttpRequest;
		var xhr = new XMLHttpRequest();

		xhr.open('GET', 'http://' + IP + ':' + PORT + '/' + message, true);
		xhr.send();
	}
});

Cylon.start();