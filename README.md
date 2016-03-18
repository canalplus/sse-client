sse-client
----------

Simple Server Sent Event Client writtent in node.
It allows to display events with a timestamped trace, save events to a file (to be developed), and filter unwanted events.

# Installation

```
npm install -g sse-client
```

# Usage

Usage: sse-client [options]

  Options:

    -h, --help                 outputs usage information
    -l, --listen               listens and displays SSE messages while they are sent by the host. Can not be used with "interactive" option.
    -i, --interactive          opens an interactive menu to send event to the host. Can not be used with "listen" option.
    -V, --version              outputs the version number
    -h, --hostname <hostname>  hostname of the event emitter (mandatory).
    -f, --filters <filters>    events you don't want to log (separated with comma). Can not be used with "interactive" option.
    -o, --output <filename>    filename to store outputs. Can not be used with "interactive" option.
# Example

This command will listen Server Sent Events from IP 192.168.1.16 and display any event whose field 'event' will be different from 'eit' or 'player'. 

```
sse-client -l -h 192.168.1.16 -f eit,player
```

This command will opens a menu to send events to IP 192.168.1.16. 

```
sse-client -i -h 192.168.1.16
```

# Reference

* [HTML5 Rocks article: Stream Updates with Server-Sent Events](http://www.html5rocks.com/en/tutorials/eventsource/basics/?redirect_from_locale=fr)

# Todo

* Export sse logs in a logfile
