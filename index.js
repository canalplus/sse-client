#!/usr/bin/env node

var http = require('http');
var program = require('commander');
var chalk = require('chalk');

program
    .version('0.0.1')
    .option('-h, --hostname <hostname>', 'Hast name of the event emitter.')
    .option('-f, --filters <filters>', 'Events you don\'t want to log (separated with comma). Can not be used with "lookup" option.')
//    .option('-l, --lookup <lookup>', 'Events you only want to log (separated with comma). Can not be used with "filter" option.')
    .parse(process.argv);

if(!program.hostname /*|| program.filters && program.lookup*/)
    program.help();
 
var options = {
    hostname: program.hostname,
    path: '/stream',
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream'
    }
};

function isFiltered(event) {
  var match = false;
  if(!program.filters)
    return false;
  program.filters.split(',').forEach(function(filter){
    if(filter === event) {
       match = true;
    }
  });
  return match;
}

var filters = (program.fliter)?program.filter:[];
var req = http.request(options, function(res){
    console.log(chalk.red('Connected ...'));

    res.on('data', function (chunk) {
      var now = new Date();
      var lines = chunk.toString().split('\n');
      var skipNextLine = false;
      lines.forEach(function(line){
        var field = line.split(': ')[0];
        var payload = line.split(': ')[1];
        if(field === 'event') {
          skipNextLine=isFiltered(payload);
        }
        if(!skipNextLine && line !== '' && field !== 'id') {
          console.log('|%s| %s: %s', chalk.grey(now.toJSON()), chalk.green(field), chalk.cyan(payload));
        }
        if(field === 'data')
            skipNextLine = false;
      });
    });
    res.on('end', function() {
      console.log('No more data in response.')
    });
});

req.end();
