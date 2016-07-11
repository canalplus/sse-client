#!/usr/bin/env node
(function() {

  var http     = require('http');
  var program  = require('commander');
  var chalk    = require('chalk');
  var fs       = require('fs');
  var bonjour  = require('bonjour')();

  function exit() {
    console.log('Bye !');
    process.exit(0);    
  }
  process.on('SIGINT', exit);

  program
      .version('0.0.5')
      .option('-h, --hostname <hostname>', 'host name of the event emitter.')
      .option('-f, --filters <filters>', 'events you don\'t want to log (separated with comma). Can not be used with "lookup" option.')
      .option('-o, --output <filename>', 'filename to store outputs (not available yet)')
      .parse(process.argv);

  if(!program.hostname) {
    console.log('Error: you have to specify a host SSE you want to connect to.\nYou may find bellow a list of active SSE hosts');
    var browser = bonjour.find({ type: 'g7' }, function (service) {
      console.log('The host "' + service.name + '" : [' + service.addresses[0] +'] is up ...');
    });

    setTimeout(function(){
        browser.stop()
        program.help();
    }, 7000);
  } else {
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
  }
})();
