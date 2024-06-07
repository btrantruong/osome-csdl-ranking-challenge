import time
from selenium import webdriver
from selenium.webdriver import ChromeOptions, Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
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
username = config.get("TWITTER", f"account_{handle_no}")
password = config.get("TWITTER", f"password_{handle_no}")

# Chrome options to enable the extension

options = ChromeOptions()
options.add_argument("--start-maximized")
options.add_argument(f"--load-extension={extension_path}")
# options.add_experimental_option("excludeSwitches", ["enable-automation"])

# options.add_argument(
#     "user-data-dir=/Users/baott/Library/Application Support/Google/Chrome/Default"
# )  # path for MacOS
# options.add_experimental_option("detach", True)  # prevent window from closing

# prefs = {"profile.default_content_setting_values.notifications": 2}
# options.add_experimental_option("prefs", prefs)
driver = webdriver.Chrome(options=options)
url = "https://twitter.com/i/flow/login"
driver.get(url)

# I am giving myself enough time to manually login to the website and then printing the cookie
time.sleep(60)
# print(driver.get_cookies())

# # Than I am using add_cookie() to add the cookie/s that I got from get_cookies()
# driver.add_cookie(driver.get_cookies()[-1])

# print(f"Logging in.. username: {username}\npassword: {password}")
# username_field = WebDriverWait(driver, 20).until(
#     EC.visibility_of_element_located(
#         (By.CSS_SELECTOR, 'input[autocomplete="username"]')
#     )
# )
# username_field.send_keys(username)
# username_field.send_keys(Keys.ENTER)

# password_field = WebDriverWait(driver, 10).until(
#     EC.visibility_of_element_located((By.CSS_SELECTOR, 'input[name="password"]'))
# )
# password_field.send_keys(password)
# password_field.send_keys(Keys.ENTER)

# time.sleep(10)


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
