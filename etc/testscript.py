import requests, json, sys, random

random_name = "dave-" + `random.random()`
id = `random.randint(1000000,9999999)`
id2 = `random.randint(1000000,9999999)`

SERVER_LOC = "http://localhost:8085/"
headers = {"Content-Type":"application/json"}
#This runs through a basic scenario for the shopping list app

#1. Check that the user exists
payload = '{"id":'+id+',"name":"'+random_name+'","url": "blah.com"}'
print payload
r = requests.put(SERVER_LOC + "user",data=payload,headers=headers)
print r.content

#2. Check that we don't add a user twice
payload = '{"id":'+id+',"name":"'+random_name+'","url": "blah.com"}'
print payload
r = requests.put(SERVER_LOC + "user",data=payload,headers=headers)
print r.content

#3. Add a new list
payload = '{"name":"testlist","userids":['+id+','+id2+']}'
print payload
r = requests.put(SERVER_LOC + "list",data=payload,headers=headers)
print r.content
listid = json.loads(r.content)['_id']

#4. Make sure we get it back
payload = '{"name":"testlist-attempt","userids":['+id+','+id2+']}'
print payload
r = requests.put(SERVER_LOC + "list",data=payload,headers=headers)
print r.content

#5. Add some itmes to this list
payload = '{"description":"chips","number":5}'
print payload
r = requests.put(SERVER_LOC + "list/" + listid,data=payload,headers=headers)
print r.content

#6. When we add this, we should see both additions
payload = '{"description":"apples","number":10}'
print payload
r = requests.put(SERVER_LOC + "list/" + listid,data=payload,headers=headers)
print r.content
timestamp = json.loads(r.content)[-1]['timestamp']

#7. See the single addition
payload = '{"description":"bananas","number":7}'
print payload
r = requests.put(SERVER_LOC + "list/" + listid + "?timestamp=" + `timestamp`,data=payload,headers=headers)
print r.content

#8. We should also be able to get the diffs following the timestamp
r = requests.get(SERVER_LOC + "list/" + listid,headers=headers)
print r.content

payload = '{"description":"bananas","number":1}'
print payload
r = requests.put(SERVER_LOC + "list/" + listid + "?timestamp=" + `timestamp`,data=payload,headers=headers)
print r.content

r = requests.get(SERVER_LOC + "list/" + listid + "/" + `timestamp`,headers=headers)
print r.content