sse-client
----------

Simple Server Sent Event Client writtent in node.
It allows to display events with a timestamped trace, save events to a file (to be developed), and filter unwanted events.

# Installation

```
npm install -g sse-client
```

# Usage

From version 0.0.4, the usage changed. Options -l or -i are mandatory.

Usage: sse-client [options]

  Options:

    -h, --help                 outputs usage information
    -V, --version              outputs the version number
    -h, --hostname <hostname>  hostname of the event emitter (mandatory).
    -f, --filters <filters>    events you don't want to log (separated with comma). Can not be used with "interactive" option.
    -r, --record <filename>    filename to store outputs. Can not be used with "interactive" option.
# Example

This command will listen Server Sent Events from IP 192.168.1.16 and display any event whose field 'event' will be different from 'eit' or 'player'. 

```
sse-client -l -h 192.168.1.16 -f eit,player
```

This command will opens a menu to send events to IP 192.168.1.16. 

```
sse-client -i -h 192.168.1.16

Select an event module
----------------------

[0] avio
[1] cas
[2] hls
[3] pdl

Type a module number ...
1

Select a signal
---------------

[0] SmartCardStateChanged: card inserted
[1] SmartCardStateChanged: card extracted
[2] DescramblingStatus
[3] ProgramAccess
[4] OperatorAdded
[5] OperatorRemoved
[6] ProductAdded
[7] ProductRemoved
```

# Reference

* [HTML5 Rocks article: Stream Updates with Server-Sent Events](http://www.html5rocks.com/en/tutorials/eventsource/basics/?redirect_from_locale=fr)

# Todo

* Export sse logs in a logfile
