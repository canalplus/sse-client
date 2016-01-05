sse-client
----------

Simple Server Sent Event Client writtent in node.
It allows to display events with a timestamped trace, save events to a file (to be developed), and filter unwanted events.

# Installation

```
npm install -g sse-client
```

# Usage

Usage: r7sseclient [options]

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -h, --hostname <hostname>  Hast name of the event emitter (mandatory).
    -f, --filters <filters>    Events you don't want to log (separated with comma). Can not be used with "lookup" option.

# Example

this command will listen Server Sent Events from IP 192.168.1.16 and display any event whose field 'event' will be different from 'eit' or 'player'. 

```
sse-client -h 192.168.1.16 -f eit,player
```

# Reference

* [HTML5 Rocks article: Stream Updates with Server-Sent Events](http://www.html5rocks.com/en/tutorials/eventsource/basics/?redirect_from_locale=fr)

# Todo

* Export sse logs in a logfile
