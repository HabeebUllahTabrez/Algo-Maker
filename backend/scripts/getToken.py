from selenium.webdriver.remote.remote_connection import LOGGER
import logging
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from kiteconnect import KiteConnect
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
from pymongo import MongoClient
from pymongo import server_api
import json
import pdb
import os
import re

from pprint import pprint
from datetime import datetime
from datetime import timedelta
import sys

PATH = "/usr/bin/chromedriver"

LOGGER.setLevel(logging.WARNING)
f = open("../data/credentials.json", "r")
credentials = json.load(f)
user = credentials["user"]
pswd = credentials["pswd"]
twofa = credentials["twofa"]
apiKey = credentials["api_key"]
api_secret = credentials["api_secret"]
accessToken = credentials["access_token"]
f.close()


class ZerodhaSelenium(object):

    def __init__(self):
        self.timeout = 10
        self.loadCredentials()
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        self.driver = webdriver.Chrome(
            executable_path=r"C:\bin\chromedriver.exe", options=chrome_options)

    def getCssElement(self, cssSelector):
        '''
        To make sure we wait till the element appears
        '''
        return WebDriverWait(self.driver, self.timeout).until(EC.presence_of_element_located((By.CSS_SELECTOR, cssSelector)))

    def loadCredentials(self):
        #self.username = "SA0254"
        #self.password = "temp1234"
        #self.security = "987332"
        pass

    def doLogin(self, username, password, totp, api_key, secret_key):
        global AUTH_TYPE

        #let's login
        login_url = "https://kite.trade/connect/login?api_key=" + api_key
        self.driver.get(login_url)
        try:
            passwordField = self.getCssElement("input[id=password]")
            print("Entering password")
            passwordField.send_keys(password)
            userNameField = self.getCssElement("input[id=userid]")
            print("Enterting Username ")
            userNameField.send_keys(username)
            loginButton = self.getCssElement("button[type=submit]")
            loginButton.click()
            print("Login Button clicked ")

            # 2FA
            form2FA = self.getCssElement("form.twofa-form")
            fieldAnswer1 = self.getCssElement("input[label='PIN']")
            print("Entering Pin")
            fieldAnswer1.send_keys(totp)
            buttonSubmit = self.getCssElement("button[type=submit]")
            print("Clicking Button")
            buttonSubmit.click()

            wait = WebDriverWait(self.driver, 10)
            wait.until(EC.url_contains("request_token="))
            print(" WAIT for  complete")

            #Get reqToken from the current URL
            url = str(self.driver.current_url)
            print("Redirect URI " + url)
            url = url.split("request_token=")

            if(len(url) == 2):
                reqToken = (url[1].split('&'))[0]
                #print("REQ Token = " , reqToken)
                kite = KiteConnect(api_key=api_key)
                data = kite.generate_session(reqToken, api_secret=secret_key)
                kite.set_access_token(data["access_token"])
                self.driver.quit()
                return data["access_token"]
            else:
                return "--"

        except TimeoutException:
            print("Timeout occurred")


AUTH_TYPE = "pin"


def main():

    global AUTH_TYPE

    print("==========_Starting_==============\n ")
    print(" Time = ", datetime.now())
    client = MongoClient("mongodb+srv://sans1306:F1wvMT5sqYqrPOoL@gamers.uhyrp.mongodb.net/algotrade?retryWrites=true&w=majority")
    db = client["algotrade"]
    mycol = db["params"]

    try:

        userid = user
        password = pswd
        pin = twofa
        api_key = apiKey
        secret_key = api_secret
        access_token = accessToken

        print("Finding AccessToken for :  ", userid)

        kite = KiteConnect(api_key=api_key)
        # kite.set_access_token(access_token)

        try:
            dt = kite.orders()
            print(userid, " has already Correct Token \n ")
        except:
            try:
                obj = ZerodhaSelenium()
                access_token_clean = " "
                access_token_clean = obj.doLogin(
                    userid, password, pin, api_key, secret_key)
                print(access_token_clean)
                print(userid + " =>  api_key =  " + api_key)
                print(userid + " =>  accesstoken =  " + access_token_clean)

                credentials["access_token"] = access_token_clean
                with open("../data/credentials.json", "w") as f:
                    json.dump(credentials, f)
                myquery = {"userID": userid}
                newvalues = {"$set": {"accesstoken": access_token_clean}}
                mycol.update_one(myquery, newvalues)
            except Exception as err:
                print("Oops! Error => ", err, "occurred.")

    except Exception as err:
        print("Oops! Error => ", err, "occurred.")
        print(" Error in Details for", userid)

    print("\n==========_Completed_==============")


main()



# from selenium.webdriver.remote.remote_connection import LOGGER
# import logging
# from selenium import webdriver
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.common.exceptions import TimeoutException
# from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.options import Options
# from kiteconnect import KiteConnect
# from selenium.webdriver.support import expected_conditions as EC
# from time import sleep
# import json
# import pdb
# import os
# import re
# from pymongo import MongoClient
# from pymongo import server_api
# from pprint import pprint
# from datetime import datetime
# from datetime import timedelta
# import sys

# PATH = "/usr/bin/chromedriver"

# LOGGER.setLevel(logging.WARNING)
# f = open("../data/credentials.json", "r")
# credentials = json.load(f)
# user = credentials["user"]
# pswd = credentials["pswd"]
# twofa = credentials["twofa"]
# apiKey = credentials["api_key"]
# api_secret = credentials["api_secret"]
# accessToken = credentials["access_token"]
# f.close()


# class ZerodhaSelenium(object):

#     def __init__(self):
#         self.timeout = 10
#         self.loadCredentials()
#         chrome_options = Options()
#         chrome_options.add_argument('--headless')
#         chrome_options.add_argument('--no-sandbox')
#         chrome_options.add_argument('--disable-dev-shm-usage')
#         self.driver = webdriver.Chrome(
#             executable_path=r'/usr/bin/chromedriver', options=chrome_options)

#     def getCssElement(self, cssSelector):
#         '''
#         To make sure we wait till the element appears
#         '''
#         return WebDriverWait(self.driver, self.timeout).until(EC.presence_of_element_located((By.CSS_SELECTOR, cssSelector)))

#     def loadCredentials(self):
#         #self.username = "SA0254"
#         #self.password = "temp1234"
#         #self.security = "987332"
#         pass

#     def doLogin(self, username, password, totp, api_key, secret_key):
#         global AUTH_TYPE

#         #let's login
#         login_url = "https://kite.trade/connect/login?api_key=" + api_key
#         self.driver.get(login_url)
#         try:
#             passwordField = self.getCssElement("input[id=password]")
#             print("Entering password")
#             passwordField.send_keys(password)
#             userNameField = self.getCssElement("input[id=userid]")
#             print("Enterting Username ")
#             userNameField.send_keys(username)
#             loginButton = self.getCssElement("button[type=submit]")
#             loginButton.click()
#             print("Login Button clicked ")

#             # 2FA
#             form2FA = self.getCssElement("form.twofa-form")
#             fieldAnswer1 = self.getCssElement("input[label='PIN']")
#             print("Entering Pin")
#             fieldAnswer1.send_keys(totp)
#             buttonSubmit = self.getCssElement("button[type=submit]")
#             print("Clicking Button")
#             buttonSubmit.click()

#             wait = WebDriverWait(self.driver, 10)
#             wait.until(EC.url_contains("request_token="))
#             print(" WAIT for  complete")

#             #Get reqToken from the current URL
#             url = str(self.driver.current_url)
#             print("Redirect URI " + url)
#             url = url.split("request_token=")

#             if(len(url) == 2):
#                 reqToken = (url[1].split('&'))[0]
#                 #print("REQ Token = " , reqToken)
#                 kite = KiteConnect(api_key=api_key)
#                 data = kite.generate_session(reqToken, api_secret=secret_key)
#                 kite.set_access_token(data["access_token"])
#                 self.driver.quit()
#                 return data["access_token"]
#             else:
#                 return "--"

#         except TimeoutException:
#             print("Timeout occurred")


# AUTH_TYPE = "pin"


# def main():

#     global AUTH_TYPE

#     print("==========_Starting_==============\n ")
#     print(" Time = ", datetime.now())
#     client = MongoClient("mongodb+srv://sans1306:F1wvMT5sqYqrPOoL@gamers.uhyrp.mongodb.net/algotrade?retryWrites=true&w=majority")
#     db = client["algotrade"]
#     mycol = db["params"]

#     client = mycol.find_one({})
#     try:

#         userid = client['userID']
#         password = client["password"]
#         pin = client["pin"]
#         api_key = client["apikey"]
#         secret_key = client["secret"]
#         access_token = client['accesstoken']
#         auth_type = client["auth_type"]
#         TOTP_Secret = client['totp_secret']

#         print("Finding AccessToken for :  ", userid)

#         kite = KiteConnect(api_key=api_key)
#         # kite.set_access_token(access_token)

#         try:
#             dt = kite.orders()
#             print(userid, " has already Correct Token \n ")
#         except:
#             try:
#                 obj = ZerodhaSelenium()
#                 access_token_clean = " "
#                 access_token_clean = obj.doLogin(
#                     userid, password, pin, api_key, secret_key)
#                 print(access_token_clean)
#                 print(userid + " =>  api_key =  " + api_key)
#                 print(userid + " =>  accesstoken =  " + access_token_clean)

#                 myquery = {"userID": userid}
#                 newvalues = {"$set": {"accesstoken": access_token_clean}}
#                 mycol.update_one(myquery, newvalues)
#             except Exception as err:
#                 print("Oops! Error => ", err, "occurred.")

#     except Exception as err:
#         print("Oops! Error => ", err, "occurred.")
#         print(" Error in Details for", userid)

#     print("\n==========_Completed_==============")


# main()
