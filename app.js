var http = require('http');
var restify = require('restify');
var mongojs = require('mongojs');

var ip_addr = '127.0.0.1';
var port = '8085';

var server = restify.createServer({
	name : "myapp"
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

var connection_string = '127.0.0.1:27017/myapp';
var db = mongojs(connection_string,['myapp']);
var users = db.collection("users");

var PATH = '/user';

server.put({path : PATH, version :'0.0.1'}, addUser);

function addUser(req,res,next){
    res.setHeader('Access-Control-Allow-Origin','*');
    var user = {};
    user.id = req.params.id;
    user.name = req.params.name;
    user.url = req.params.url;

    users.save(user, function(err,success) {
	    console.log('Response success ' + success);
	    console.log('Response error ' + err);
	    if (success) {
		res.send(201,user);
		return next();
	    } else {
		return next(err);
	    }
	});
}


server.listen(port ,ip_addr, function(){
	console.log('%s listening at %s ', server.name , server.url);
    });