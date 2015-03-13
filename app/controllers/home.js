var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article');
var http =require('http');


module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  Article.find(function (err, articles) {
    if (err) return next(err);
    res.render('index', {
      title: 'Generator-Express MVC',
      articles: articles
    });
  });
});

//ajax from home page
router.get('/pnr', function(req, res, next) {
  // Accept: text/*, application/json
  req.accepts('html');
  // => "html"
  req.accepts('text/html');
  // => "text/html"
  req.accepts('json, text');
  // => "json"
  req.accepts('application/json');
  var response = res;
  http.get("http://api.erail.in/route/?key=c488acb9-4f22-4f77-97b6-7b90835d7494&trainno=12451", function(res) {
      console.log("Got response: " + res.statusCode);
       res.on("data", function(chunk) {
          console.log(req.query.iam);
           response.send(chunk);
      });
      next()
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
},function(req, res, next){
  console.log("next method");

});