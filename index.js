#!/usr/bin/env node

var http    = require('http');
var program = require('commander');
var chalk   = require('chalk');
var fs      = require('fs');

program
    .version('0.0.3')
    .option('-h, --hostname <hostname>', 'Hast name of the event emitter.')
    .option('-f, --filters <filters>', 'Events you don\'t want to log (separated with comma). Can not be used with "lookup" option.')
    .option('-o, --output <filename>', 'Filename to store outputs.')
    .parse(process.argv);

if(!program.hostname)
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

var filters = (program.filter)?program.filter:[];
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
          if(program.filename)
            fs.appendFileSync('message.txt', '|'+now.toJSON()+'| '+field+': '+payload, 'utf8');
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
