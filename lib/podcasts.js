let fs = require('fs');
let path = require('path');
let Parser = require('rss-parser');
var mpd = require('mpd');
let mpdCmds = mpd.cmd;

class Podcasts {
    constructor() {
        this.podcasts = [];
        this.loadPodcastsList();
    }

    loadPodcastsList() {
        let podcastListFile = path.join(__dirname, '../save/podcasts.json');
        if (fs.existsSync(podcastListFile)) {
            this.podcasts = JSON.parse(fs.readFileSync(podcastListFile));
        }
    }

    savePodcastsList() {
        let podcastListFile = path.join(__dirname, '../save/podcasts.json');
        fs.writeFileSync(podcastListFile, JSON.stringify(this.podcasts));
    }


    async cuePodcast(podcastName) {
        await this.loadPodcastInfo(podcastName);
        this.savePodcastsList();
        this.mpd_client = mpd.connect({
            port: 6600,
            host: 'localhost',
          });
          this.client.on('ready', function() {
            this.client.sendCommand(mpdCmds("clear", []), function(err, msg) {
                if (err) throw err;
                this.client.sendCommand(mpdCmds("add"  ,[this.feed.items[this.podcast.currentItemIndex].enclosure.url]), function(err, msg) {
                });
          });
        });
    };

    

    playPodcast() {
        console.log("Playing podcast");
        this.client.sendCommand(mpdCmds("play",[]), function(err, msg) {
            console.log(msg);
        });

    }

    async  loadPodcastInfo(podcastName) {
        console.log(`Loading info for ${podcastName}`);
        return new Promise(async (resolve, reject) => {

            this.podcast = this.podcasts.find(p => p.name == podcastName);
            if (this.podcast) {
                this.parser = new Parser();
                this.feed = await this.parser.parseURL(this.podcast.feedUrl);
                
                this.podcast.itemCount = this.feed.items.length;
                if (this.podcast.currentItemIndex == undefined) {
                    this.podcast.currentItemIndex = this.podcast.itemCount - 1;
                }
                console.log(this.feed.items[this.podcast.currentItemIndex].title);
                console.log(this.feed.items[this.podcast.currentItemIndex].pubDate);

                resolve();
            }
            else {
                reject("Podcast not found");
            }
        });



    }


        
}

exports.Podcasts = Podcasts;