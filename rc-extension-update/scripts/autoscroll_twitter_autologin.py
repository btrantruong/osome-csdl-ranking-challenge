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
extension_path = "/Users/baott/osome-csdl-ranking-challenge/rc-extension"

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
driver.get("https://www.x.com/login")
time.sleep(5)

username = "btrantruong@gmail.com"
password = "susi03071996"

# # Open the x.com website
# driver.get("https://x.com")

# # Find and click the sign-in button or '//*[@data-testid="loginButton"]'
# sign_in_button = WebDriverWait(driver, 10).until(
#     EC.element_to_be_clickable(
#         (
#             By.XPATH,
#             "/html/body/div/div/div/div[2]/main/div/div/div[1]/div/div/div[3]/div[4]/a",
#         )
#     )  # Replace with the actual XPath or selector
# )
# sign_in_button.click()

# Enter the email
# or /html/body/div/div/div/div/main/div/div/div/div[2]/div[2]/div/div[4]/label/div/div[2]
# email_input = WebDriverWait(driver, 10).until(
#     EC.visibility_of_element_located(
#         (
#             By.XPATH,
#             "/html/body/div/div/div/div/main/div/div/div/div[2]/div[2]/div/div[4]/label/div/div[1]/div",
#         )
#     )  # Replace with the actual XPath or selector
# )
email_input = WebDriverWait(driver, 10).until(
    EC.visibility_of_element_located(
        (By.CSS_SELECTOR, 'input[name="text"][autocomplete="username"]')
    )
)
email_input.send_keys(username)

# # Click the next button
# next_button = WebDriverWait(driver, 10).until(
#     EC.element_to_be_clickable(
#         (
#             By.XPATH,
#             "/html/body/div/div/div/div/main/div/div/div/div[2]/div[2]/div/button[2]",
#         )
#     )  # Replace with the actual XPath or selector
# )
# next_button.click()

# # Enter the password
# password_input = WebDriverWait(driver, 10).until(
#     EC.visibility_of_element_located(
#         (
#             By.XPATH,
#             "/html/body/div/div/div/div/main/div/div/div/div[2]/div[2]/div[1]/div/div/div/div[3]/div/label/div/div[2]/div[1]/input",
#         )
#     )  # Replace with the actual XPath or selector
# )

# Click the next button
# next_button = WebDriverWait(driver, 10).until(
#     EC.element_to_be_clickable((By.CSS_SELECTOR, "div.css-146c3p1 > span.css-1jxf684"))
# )
# next_button.click()

# Click the next button using JavaScript to avoid interception
next_button = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located(
        (By.CSS_SELECTOR, "div.css-146c3p1 > span.css-1jxf684")
    )
)
driver.execute_script("arguments[0].click();", next_button)


# Enter the password
password_input = WebDriverWait(driver, 10).until(
    EC.visibility_of_element_located(
        (By.CSS_SELECTOR, 'input[data-testid="ocfEnterTextTextInput"]')
    )
)
password_input.send_keys(password)

# Click the log-in button or data-testid="LoginForm_Login_Button"
# log_in_button = WebDriverWait(driver, 10).until(
#     EC.element_to_be_clickable(
#         (
#             By.XPATH,
#             "/html/body/div/div/div/div/main/div/div/div/div[2]/div[2]/div[2]/div/div/div[1]/div/div/button",
#         )
#     )  # Replace with the actual XPath or selector
# )

log_in_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable(
        (
            By.XPATH,
            '//*[@data-testid="LoginForm_Login_Button"]',
        )
    )  # Replace with the actual XPath or selector
)
log_in_button.click()

# # Optionally wait for a few seconds before closing the browser
# WebDriverWait(driver, 10).until(EC.url_changes("https://x.com/login"))


# email_input = driver.find_element(By.ID, "email")
# email_input.send_keys(facebook_username)

# # Find the password input field and enter the password
# password_input = driver.find_element(By.ID, "pass")
# password_input.send_keys(facebook_password)

# Save the main window handle
main_window = driver.current_window_handle

# Submit the login form
password_input.send_keys(Keys.RETURN)

time.sleep(5)
# # Do something that opens a new window or tab...

# # Switch back to the main window
# print("post login")
# driver.switch_to.window(main_window)


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
