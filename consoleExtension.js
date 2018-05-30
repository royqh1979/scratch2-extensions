// wedoExtension.js
// Shane M. Clements, January 2014
// LEGO WEDO Scratch Extension
//
// This is an extension for development and testing of the Scratch Javascript Extension API.

(function (ext) {
    var device = null;
    var rawData = null;


    ext._stop = function () {
        ext.allMotorsOff('a');
        setServoMotorDirection(0, 0);
        setServoMotorDirection(1, 0);
    };
    var poller = null;
    ext._deviceConnected = function (dev) {
        if (device) return;

        device = dev;
        device.open();
        poller = setInterval(function () {
            device.read(function (data) {
                rawData = data;
            });
        }, 20);
    };

    ext._deviceRemoved = function (dev) {
        if (device != dev) return;
        if (poller) poller = clearInterval(poller);
        device = null;
    };

    ext._shutdown = function () {
         setMotorOn('a', 0, false);
         setMotorOn('a', 1, false);
         setServoMotorDirection(0, 0)
         setServoMotorDirection(1, 0)

        if (poller) poller = clearInterval(poller);
        if (device) device.close();
        device = null;
    };

    ext.log = function(n) {
        console.log("test "+n)
    }

    ext._getStatus = function () {
        if (!device) return {status: 1, msg: 'disconnected'};
        return {status: 2, msg: 'connected'};
    };

    var descriptor = {
        blocks: [
            [' ', 'say %n to console', 'log', 1],
        ],
        menus: {
        },
        url: '/info/help/studio/tips/ext/LEGO WeDo/'
    };
    ScratchExtensions.register('Console Example', descriptor, ext, {type: 'mytest'});
})({});
