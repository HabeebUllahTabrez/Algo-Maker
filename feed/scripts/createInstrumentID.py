import requests
import os
import os.path as path
  
LIVEPRICES_path =  path.abspath(path.join(__file__ ,"../.."))
print("LIVEPRICES_path :", LIVEPRICES_path)

url =  "https://api.kite.trade/instruments"
data = (requests.get(url)).text
lines = data.split("\n")

f = open(LIVEPRICES_path + "/data/instrumentID.js","w")
f.write("module.exports = {\n")
no_of_lines = len(lines)

print(no_of_lines)

for i in range(1,no_of_lines):
    dt = lines[i].split(",")
 
    if i == no_of_lines - 2:
        try:
            print(i , dt[0] , dt[2])
            f.write( '"' + dt[2] + '"' + ":" + dt[0] + "\n")
        except:
            print("--")
    else:
        try:
            print(i , dt[0] , dt[2])
            f.write( '"' + dt[2] + '"' + ":" + dt[0] + ",\n")
        except:
            print("--")

print("----------Completed----------")
f.write("}")
f.close()