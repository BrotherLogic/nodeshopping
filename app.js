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
var listItems = db.collection("items");
var diffs = db.collection("diffs");

server.put({path: '/user', version: '0.0.1'}, addUser);
server.put({path: '/list', version: '0.0.1'}, addList);
server.get({path: '/list/:id/:timestamp', version: '0.0.1'}, getList);
server.get({path: '/list',version : '0.0.1'},getListForUser);
server.put({path: '/list/:listid/addItem', version: '0.0.1'}, addItemToList)

function addItemToList(req,res,next) {

	console.log("adding item to list");

	diff = {};
	diff.description = req.params.description;
	diff.number = req.params.number;

	listid = req.params.listid;

	console.log("Updating " + diff + " and " + listid);

	givenDiff = updateItem(diff,listid);

	console.log("updated item");

	res.send(200,givenDiff);
	return next();
}

function updateItem(diff,listid) {

	//add the diff to the diff table
	diff = diff;
	diff['timestamp'] = new Date().getTime();
	diff['listid'] = listid;

	diffs.save(diff);

	//Adjust the list accordingly
	listItems.findOne({description: String(diff.description), listid:String(listid)}, function (success,doc){
		
	});

	console.log("Found " + list_item + " from " + diff.description + " and " + listid);
	console.log("Also " + (diff.description instanceof String));
	console.log("Also " + (listid instanceof String));

	if (list_item == null) {

		//Add the item to the list
		newItem = {};
		newItem.number = diff.number;
		newItem.description = diff.description;
		newItem.listid = listid;

		listItems.save(newItem);
		return diff;
	} else {
		//Update the item
		list_item.number += diff.number;

		if (list_item.number <= 0) {
			//Delete the item
			lists.delete(list_item);
		} else {
			lists.update(list_item);
		}

		return diff;
	}
}

function getList(req,res,next) {
    console.log("getList");

    res.setHeader('Access-Control-Allow-Origin','*')

    diffs.findOne({_id:mongojs.ObjectId(req.params.id),timestamp:{$gt:Number(req.params.timestamp)}}, function(err,doc){
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

function getListForUser(req,res,next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    
    console.log("Blah = " + {users:req.params.userid});

    lists.find({users:Number(req.params.userid)}, function(err,doc){

    	console.log('Lists response success for ' + req.params.userid + ': ' + doc);
    	console.log('List response error ' + err);

    	if (doc) {
    		res.send(200,doc);
    		return next();
    	} else {
    		return next(err);
    	}
    });

    return next();
}

function addList(userids)
{
	//Create a default list for this user
	var list = {};
	list.users = userids;
	list.items = [];

    lists.save(list, function(err,success){
		console.log('addList Response success ' + success);
		console.log('addList Response error ' + err);
	});
}

function addUser(req,res,next){
    res.setHeader('Access-Control-Allow-Origin','*');
    var user = {};
    user.id = req.params.id;
    user.name = req.params.name;
    user.url = req.params.url;

    // Check to see if the user already exists
    users.findOne({id:user.id}, function(err,doc) {
    	console.log('Response error ' + err);
    	console.log('Doc ret ' + doc);

    	//If the user is new - ensure that at least one list is created
    	if (doc != null) {
    		res.send(200,doc);
    		return next();
    	} else {
    		//Storing user
    		console.log('Storing user ' + user);
    		users.save(user, function(err,success) {
	   			console.log('Response success ' + success);
	    		console.log('Response error ' + err);
	    		if (success) {
	    			addList([req.params.id]);
	    			res.send(201,user);
	    			return next();
	    		} else {
					return next(err);
	    		}
			});
    	}
    });

    
}


server.listen(port ,ip_addr, function(){
	console.log('%s listening at %s ', server.name , server.url);
});