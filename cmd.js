const { program } = require('commander');

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

        console.log(feed.items[12].title);
        console.log(feed.items[12].enclosure.url);

        const VLC = require("vlc-client");
        const vlc = new VLC.Client({
            ip: "BlackBombe.local",
            port: 8080,
            
            password: "music"
        });

        vlc.playFile(feed.items[12].enclosure.url);

    })();
});

program.parse();


/*
,
            

            */
