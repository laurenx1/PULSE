from bs4 import BeautifulSoup
import requests
import nltk
import re

nltk.download('punkt')

def clean_text(content):
    soup = BeautifulSoup(content, 'lxml')
    paragraphs = soup.find_all('p')

    # text = ' '.join([para.get_text() for para in paragraphs])

    # text = re.sub(r'\s+', ' ', text)  # replace multiple whitespaces with just one whitespace
    # text = text.replace("’", "'")
    # text = re.sub(r'[^\x00-\x7F]+', ' ', text)  # remove non-ASCII characters

    # sentences = nltk.sent_tokenize(text)
    # formatted_content = '\n\n'.join(sentences)

    text_thing = []
    for para in paragraphs: 
        text = para.get_text()
        text = re.sub(r'\s+', ' ', text)
        text = text.replace("’", "'")
        text = re.sub(r'[^\x00-\x7F]+', ' ', text)
        sentences = nltk.sent_tokenize(text)
        formatted_content = '\n\n'.join(sentences)
        text_thing.append(formatted_content)

    return text_thing

def scrape_article(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        content = response.text
        formatted_content = clean_text(content)

    except requests.exceptions.RequestException as e:
        formatted_content = f"Error: {e}"

    return formatted_content

if __name__ == "__main__":
    url = 'http://example.com'  
    article_content = scrape_article(url)
    print(article_content)
