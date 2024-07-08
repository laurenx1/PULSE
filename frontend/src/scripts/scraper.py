from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import nltk
import time
import re

nltk.download('punkt')


def clean_text(content): 
    # parse html content with BeautifulSoup
    soup = BeautifulSoup(content, 'lxml')

    # extract text from paragraphs 
    paragraphs = soup.find_all('p')
    text = ' '.join([para.get_text() for para in paragraphs])

    # remove unwanted characters or patterns
    text = re.sub(r'\s+', ' ', text) # replace multiple whitespaces with just one whitespace
    text = re.sub(r'[^\x00-\x7F]+', ' ', text) # remove non-ASCII characters

    # tokenize into sentences
    sentences = nltk.sent_tokenize(text)

    formatted_content = '\n\n'.join(sentences)

    return formatted_content 


def scrape_article(url):
    options = Options()
    options.headless = True # run in headless mode
    options.add_argument("--window-size=1920,1200")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-popup-blocking")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(service=Service('/opt/homebrew/bin/chromedriver'), options=options) # idk if this is the right place where it is stored

    try: 
        driver.get(url)
        time.sleep(3) # wait for page to fully load

        # get text content of article
        content = driver.page_source

        formatted_content = clean_text(content)


    except Exception as e: 
        formatted_content = f"Error: {e}"
    finally: 
        driver.quit()

    return formatted_content 

if __name__ == "__main__": 
    url = 'http://localhost:5173' # replace with actual article URL? idk 
    article_content = scrape_article(url)
    print(article_content)