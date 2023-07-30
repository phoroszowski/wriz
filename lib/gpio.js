//export gpio class as a module including a main listening function for button presses useing rpio-gpio

//import rpio-gpio
var gpiop = require('rpi-gpio').promise;

class gpioWrapper {
    isButtonPressHandled = false;
    debounceDelay = 400;
    constructor() {
        console.log("initing");
    };

    // Expose a listen for gpio input changes function with callback
    listen(callback) {
        //make sure the presses have debounce
        
        gpiop.on('change', (channel, value) => {
            //console.log('Channel ' + channel + ' value is now ' + value);
            this.debounceButtonPress(channel, value, callback);
        });
        gpiop.setup(7, gpiop.DIR_IN, gpiop.EDGE_BOTH);
   
    }
    
    debounceButtonPress(channel, value, callback) {
        if (!this.isButtonPressHandled) {
            this.isButtonPressHandled = true;
            callback(channel, value);
            
            // Reset the flag after the debounce delay
            setTimeout(() => {
                this.isButtonPressHandled = false;
            }, this.debounceDelay);
        }
    }
}



exports.gpioWrapper = gpioWrapper;
     