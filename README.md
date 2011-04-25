blogdown
--------
blogdown is a lightweight blog engine written in Node.js that serves static markdown articles.

Setup
-----
See install instructions for Node.js at [nodejs.org](http://nodejs.org/). You will also need Express and EJS (use [node package manager](http://npmjs.org/))

    $ npm install express
    $ npm install ejs

Start the server by running the following command.

    $ node server.js

Usage
-----

By default, **server.js** will parse markdown articles (*.md extension*) located in */articles*. All articles need to start with a line of the following format (each attribute separated by a double pipe):

    Article Title||Author||Date||Published
    // Example:
    Test Article #1||Mikael Bjorkstam||04/24/2011||true
    // The following article will be ignored
    Some Article in Progress||Mikael Bjorkstam||04/24/2011||false

### Attributes
+ Article title
 - A _slug_ will be generated based on this title
+ Author
+ Date
 - will be parsed into a JavaScript _Date_ object
+ Published
 - boolean => _true_ or _false_

Only articles with the published flag set to **true** will be loaded. Once an article has been loaded, [showdown.js](https://github.com/coreyti/showdown) is used to parse the markdown into html.

blogdown comes with [prettify](http://code.google.com/p/google-code-prettify/) by default, which syntax highlights code blocks.

Static files are served under **/public**

Benefits
--------
The benefit of blogdown is that once the server has started, all the files are parsed and stored in memory. There is no database needed, nor will the server access the filesystem on every request.

Should you wish to reload the articles from the filesystem, you can do so by accessing */api/refresh/?key=__API_KEY__*. The following example will re-parse all articles:

    curl http://localhost:8080/api/refresh/?key=demo

Note that in order for any changes to an article to take effect, the articles must be re-parsed.

Issues
------
Right now, the error handling isn't working 100% properly (the 404 page is not rendered as intended)