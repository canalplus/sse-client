sse-client
----------

Simple Server Sent Event Client writtent in node.
It allows to display server sent events prefixed with a timestamp, save events to a file, and filter unwanted events.

# Installation

```
npm install -g sse-client
```

# Usage

Usage: sse-client [options]

  Options:

    -h, --help                 outputs usage information
    -V, --version              outputs the version number
    -h, --hostname <hostname>  hostname of the event emitter (mandatory).
    -f, --filters <filters>    events you don't want to log (separated with comma). Can not be used with "interactive" option.
    -r, --record <filename>    filename to store outputs. Can not be used with "interactive" option.

# Example

This command will listen Server Sent Events from IP 192.168.1.16, display any event whose field 'event' will be different from 'eit' or 'player', and record the logs in /tmp/sse.log. 

```
sse-client -h 192.168.1.16 -f eit,player -r /tmp/sse.log
```

# Reference

* [HTML5 Rocks article: Stream Updates with Server-Sent Events](http://www.html5rocks.com/en/tutorials/eventsource/basics/?redirect_from_locale=fr)
