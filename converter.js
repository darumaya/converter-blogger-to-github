var xml2js = require('xml2js');
var fs = require('fs');
var yaml = require('js-yaml');

var parser = new xml2js.Parser();
fs.readFile(__dirname + '/blog-01-07-2015.xml', function(err, data) {
    parser.parseString(data, function(err, result) {
        var entries = result.feed.entry;
        loop:
        for (var i = 0, l = entries.length; i < l; i++) {
            var entry = entries[i];
            var frontMatter = {};
            for (var key in entry) {
                frontMatter.entry = i;
                switch (key) {
                    case 'id':
                    case 'published':
                    case 'updated':
                        frontMatter[key] = entry[key][0];
                        break;

                    case 'category':
                        var kind = entry[key].filter(function(item) {
                            return item['$']['scheme'] === 'http://schemas.google.com/g/2005#kind';
                        }).map(function(item) {
                            return item['$']['term'];
                        })[0];
                        if (kind.match(/#(settings|comment|template)$/)) {
                            continue loop;
                        }
                        frontMatter[key + '-kind'] = kind;
                        frontMatter[key] = entry[key].filter(function(item) {
                            return item['$']['scheme'] === 'http://www.blogger.com/atom/ns#';
                        }).map(function(item) {
                            return item['$']['term'];
                        });
                        break;

                    case 'title':
                        if (entry[key][0]['_']) {
                            frontMatter[key] = entry[key][0]['_'];
                        }
                        break;

                    case 'link':
                        var links = entry[key].filter(function(item) {
                            return item['$']['rel'] === 'alternate' && item['$']['type'] === 'text/html';
                        }).map(function(item) {
                            return item['$']['href'];
                        });
                        if (links.length > 0) {
                            frontMatter[key] = links[0];
                        }
                        break;

                    case 'media:thumbnail':
                        frontMatter[key] = entry[key][0]['$']['url'];
                        break;

                    case 'content':
                        frontMatter['content-type'] = entry[key][0]['$']['type'];
                        break;

                    case 'thr:total':
                    case 'author':
                        break;

                    default:
                        frontMatter[key] = '';
                        break;
                }
            }
            console.log(yaml.safeDump(frontMatter) + '---');
        }
    });
});