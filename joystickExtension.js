// picoExtension.js
// Roy Qu
// Joystick Extension
//
// This is an extension for Beitong D2F Joystick

(function (ext) {
    var device = null;
    var rawData = null;

    var buttons = {
        up : 0,
        down : 0,
        left : 0,
        right : 0,
        X: 0,
        Y: 0,
        A: 0,
        B: 0,
        L1: 0,
        L2: 0,
        R1: 0,
        R2: 0,
        back: 0,
        start: 0,
        L_Stick_X:0,
        L_Stick_Y:0,
        R_Stick_X:0,
        R_Stick_Y:0
    }


    ext._stop = function () {
        //console.log("stopped")
        clearButtons();
    };

    var poller = null;
    ext._deviceConnected = function (dev) {
        if (device) return;
        //console.log("connected")
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
        clearButtons();
    };

    ext._shutdown = function () {
        if (poller) poller = clearInterval(poller);
        if (device) device.close();
        device = null;
        clearButtons();
    };

    ext._getStatus = function () {
        if (!device) return {status: 1, msg: 'D2F Joystick disconnected'};
        return {status: 2, msg: 'D2F Joystick connected'};
    };

    //inner functions
    function processData() {
        var s = new Uint8Array(rawData);

        //console.log("processData()");
        //console.log(s);

        clearButtons();

        buttons.up=(s[9]==0)?0:1;
        buttons.down=(s[10]==0)?0:1;
        buttons.left=(s[8]==0)?0:1;
        buttons.right=(s[7]==0)?0:1;

        buttons.A=(s[13]==0)?0:1;
        buttons.B=(s[12]==0)?0:1;
        buttons.X=(s[14]==0)?0:1;
        buttons.Y=(s[11]==0)?0:1;

        buttons.L1=(s[15]==0)?0:1;
        buttons.L2=(s[17]==0)?0:1;
        buttons.R1=(s[16]==0)?0:1;
        buttons.R2=(s[18]==0)?0:1;

        buttons.back=((s[1] & 0x1)==0)?0:1;
        buttons.start=((s[1] & 0x2)==0)?0:1;

        buttons.L_Stick_X=s[3]-128;
        buttons.L_Stick_Y=s[4]-128;
        buttons.R_Stick_X=s[5]-128;
        buttons.R_Stick_Y=s[6]-128;

        //console.log(buttons);

        rawData = null;
    }

    function clearButtons() {
        for (var btn in buttons) {
            buttons[btn]=0;
        }
    }

    function getButtonPressed(btn) {
        //console.log("getButtonPressed("+btn+")");
        //console.log(rawData);
        if (rawData) processData();
        //console.log(buttons[btn]);
        switch (btn) {
            case 'left stick up':
                return buttons.L_Stick_Y<0;
            case 'left stick down':
                return buttons.L_Stick_Y>0;
            case 'left stick left':
                return buttons.L_Stick_X<0;
            case 'left stick right':
                return buttons.L_Stick_X>0;
            case 'right stick up':
                return buttons.R_Stick_Y<0;
            case 'right stick down':
                return buttons.R_Stick_Y>0;
            case 'right stick left':
                return buttons.R_Stick_X<0;
            case 'right stick right':
                return buttons.R_Stick_X>0;
            default:
                return buttons[btn]==1;
        }
    }

    ext.getL_Stick_X=function() {
        if (rawData) processData();
        return buttons.L_Stick_X;
    }

    ext.getL_Stick_Y=function() {
        if (rawData) processData();
        return buttons.L_Stick_Y;
    }

    ext.getR_Stick_X=function() {
        if (rawData) processData();
        return buttons.R_Stick_X;
    }

    ext.getR_Stick_Y=function() {
        if (rawData) processData();
        return buttons.R_Stick_Y;
    }

    ext.getButtonPressed=function(btn){
        return getButtonPressed(btn);
    }

    ext.whenButtonPressed=function(btn) {
        return device != null && getButtonPressed(btn);
    }

    ext.whenStickValue=function(stick,op,val) {
        var stickVal=0;
        var result=false;
        if (device==null) {
            return false;
        }
        switch(stick) {
            case 'left stick X axis':
                stickVal=ext.getL_Stick_X();
                break;
            case 'left stick Y axis':
                stickVal=ext.getL_Stick_Y();
                break;
            case 'right stick X axis':
                stickVal=ext.getR_Stick_X();
                break;
            case 'right stick Y axis':
                stickVal=ext.getR_Stick_Y();
                break;
        }
        switch(op) {
            case '<':
                result=stickVal<val;
                break;
            case '>':
                result=stickVal>val;
                break;
            case '<=':
                result=stickVal<=val;
                break;
            case '>=':
                result=stickVal>=val;
                break;
            case '=':
                result=stickVal==val;
                break;
            case  '<>':
                result=stickVal!=val;
                break;
        }
        return result;
    }



    var descriptor = {
        blocks: [
            ['b','joystick %m.button pressed',   'getButtonPressed',  'up'],
            ['h', 'when joystick %m.button pressed',   'whenButtonPressed',  'up'],
            ['h', 'when joystick %m.stick %m.compare %n',  'whenStickValue', 'left stick X axis', '<', 20],
            ['r', 'left stick X axis', 'getL_Stick_X'],
            ['r', 'left stick Y axis', 'getL_Stick_Y'],
            ['r', 'right stick X axis', 'getR_Stick_X'],
            ['r', 'right stick Y axis', 'getR_Stick_Y'],
        ],
        menus: {
            button: ['up','down','left','right',
                'X','Y','A','B',
                'L1','L2','R1','R2',
                'back','start',
                'left stick up', 'left stick down',
                'left stick left', 'left stick right',
                'right stick up', 'right stick down',
                'right stick left', 'right stick right'
                 ],
            compare: ['<','>','<=','>=','=', '<>'],
            stick: [
                'left stick X axis',
                'left stick Y axis',
                'right stick X axis',
                'right stick Y axis'
            ]
        },
        url: '/info/help/studio/tips/ext/D2FJoystick/'
    };
    ScratchExtensions.register('D2F Joystick', descriptor, ext, {type: 'hid', vendor: 0x20bc, product: 0x1264});
})({});
