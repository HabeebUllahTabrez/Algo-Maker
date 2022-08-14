from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from kiteconnect import KiteConnect
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
import json
import pdb
import os
import re
import pymongo
from pymongo import MongoClient
from pprint import pprint
from datetime import datetime
from datetime import timedelta
import sys
import pyotp
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv
import time

load_dotenv()

MONGODB_URL = os.getenv('DATABASE')


# For Windows
# os.chdir(os.path.dirname(os.path.abspath(__file__)))
# PATH = 'C:\All-DATA\chromedriver.exe'

# For Linux
PATH = "/usr/bin/chromedriver"


class ZerodhaSelenium(object):

    def __init__(self):
        self.timeout = 10
        self.loadCredentials()
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        self.driver = webdriver.Chrome(
            service=Service(PATH), options=chrome_options)
        print(self.driver)

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

        # let's login
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
            fieldAnswer1 = form2FA.find_element_by_css_selector(
                "#" + AUTH_TYPE)
            print("Entering Pin")
            fieldAnswer1.send_keys(totp)
            buttonSubmit = self.getCssElement("button[type=submit]")
            print("Clicking Button")
            buttonSubmit.click()

            wait = WebDriverWait(self.driver, 10)
            wait.until(EC.url_contains("request_token="))
            print(" WAIT for  complete")

            # Get reqToken from the current URL
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


AUTH_TYPE = 'totp'


def main():
    auth_arrays = ['pin','totp']
    for i in range(0, len(auth_arrays)):
        global AUTH_TYPE
        print("working on "+auth_arrays[i])
        AUTH_TYPE = auth_arrays[0]
        # ^^^^^^^^^^^^^^^^^^^^^^^
        # mongodb+srv://admin:<password>@cluster0.7mmia.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
        client = MongoClient(MONGODB_URL)
        print(client)
        db = client['test']
        data = db.admins.find_one({'auth_type': AUTH_TYPE})
        userid = data['userID']
        password = data["password"]
        pin = data["pin"]
        api_key = data["apikey"]
        secret_key = data["secret"]
        TOTP_Secret = data['totp_secret']
        auth_type = data["auth_type"]

        if(auth_type.lower() == "totp"):
            AUTH_TYPE = "totp"
            totp = pyotp.TOTP(TOTP_Secret)
            pin = totp.now()
            print(" Current TOTP = ", pin)
        try:
            obj = ZerodhaSelenium()
            access_token_clean = " "
            access_token_clean = obj.doLogin(
                userid, password, pin, api_key, secret_key)

            print(userid + " =>  api_key =  " + api_key)
            print(userid + " =>  accesstoken =  " + access_token_clean)
            db.admins.find_one_and_update(filter={'auth_type': auth_type}, update={
                                          "$set": {'access_token': access_token_clean, 'updatedAt': time.time()*1000}})

        except Exception as err:
            print("Oops! Error => ", err, "occurred.")


main()
