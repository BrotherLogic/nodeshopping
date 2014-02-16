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
var users = db.collection("user");
var lists = db.collection("list");


server.put({path: '/user', version: '0.0.1'}, addUser);
server.put({path: '/list', version: '0.0.1'}, addList);
server.get({path: '/list/:id', version: '0.0.1'}, getList);
server.get({path: '/list',version : '0.0.1'},getListForUser);

function getListForUser(req,res,next) {
    res.setHeader('Access-Control-Allow-Origin','*');
}


function getList(req,res,next) {
    res.setHeader('Access-Control-Allow-Origin','*');

    lists.findOne({_id:mongojs.ObjectId(req.params.id)}, function(err,doc){
	    console.log('Response success ' + doc);
	    console.log('Response error ' + err);
	    if (doc) {
		res.send(200,doc);
		return next();
	    } else {
		return next(err);
	    }

	});
}   

function addList(req,res,next){
    res.setHeader('Access-Control-Allow-Origin','*');
    
    var list = {};
    list.users = [req.params.userid];
    list.items = [];

    lists.save(list,function(err,success) {
	    console.log('Response success ' + success);
	    console.log('Response error ' + err);
	    if (success) {
		res.send(201,list);
		return next();
	    } else {
		return next(err);
	    }
	});
}
   

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