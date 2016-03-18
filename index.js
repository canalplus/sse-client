#!/usr/bin/env node

var http    = require('http');
var program = require('commander');
var chalk   = require('chalk');
var fs      = require('fs');
var bonjour = require('bonjour')();
var menu    = require('appendable-cli-menu');
var sse     = require('sse-private');

program
    .version('0.0.3')
    .option('-h, --hostname <hostname>', 'host name of the event emitter.')
    .option('-i, --interactive', 'opens an interactive menu to send event to the host. Can not be used with "listen" option.')
    .option('-l, --listen', 'listens and displays SSE messages while they are sent by the host. Can not be used with "interactive" option.')
    .option('-f, --filters <filters>', 'events you don\'t want to log (separated with comma). Can not be used with "lookup" option.')
    .option('-o, --output <filename>', 'filename to store outputs.')
    .parse(process.argv);

if(!program.hostname) {
  console.log('Error: user shall specify a host.');
  var browser = bonjour.find({ type: 'g7' }, function (service) {
    console.log('The host "' + service.name + '" : [' + service.addresses[0] +'] is up ...');
  });

  setTimeout(function(){
      browser.stop()
      program.help();
  }, 5000);
}
 

if (program.listen) {
  var optionsGet = {
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
  var req = http.request(optionsGet, function(res){
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
} else if (program.interactive && program.hostname) {
  var modules = menu('Select an event module', function (eventName) {
    var signals = menu('Select a signal', function (signal) {
      var optionsPost = {
          hostname: program.hostname,
          path: '/stream',
          method: 'POST',
          json: true,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {"type":eventName, "data":{"data":signal.data, "signal":signal.signal}}
      };
      var sendReq = http.request(optionsPost, function(res){
        sendReq.on('end', function() {
          console.log('SSE signal sent')
        });
      });
      sendReq.end();
    });
    sse[eventName].forEach(function(signal){
      signals.add({ name: signal.description, value: signal.event});
    });
  });
  Object.keys(sse).forEach(function(eventName){
    modules.add({ name: eventName, value: eventName });
  });
}

if(!program.interactive && !program.listen) {
  console.log('Error: user shall use either listen (-l) or interactive (-i) mode.');
  program.help();
}