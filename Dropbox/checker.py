#!/usr/bin/env python
# Author: Amanda Szampias
# Description: Check if all files imported into ElasticSearch.
import requests
import json

def getDocumentById(intCount):
  x = requests.get('http://localhost:9200/breach/_doc/' + str(intCount))
  y = json.loads(x.text)
  #print(y["found"]);
  return y["found"];
 
def main():
  intCount = 82209229; # Change this value based on the index you started at.
  for i in range(0, 2835):
    bFound = getDocumentById(intCount)
    if (bFound == False):
      print('File is missing: linkedin_' + str(i) + '.json')
    else:
      print('File is found: ' + str(i))
    intCount = intCount + 29001;
  print('-----------------------------')
 
if __name__ == "__main__":
  main()