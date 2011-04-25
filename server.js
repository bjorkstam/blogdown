/**
 * Written by Mikael Bjorkstam ### bjorkstam@gmail.com ### http://bjorkst.am/
 * @bjorkstam on twitter & github
 *
 * Feel free to expand and modify as you please.
 * If you do something cool with it, please let me know :)
 */
var express          = require('express')
  , app              = express.createServer()
  , fs               = require('fs')
  , Showdown         = require('./lib/showdown.js').Showdown
  , ARTICLES_PATH    = './articles/'
  , TEMPLATE_FILE    = 'index.ejs'
  , CODE_CLASS       = 'prettyprint'
  , API_KEY          = 'demo'
  , PORT_LISTEN      = 8080
  ;

Showdown.converter(); // necessary to create the makeHtml function
/**
 * UTILS is an object containing various methods used in formatting
 * a blog post as well as parsing input (articles) from the filesystem.
 */
var UTILS = {
    
    /**
     * Parses an article in markdown to HTML using showdown.js
     * Additionally adds class="prettyprint" to code-blocks
     * @method getHTML
     */
    
    getHTML: function(body) {
        var out = Showdown.makeHtml(body);

        // Now also add the class="prettyprint" to <code> tags

        out = out.replace(/<code>/g, '<code class="'+CODE_CLASS+'">');

        return out;
    },
    
    /**
     * Parses a string ("true" or "false") to a boolean
     * @method parseBool
     */
    parseBool: function(val) {
        return (val.toLowerCase() === 'true');
    },
    /**
     * "Slugifies" a title
     * @method slugify
     */
    slugify: function(input) {
        return input.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
    },
    /**
     * Takes a date object and outputs a string
     * Example: "April 12, 1987"
     * @method formatDate
     */
    formatDate: function(dt) {
        var mo = [
            'January'
          , 'February'
          , 'March'
          , 'April'
          , 'May'
          , 'June'
          , 'July'
          , 'August'
          , 'September'
          , 'October'
          , 'November'
          , 'December'
        ];
        var output = mo[dt.getMonth()] + " " + dt.getDate() + ", " + dt.getFullYear();
        return output;
    }
}
/**
 * Represents a blog object containing a list of articles
 * @constructor BlogObj
 */
function BlogObj(SEARCH_PATH) {
    var articles = []
      , ARTICLES_PATH = SEARCH_PATH;
    
  /**
   * Clear the list of articles
   * @method clearArticles
   */
    this.clearArticles = function () {
        articles = [];
        
        return this;
    }
    /**
     * Returns the number of articles currenty cached
     * @method count
     */
    this.count = function() {
        return articles.length;
    }
    /**
     * Checks whether an article with the specified slug exists
     * @method hasArticle
     */
    this.hasArticle = function(slug) {
        for (var i=0; i < articles.length; i++) {
            if (articles[i].slug === slug) {
                return true;
            }
        }
        return false;
    }
    /**
     * Returns an article with the specified slug if it exists
     * @method getArticle
     */
    this.getArticle = function(slug) {
        for (var i=0; i < articles.length; i++) {
            if (articles[i].slug === slug) {
                return articles[i];
            }
        }
    }
    /**
     * Returns an array of all articles
     * @method getArticles
     */
    this.getArticles = function() {
        return articles;
    }
    /**
     * Returns the latest article added to the list
     * if the list contains at least one article
     * @method getLatest
     */
    this.getLatest = function() {
        if (articles.length > 0) {
            return articles[0];
        }
        return [];
    }
    /**
     * Adds an article to the article list
     * @method addArticle
     */
    this.addArticle = function(article) {
        articles.push(article);
        
        articles.sort(dSort);
        
        return this;
    }
    /**
     * Used internally to sort the article array
     * based on the date of an article (newest first)
     */
    var dSort = function(a,b) {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
    }
    
    /**
     * Used internally to walk through the specified filesystem directory
     * where the .md-articles are located. Parses each article to HTML and
     * extracts title, slug, author, date.
     * Only adds articles that has the published flag set to true
     */
    var parseArticles = function() {
        console.log("*** Parsing Articles ***");
        
        // matches files w/ file extension .md
        var is_md = /.(\.md)$/
          , that  = this; 
        
        fs.readdir(ARTICLES_PATH, function(err, files) {
            if (err) { throw err; };

            that.clearArticles();

            files.forEach(function(file) {
                if (is_md.test(file)) {
                    fs.readFile(ARTICLES_PATH+file, 'utf8', function (err, data) {
                        if (err) { throw err; }
                        
                        // Lets read the data and parse the first line
                        var first_line = /^(?:(.+)(?:\n|\r|\r\n)+)/ ;
                        var match = first_line.exec(data);                
                        var head = match[1].split('||');

                        (function(head, match) {
                            var publish = UTILS.parseBool(head[3]);
                            
                            // Only collect articles that are published
                            if (publish) {
                                that.addArticle({
                                    slug: UTILS.slugify(head[0])
                                  , title: head[0]
                                  , author: head[1]
                                  , date: new Date(Date.parse(head[2]))
                                  , body: UTILS.getHTML(data.replace(match[0], ''))
                                });
                            } 
                        }(head, match));
                    });
                }
            });
        });
    }
    
    /**
     * Updates the list of articles by calling parseArticles
     * @method update
     */
    this.update = function() {
        parseArticles.call(this);
        
        return this;
    }
};


// Instantiate a new blog object, look for articles under <current dir>/articles
var BLOG = new BlogObj(ARTICLES_PATH);
// update the blog object => locate and parse all published articles
BLOG.update()


/**
 * Renders an actual view (index.ejs). If a slug is provided,
 * it attempts to render that specific article. 
 * Otherwise, it renders the latest article in the list.
 * @mthod renderView
 */
function renderView(req, res, slug) {
    if (slug) {
        var article = BLOG.getArticle(slug);
        if (article) {
            res.render(
                TEMPLATE_FILE,
                { 
                    articles: BLOG.getArticles()
                 ,  post: BLOG.getArticle(slug)
                 ,  formatDate: UTILS.formatDate
                }
            );
        } else {
            throw new NotFound;
        }
    } else {
        res.render(
            'index.ejs',
            { 
                articles: BLOG.getArticles()
             ,  post: BLOG.getLatest()
             ,  formatDate: UTILS.formatDate
            }
        );
    }
}

// layout: false so we can use index.ejs as template instead
app.set('view options', {
    layout: false
});

/**
 * This is functionality in progress. RESTful API to do various things.
 * Right now, requesting /api/refresh/?key=API_KEY will refresh the current list of articles
 */
app.get('/api/:command', function(req, res){
    if (req.query.key !== API_KEY) {
        res.send('NO ACCESS\n');
        return;
    }
    var command = req.params.command;
    if (command === 'refresh') {
        BLOG.update();
        res.send('OK\n');
    } else {
        res.send('INVALID COMMAND\n');
    }
});
/**
 * Render and article if it exists
 */
app.get('/b/:slug', function(req, res){
    renderView(req, res, req.params.slug);
});
/**
 * Render the latest article (main page)
 */
app.get('/', function(req, res){
    renderView(req, res);
});

/* configure: views */
app.configure(function(){
    var oneYear = 31557600000;
    app.use('/public', express.static(__dirname + '/public', { maxAge: oneYear }));
    app.use(express.errorHandler());
    
    app.set('views', __dirname + '/views');
    app.set('views');
});
/**
 * Error handling
 */
function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}
NotFound.prototype.__proto__ = Error.prototype;
app.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.ejs');
    } else {
        next(err);
    }
});

// Run server and listen for requests
app.listen(PORT_LISTEN);
console.log('blogdown now running on port %s', app.address().port);