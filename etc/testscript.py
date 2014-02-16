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
