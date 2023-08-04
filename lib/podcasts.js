let fs = require('fs');
let path = require('path');
let Parser = require('rss-parser');
var mpd = require('mpd');
let mpdCmds = mpd.cmd;
//import anyAscii from 'any-ascii';

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

    async getMpdStatus() {
        return new Promise((resolve, reject) => {
            this.mpd_client.sendCommand(mpdCmds("status", []), (err, msg) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(msg);
                }
            });
        });
    }


    async cuePodcast(podcastName) {
        await this.loadPodcastInfo(podcastName);
        this.savePodcastsList();
        this.mpd_client = mpd.connect({
            port: 6600,
            host: 'localhost',
          });
        this.mpd_client.on('ready', () => {
            this.mpd_client.sendCommand(mpdCmds("clear", []), (err, msg) => {
                if (err) throw err;
                this.mpd_client.sendCommand(mpdCmds("add"  ,[this.feed.items[this.podcast.currentItemIndex].enclosure.url]), function(err, msg) {
                });
          });
        });
    };

    nextEpisode() {
        this.podcast.currentItemIndex--;
        if (this.podcast.currentItemIndex < 0) {
            this.podcast.currentItemIndex = 0;
        }
        this.displayPodcastInfo();
        this.mpd_client.sendCommand(mpdCmds("clear", []), (err, msg) => {
            if (err) throw err;
            this.mpd_client.sendCommand(mpdCmds("add"  ,[this.feed.items[this.podcast.currentItemIndex].enclosure.url]), (err, msg) => {
                this.playPodcast();
            });
        });

        
    }

    previousEpisode() {
        this.podcast.currentItemIndex++;
        if (this.podcast.currentItemIndex >= this.podcast.itemCount) {
            this.podcast.currentItemIndex = this.podcast.itemCount - 1;
        }
        this.displayPodcastInfo();
        this.mpd_client.sendCommand(mpdCmds("clear", []), (err, msg) => {
            if (err) throw err;
            this.mpd_client.sendCommand(mpdCmds("add"  ,[this.feed.items[this.podcast.currentItemIndex].enclosure.url]), (err, msg) => {
                this.playPodcast();
            });
        });

        
    }


    centerText = function(str, width) {
        let spaces = "";
        for (let i = 0; i < (width - str.length) / 2; i++) {
            spaces += " ";
        }
        return spaces + str;
    }

    displayPodcastInfo() {
        //open /tmp/epd.txt and write the podcast and episode title
        let epdFile = '/tmp/epd.txt';
        let podCastName = this.feed.title;
        let episodeTitle = this.feed.items[this.podcast.currentItemIndex].title;
        console.log(podCastName);
        console.log(episodeTitle);
        let displayCharWidth = 24;

        //let podCastName = anyAscii(this.feed.title);
        //let episodeTitle = anyAscii(this.feed.items[this.podcast.currentItemIndex].title);
        //split podcastname so that no line is longer than 16 characsters but words are preserved
        let podCastNameLines = [];
        let podCastNameWords = podCastName.split(' ');
        let podCastNameLine = "";
        podCastNameWords.forEach(word => {
            if (podCastNameLine.length + word.length + 1 > displayCharWidth) {
                podCastNameLines.push(this.centerText(podCastNameLine, displayCharWidth));
                podCastNameLine = "";
            }
            podCastNameLine += word + " ";
        });

        podCastNameLines.push(this.centerText(podCastNameLine));
        podCastName = podCastNameLines.join('\n');
        //split episode title so that no line is longer than 16 characsters but words are preserved
        let episodeTitleLines = [];
        let episodeTitleWords = episodeTitle.split(' ');
        let episodeTitleLine = "";
        episodeTitleWords.forEach(word => {
            if (episodeTitleLine.length + word.length + 1 > displayCharWidth) {
                episodeTitleLines.push(this.centerText(episodeTitleLine, displayCharWidth));
                episodeTitleLine = "";
            }
            episodeTitleLine += word + " ";
        });
        
        episodeTitleLines.push(this.centerText(episodeTitleLine, displayCharWidth));
        episodeTitle = episodeTitleLines.join('\n');

        let totalLines = podCastNameLines.length + episodeTitleLines.length;
        for(let l = totalLines; l < 7  ; l++)
        {
            episodeTitle += " \n";
        }
        podCastName.replace('’',"'");
        episodeTitle.replace('’',"'");
        fs.writeFileSync(epdFile, `${podCastName}\n\n${episodeTitle}`);

    }

    playPause() {
        if(this.playing == true)
            this.pausePodcast();
        else
            this.playPodcast();
    }

        

    playPodcast() {
        if(!this.statusInterval)
        {
            this.statusInterval = setInterval(async () => {
                await this.getMpdStatus();
            });
        }
    
               
        console.log("Playing podcast");
        this.mpd_client.sendCommand(mpdCmds("play",[]), function(err, msg) {
            console.log(msg);
        });
        this.playing = true;
    }

    pausePodcast() {
        console.log("Pausing podcast");
        this.mpd_client.sendCommand(mpdCmds("pause",[]), function(err, msg) {
            console.log(msg);
        });
        this.playing = false;
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
                this.displayPodcastInfo();

                resolve();
            }
            else {
                reject("Podcast not found");
            }
        });



    }


        
}

exports.Podcasts = Podcasts;