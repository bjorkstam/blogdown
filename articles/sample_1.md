Test Article #1||Mikael Bjorkstam||04/24/2011||true

This is a sample article *written in __markdown__* :) All that is required for articles is that they are located in the designated articles-directory as specified in *server.js* and each article must be a separate file with the **.md file extension**.

In addition, each article must start with a line containing four attributes, each separated with a double pipe, describing the article.

### Attributes
+ Article title
 - A _slug_ will be generated based on this title
+ Author
+ Date
 - will be parsed into a JavaScript _Date_ object
+ Published
 - boolean => _true_ or _false_

By default, *blogdown* uses [prettify](http://code.google.com/p/google-code-prettify/) for syntax highlightning. The *markdown -> html* parsing is done by [showdown.js](https://github.com/coreyti/showdown).

### Code example:

    var blogdown = true
      , hello    = function() {
          return "Hello World";
        }

#### Enjoy