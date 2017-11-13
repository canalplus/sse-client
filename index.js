#!/usr/bin/env node
(function() {

  var http     = require('http');
  var program  = require('commander');
  var chalk    = require('chalk');
  var path     = require('path');
  var fs       = require('fs');
  var bonjour  = require('bonjour')();
  var fs       = require('fs');
  var package  = require('./package.json');

  var fileName, writeableStream;
  var start    = new Date();

  program
      .version(package.version)
      .option('-h, --hostname <hostname>', 'host name of the event emitter.')
      .option('-f, --filters <filters>', 'events you don\'t want to log (separated with comma). Can not be used with "lookup" option.')
      .option('-r, --record <filename>', 'filename to records events')
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

    if(program.record) {
      fileName = path.normalize(program.record);
      writeableStream = fs.createWriteStream(fileName);
      console.log('Logs will be saved in ' + chalk.cyan(fileName));
    }

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

    process.on('SIGINT', function() {
      writeableStream.write('\n');
      process.stdout.write('\n');

      console.log(chalk.green('Received SIGINT.'));
      if(program.record) {
        console.log('Closing ' + chalk.cyan(fileName));
        writeableStream.end();
      }
      console.log('Exit.');
      process.exit(0);
    });

    var req = http.request(optionsGet, function(res){
        console.log(chalk.red('Connected ...'));
        var _event;
        var _data;
        var accChunk;
        var multiLineSav = false;
        res.on('data', function (chunk) {
          // check if last two bytes are == '\n\n'
          var multiLine = (chunk[chunk.length-1] !== 10 && chunk[chunk.length-2] !== 10);
          // if not, it was a multi chunk payload
          if(multiLineSav) {
            // if last chunk for the payload, strip mast two '\n'
            if(!multiLine) {
              chunk = chunk.slice(0,chunk.length-2);
            }
            writeableStream.write(chalk.cyan(chunk));
            process.stdout.write(chalk.cyan(chunk));
            multiLineSav = multiLine;
          } else {
            // handle multi sse in a single chunk
            var lines = chunk.toString().split('\n');
            var skipNextLine = false;

            lines.forEach(function(line){
              var field = line.split(': ')[0];
              var payload = line.split(': ')[1];
              if(field === 'event') {
                skipNextLine=isFiltered(payload);
              }
              if(!skipNextLine && line !== '' && field !== 'id') {
                var now = new Date();
                if( field === 'event') {
                  _event = payload;
                }
                if(program.record && field === 'data') {
                  try{
                    _data = JSON.parse(payload);
                  }
                  catch(e) {
                    _data = payload;
                  }
                }
                var msg = '\n|' + chalk.grey(now.toJSON())+'| ' + chalk.green(field)+': ' + chalk.cyan(payload);
                writeableStream.write(msg);
                process.stdout.write(msg);
              }
              if(field === 'data')
                  skipNextLine = false;
            });
            multiLineSav = multiLine;
          }
        });
        res.on('end', function() {
          process.stdout.write('No more data in response.\n')
        });
    });

    req.end();
  }
})();
