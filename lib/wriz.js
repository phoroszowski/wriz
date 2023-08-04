let fs = require('fs');
let path = require('path');
let Podcasts = require('./podcasts').Podcasts;
let GpioWrapper = require('./gpio').GpioWrapper;

class Wriz {

    state = { };

    constructor() {

    };

    start() {
        this.loadState();
        this.invokePlayMode(this.state.currentPlaymode);
        this.initalizeGpio();
    };

    invokePlayMode(playMode) {
        switch (playMode) {
            case 'podcast':
                this.invokePodcastMode();
                break;
            case 'music':
                this.invokeMusicMode();
                break;
            default:
                break;

        }
    };

    initalizeGpio() {
        let gpio = new GpioWrapper();
        gpio.listen((channel, value) => {
            console.log(`Channel ${channel} value is now ${value}`);
            if(channel == 7 )
                this.podcasts.nextEpisode();
            if(channel == 29 )
                this.podcasts.playPause();
            if(channel == 31)
                this.podcasts.previousEpisode();
            /*
            if(this.currently_playing == true)
                this.podcasts.pausePodcast();
            else
                this.podcasts.playPodcast();
            */
        });
    }


    invokePodcastMode() {
        this.podcasts = new Podcasts();
        this.podcasts.cuePodcast(this.state.currentPodcast);

    };

    initState() {
        this.state = {
            lastRun: new Date(),
            currentPlaymode: 'podcast',
            currentPodcast: "You Must Remember This"
        };
    };

    loadState() {
        let stateFile = path.join(__dirname, '../save/state.json');
        if (fs.existsSync(stateFile)) {
            this.state = JSON.parse(fs.readFileSync(stateFile));
        }
        else {
            console.log('State not saved. Initializing state.')
            this.initState();
            this.saveState();
        }
    };

    

    saveState() {
        let stateFile = path.join(__dirname, '../save/state.json');
        fs.writeFileSync(stateFile, JSON.stringify(this.state));
    };

}

exports.Wriz = Wriz;