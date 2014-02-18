import requests, json, sys

SERVER_LOC = "http://localhost:8085/"
headers = {"Content-Type":"application/json"}
#This runs through a basic scenario for the shopping list app

#1. Check that the user exists
payload = '{"id":1234567,"name":"dave biggins","url": "blah.com"}'
r = requests.put(SERVER_LOC + "user",data=payload,headers=headers)
print r.content

#2. Get the lists that the user belongs to
r = requests.get(SERVER_LOC + "list?userid=1234567",headers=headers)
print r.content
list_id = json.loads(r.content)[0]['_id']

#3. Add two items to the list
payload = '{"description":"apples","number":3}';
r = requests.put(SERVER_LOC +"list/" + list_id + "/addItem",data=payload,headers=headers);
print r.content
payload = '{"description":"bananas","number":3}';
r = requests.put(SERVER_LOC +"list/" + list_id + "/addItem",data=payload,headers=headers);
print r.content

#4. Change up an item on hte list
payload = '{"description":"apples","number":-2}';
