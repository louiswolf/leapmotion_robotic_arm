var Cylon = require('cylon');

var SERVO_ZERO_PIN = 3;
var SERVO_ONE_PIN = 5;
var LED_ZERO_PIN = 13;
var LED_ONE_PIN = 12;

var fingerCount = 0;
var angles = [180, 180];

Cylon.robot({
  connections: {
    arduino: { adaptor: 'firmata', port: 'com7' },
    leapmotion: { adaptor: 'leapmotion', port: '127.0.0.1:6437' }
  },

  devices: {
    led0: { driver: 'led', pin: LED_ZERO_PIN, connection: 'arduino' },
    servo0: { driver: 'servo', pin: SERVO_ZERO_PIN },
    led1: { driver: 'led', pin: LED_ONE_PIN, connection: 'arduino' },
    servo1: { driver: 'servo', pin: SERVO_ONE_PIN },
    leapmotion: { driver: 'leapmotion', connection: 'leapmotion' }
  },

  work: function(my) {
    
    my.leapmotion.on('hand', function(hand) {
        //console.log('hand detected');
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

        if (fingerCount == 1) {
          my.led0.turnOn();
          my.led1.turnOff();
        } else if (fingerCount == 2) {
          my.led1.turnOn();
          my.led0.turnOff();
        } else {
          my.led0.turnOff();
          my.led1.turnOff();
        }
    });

    my.leapmotion.on('gesture', function(gesture) {

      if (gesture.type == 'circle' && (fingerCount == 1 || fingerCount == 2)) {
        
        var servo = my.servo0;
        var angleId = 0;
        if (fingerCount == 2) {
          servo = my.servo1;
          angleId = 1;
        }

        if (gesture.normal[2] > 0) {
          if (angles[angleId] < 180) {
            angles[angleId] = angles[angleId] + 1;
          }
        } else {
          if (angles[angleId] > 0) {
            angles[angleId] = angles[angleId] - 1;
          }
        }
        
        servo.angle(angles[angleId]);
        console.log("servo " + fingerCount + ": " + gesture.type + ' ' + angles[angleId]);
      }
    });
  }
}).start();