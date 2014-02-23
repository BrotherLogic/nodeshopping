VERSION = '0.0.1';

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
var listItems = db.collection("item");
var diffs = db.collection("diff");
var archItems = db.collection("architem");

//Method to add or retrieve a user - will return a list of the associated lists for this user
server.put({path: '/user', version: VERSION}, addUser);

//Method to add a list - will return the added list
server.put({path: '/list', version: VERSION}, addList);

//Gets the items currently on the list
server.get({path: '/list/:id',version : VERSION},getListItems);

//Gets the diff list for the list, from the provided timestamp
server.get({path: '/list/:id/:timestamp', version: VERSION}, getList);

//Updates the current list
server.put({path: '/list/:listid', version: VERSION}, addItemToList);

//Ticks off an item from the list
server.post({path: '/item/:id/', version : VERSION}, tickItem);

function tickItem(req,res,next) {
	 res.setHeader('Access-Control-Allow-Origin','*');

	 tick = {};
	 tick.description = req.params.description;
	 tick.number = req.params.number;

	 listItems.findOne({_id:mongojs.ObjectId(req.params.id)}, function (success, doc){

	 	listid = doc.listid;
	 	applyDiff(listid,tick, function (diff){
	 		if (diff.number == tick.number) {
	 	 		//Item has been successfully ticked

	 		} else {
	 			//Item was not ticked for whatever reason
	 		}

	 	});
	 });
}


function addItemToList(req,res,next) {

	console.log("adding item to list");

	diff = {};
	diff.description = req.params.description;
	diff.number = req.params.number;

	timestamp = req.params.timestamp;

	listid = req.params.listid;
	console.log("Running update item");
	updateItem(diff,listid,timestamp,res);
}

function getDiffs(listid,timestamp,res){

	console.log("Getting diffs " + timestamp)

	if (timestamp != undefined) {
		console.log("Getting diffs for " + timestamp)
	
		diffs.find({listid:listid,timestamp:{$gt:Number(timestamp)}}, function(err,doc){
		    console.log('Response success ' + doc);
		    console.log('Response error ' + err);
		    if (doc) {
				res.send(200,doc);
				return next();
		    } else {
				return next(err);
		    }
		});
	} else {
		console.log("Getting all diffs for " + listid)
	
		diffs.find({listid:listid}, function(err,doc){
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
}

function updateItem(diff,listid,timestamp,res) {

	console.log("Updating Item");

	//add the diff to the diff table
	diff = diff;
	diff['timestamp'] = new Date().getTime();
	diff['listid'] = listid;

	diffs.save(diff);

	//Adjust the list accordingly
	listItems.findOne({description: String(diff.description), listid:String(listid)}, function (success,doc){
		list_item = doc;
		console.log("Here = " + list_item);
		if (list_item == null) {

			//Add the item to the list
			newItem = {};
			newItem.number = diff.number;
			newItem.description = diff.description;
			newItem.listid = listid;

			listItems.save(newItem);
			getDiffs(listid,timestamp,res);

		} else {
			//Update the item
			list_item.number += diff.number;

			if (list_item.number <= 0) {
				//Delete the item
				listItems.delete(list_item, function(success,err){
					console.log("delete " + success);
					console.log("err " + err);
				});
			} else {
				console.log("Updating " + list_item);
				listItems.save(list_item, function(success,err){
					console.log("delete " + success);
					console.log("err " + err);
				});
			}

			getDiffs(listid,timestamp,res)
		}
	});
}

function getList(req,res,next) {
    console.log("getList");

    res.setHeader('Access-Control-Allow-Origin','*');

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



function getListItems(req,res,next) {
    console.log("getList");

    res.setHeader('Access-Control-Allow-Origin','*');

    listItems.find({_id:mongojs.ObjectId(req.params.id),}, function(err,doc){
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

function addList(req,res,next) {
	console.log("addList");

	res.setHeader('Access-Control-Allow-Origin','*');

	userids = req.params.userids;

	//See if this list already exists
	lists.findOne({users:userids}, function (err,doc) {

		console.log('List response error ' + err);
		console.log('List response resp ' + doc);

		if (doc == null) {
			var list = {};
			list.name = req.params.name;
			list.users = userids;

			lists.save(list, function (err,success){

				console.log('Intter list response error ' + err);	

				if (success) {
					res.send(201,list);
					return next();
				} else {
					return next(err);
				}
			});
		} else {
			res.send(200,doc);
			return next();
		}

	});
}

function getListForUser(req,res,next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    
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

    	//return the lists for this user if they already exist
    	if (doc != null) {
    		lists.find({users:user.id}, function(err,doc){
    			res.send(200,doc);
    			return next();
    		});
    	} else {

    		//Storing user
    		console.log('Storing user ' + user);

    		users.save(user, function(err,success) {	   		
	   			console.log('Response success ' + success);
	    		console.log('Response error ' + err);
	    		if (success) {

	    			//Create a default list for this user
					var list = {};
					list.users = [req.params.id];
					list.items = [];
					list.name = "Default";

				    lists.save(list, function(err,success){
						console.log('addList Response success ' + success);
						console.log('addList Response error ' + err);
						res.send(200,[list]);
	    				return next();
					});
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