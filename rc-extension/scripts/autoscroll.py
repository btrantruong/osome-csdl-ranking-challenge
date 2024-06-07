from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.chrome.options import Options
import time
import configparser
import os
import sys

# Path to your Chrome extension
extension_path = "/Users/baott/osome-csdl-ranking-challenge/rc-extension"

# config
config = configparser.ConfigParser()
# print(f"Reading config file, {os.path.join(os.path.dirname(__file__), 'config.ini')}")
# print(f"Reading config file, {os.path.join(os.path.dirname(__file__), 'config.ini')}")
config.read("/Users/baott/osome-csdl-ranking-challenge/rc-extension/config.ini")

handle_no = sys.argv[1]  # the account-password pair to use
username = config.get("FACEBOOK", f"account_{handle_no}")
password = config.get("FACEBOOK", f"password_{handle_no}")
print(f"Logging in.. username: {username}\npassword: {password}")
# # code to ignore browser notifications
# chrome_options = webdriver.ChromeOptions()
# prefs = {"profile.default_content_setting_values.notifications": 2}
# chrome_options.add_experimental_option("prefs", prefs)
# from selenium.webdriver.support.wait import WebDriverWait

# Chrome options to enable the extension
chrome_options = Options()
chrome_options.add_argument(f"--load-extension={extension_path}")
# Disable notifications
prefs = {"profile.default_content_setting_values.notifications": 2}
chrome_options.add_experimental_option("prefs", prefs)
# Initialize the driver
# driver = webdriver.Chrome()

# service = Service(chrome_driver_path)
driver = webdriver.Chrome(options=chrome_options)
# Navigate to the URL
driver.get("https://www.facebook.com")
time.sleep(5)


email_input = driver.find_element(By.ID, "email")
email_input.send_keys(username)

# Find the password input field and enter the password
password_input = driver.find_element(By.ID, "pass")
password_input.send_keys(password)

# Submit the login form
password_input.send_keys(Keys.RETURN)

time.sleep(5)


# Function to scroll down the page
def scroll_down_page(scroll_times, delay):
    body = driver.find_element(By.TAG_NAME, "body")
    for _ in range(scroll_times):
        print("Scrolling...")
        body.send_keys(Keys.PAGE_DOWN)
        print("Waiting...")
        time.sleep(delay)


# Scroll down the page 10 times with a 10-second delay between each scroll
scroll_down_page(10, 10)
