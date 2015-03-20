var Cylon = require('cylon');

Cylon.robot({
  connections: {
    arduino: { adaptor: 'firmata', port: 'com7' },
  	leapmotion: { adaptor: 'leapmotion', port: '127.0.0.1:6437' }
  },

  devices: {
    led0: { driver: 'led', pin: 13, connection: 'arduino' },
    servo0: { driver: 'servo', pin: 3 },
    led1: { driver: 'led', pin: 12, connection: 'arduino' },
    servo1: { driver: 'servo', pin: 5 },
    leapmotion: { driver: 'leapmotion', connection: 'leapmotion' }
  },

  work: function(my) {
    var angle0 = 180;
    var angle1 = 180;
    var fingerCount = 0;
    
    my.leapmotion.on('frame', function(frame) {
    
      if (frame.hands.length > 0) {

        frame.hands.forEach(function(hand) {

          if (hand.frame.gestures.length > 0) {

            fingerCount = 0;
            hand.frame.fingers.forEach(function(finger) {
              if (finger.extended) {
                fingerCount++;
              }
            });

            hand.frame.gestures.forEach(function(gesture) {
              // TODO richting bepalen.
              if (gesture.type == 'circle' && fingerCount == 1) {
                my.led0.turnOn();
                angle0 = angle0 + 1;
                if (angle0 > 170) {
                  angle0 = 1;
                }
                my.servo0.angle(angle0);
                console.log("servo 0: " + gesture.type + ' ' + angle0);
              } else {
                my.led0.turnOff();
              }
              if (gesture.type == 'circle' && fingerCount == 2) {
                my.led1.turnOn();
                angle1 = angle1 + 1;
                if (angle1 > 170) {
                  angle1 = 1;
                }
                my.servo1.angle(angle1);
                console.log("servo 1: " + gesture.type + ' ' + angle1);
              } else {
                my.led1.turnOff();
              }
            });
          }
        });
      }
    });
  }
}).start();