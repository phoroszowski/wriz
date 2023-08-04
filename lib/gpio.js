//export gpio class as a module including a main listening function for button presses useing rpio-gpio

//import rpio-gpio
var gpiop = require('rpi-gpio').promise;

class GpioWrapper {
    isButtonPressHandled = false;
    debounceDelay = 400;
    constructor() {
        console.log("initializing gpio");
        gpiop.setup(7, gpiop.DIR_IN, gpiop.EDGE_BOTH)
        .catch((err) => {
            console.log('Gpio Setup Error: ', err.toString())
        })
        gpiop.setup(29, gpiop.DIR_IN, gpiop.EDGE_BOTH)
        .catch((err) => {
            console.log('Gpio Setup Error: ', err.toString())
        })
        gpiop.setup(31, gpiop.DIR_IN, gpiop.EDGE_BOTH)
        .catch((err) => {
            console.log('Gpio Setup Error: ', err.toString())
        })
    };

    // Expose a listen for gpio input changes function with callback
    listen(callback) {
        //make sure the presses have debounce
        
        gpiop.on('change', (channel, value) => {
            //console.log('Channel ' + channel + ' value is now ' + value);
            this.debounceButtonPress(channel, value, callback);
        });
        
        
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



exports.GpioWrapper = GpioWrapper;
     