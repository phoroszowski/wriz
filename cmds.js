const { program } = require('commander');
var mpd = require('mpd');
const gpio = require('./lib/gpio.js')
let mpdCmds = mpd.cmd;
let Wriz = require('./lib/wriz.js').Wriz;

program.command('start')
    .action(() => {
        let wriz = new Wriz();
        wriz.start();
        
    }
);


program.command('getFeed')
    .argument('<rss>', 'RSS feed url')
    .action((feedUrl,options) => {
        console.log(`Fetching: ${feedUrl}`);
        console.log(options);

        let Parser = require('rss-parser');
        let parser = new Parser();

        (async () => {

        let feed = await parser.parseURL(feedUrl);
        console.log(feed.title);

        console.log(feed.items[13].title);
        console.log(feed.items[13].enclosure.url);
        let currentMode = "uninitialized";
        var client = mpd.connect({
            port: 6600,
            host: 'localhost',
          });
          client.on('ready', function() {
            console.log("ready");
            client.sendCommand(mpdCmds("clear", []), function(err, msg) {
                if (err) throw err;
                console.log(msg);
                client.sendCommand(mpdCmds("add"  ,[feed.items[13].enclosure.url]), function(err, msg) {
                    console.log(msg);
                    client.sendCommand(mpdCmds("play",[]), function(err, msg) {
                        console.log(msg);
                    });
                    currentMode = "playing";

                });
          });
        });

        let gW = new gpio.gpioWrapper();
        gW.listen(function(channel, value) {
            if(currentMode == "playing")
            {
                client.sendCommand(mpdCmds("pause",[]), function(err, msg) {
                console.log(msg);
                });
            }
            else{
                client.sendCommand(mpdCmds("play",[]), function(err, msg) {
                    console.log(msg);
                });
            }
                
            });

        console.log('at the end');
    })();
});

program.command('testGpioButtons')
    .action((feedUrl,options) => {
        let gW = new gpio.gpioWrapper();
        gW.listen(function(channel, value) {
            console.log('Channel ' + channel + ' value is now ' + value);
        });

    })

    
program.parse();

