#!/usr/bin/env node
(function() {

  var http     = require('http');
  var program  = require('commander');
  var chalk    = require('chalk');
  var fs       = require('fs');
  var bonjour  = require('bonjour')();
  var sse      = require('sse-private');
  var readline = require('readline');
  var rl       = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function exit() {
    rl.close();
    console.log('Bye !');
    process.exit(0);    
  }
  process.on('SIGINT', exit);

  program
      .version('0.0.3')
      .option('-h, --hostname <hostname>', 'host name of the event emitter.')
      .option('-i, --interactive', 'opens an interactive menu to send event to the host. Can not be used with "listen" option.')
      .option('-l, --listen', 'listens and displays SSE messages while they are sent by the host. Can not be used with "interactive" option.')
      .option('-f, --filters <filters>', 'events you don\'t want to log (separated with comma). Can not be used with "lookup" option.')
      .option('-o, --output <filename>', 'filename to store outputs (not available yet)')
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

    var moduleName = "";
    var module = {};
    function chooseSignal(signalNumber) {
      if (!signalNumber || Number.isNaN(Number.parseInt(signalNumber))) {
        console.log('## ERROR ## You must enter a number');
        displaySignalsList();
      }
      else {
        var signal = module[Object.keys(module)[signalNumber]];
        var postData = JSON.stringify({"type":moduleName, "data":{"data":signal.data, "signal":signal.signal}});
        var optionsPost = {
            hostname: program.hostname,
            path: '/stream',
            method: 'POST',
            headers: {
              'Content-type': 'application/json',
              'Content-Length': postData.length
            }
        };
        var sendReq = http.request(optionsPost, function(res){
          console.log('Signal sent');
          displayModulesList();
        });
        sendReq.on('error', function(e) {
          console.log('## ERROR ## ' + e);
          exit();
        });
        sendReq.write(postData);
        sendReq.end();
      }
    }

    function displaySignalsList(eventNumber) {
      console.log('\nSelect a signal');
      console.log('---------------');
      Object.keys(module).forEach(function(signalDescription, index){
        console.log('[' + index + '] ' + signalDescription);
      });
    }

    function chooseModule(eventNumber)
    {
      if (!eventNumber || Number.isNaN(Number.parseInt(eventNumber))) {
        console.log('## ERROR ## You must enter a number');
        displayModulesList();
      }
      else {
        moduleName = Object.keys(sse)[eventNumber];
        module = sse[moduleName];
        displaySignalsList(eventNumber);
        rl.question('\nType a signal number ...(CTRL+C twice to exit)\n', chooseSignal);
      }
    }

    function displayModulesList() {
      console.log('\nSelect an event module');
      console.log('----------------------');
      Object.keys(sse).forEach(function(eventName, index) {
        console.log('[' + index + '] ' + eventName);
      });
      rl.question('\nType a module number ... (CTRL+C twice to exit)\n', chooseModule);
    }

    displayModulesList();

  }

  if(!program.interactive && !program.listen) {
    console.log('## ERROR ## user shall use either listen (-l) or interactive (-i) mode.');
    program.help();
  }
})();
