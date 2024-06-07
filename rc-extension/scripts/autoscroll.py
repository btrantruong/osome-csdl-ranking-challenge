from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.chrome.options import Options
import time
import random
import pandas as pd


# Path to your Chrome extension
extension_path = "/Users/baott/osome-server-updated/rc-extension"

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

facebook_username = "susi7396@gmail.com"
facebook_password = "Minhu2204!"
email_input = driver.find_element(By.ID, "email")
email_input.send_keys(facebook_username)

# Find the password input field and enter the password
password_input = driver.find_element(By.ID, "pass")
password_input.send_keys(facebook_password)

# Save the main window handle
main_window = driver.current_window_handle

# Submit the login form
password_input.send_keys(Keys.RETURN)

time.sleep(5)
# # Do something that opens a new window or tab...

# # Switch back to the main window
# print("post login")
# driver.switch_to.window(main_window)
# Optional: Wait for some time to see the result


# # Wait for the popup to appear and close it
# try:
#     # Wait for the 'x' button to be clickable and then click it
#     close_button = WebDriverWait(driver, 10).until(
#         EC.element_to_be_clickable((By.XPATH, '//button[contains(text(), "x")]'))
#     )
#     close_button.click()
#     print("Closed the popup")
# except Exception as e:
#     print("No popup appeared or failed to close the popup.")
#     print(str(e))

# Continue with the rest of your script
# # Load the facebook.js extension
# # This depends on how your facebook.js is structured
# # You might need to read the file and execute the script
# with open("/Users/baott/osome-server-updated/rc-extension/facebook.js", "r") as f:
#     js = f.read()
#     driver.execute_script(js)
#     print("Facebook.js extension loaded")


# Function to scroll down the page
def scroll_down_page(scroll_times, delay):
    body = driver.find_element(By.TAG_NAME, "body")
    for _ in range(scroll_times):
        print("Scrolling...")
        body.send_keys(Keys.PAGE_DOWN)
        print("Waiting...")
        time.sleep(delay)


# Scroll down the page 10 times with a 2-second delay between each scroll
scroll_down_page(10, 10)

# # Your scrolling script starts here
# SCROLL_PAUSE_TIME = 0.5

# # Get scroll height
# last_height = driver.execute_script("return document.body.scrollHeight")

# while True:
#     print("Scrolling...")
#     # Scroll down to bottom
#     driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

#     # Wait to load page
#     time.sleep(SCROLL_PAUSE_TIME)

#     # Calculate new scroll height and compare with last scroll height
#     new_height = driver.execute_script("return document.body.scrollHeight")
#     if new_height == last_height:
#         break
#     last_height = new_height
# # Your scrolling script ends here

# # Continue with the rest of your Selenium script
