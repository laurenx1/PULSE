from bs4 import BeautifulSoup
import requests
import nltk
import re

nltk.download('punkt')

def clean_text(content):
    # parse html content with BeautifulSoup
    soup = BeautifulSoup(content, 'lxml')

    # extract text from paragraphs by finding all <p> tags
    paragraphs = soup.find_all('p')
    text = ' '.join([para.get_text() for para in paragraphs])

    # remove unwanted characters or patterns
    text = re.sub(r'\s+', ' ', text)  # replace multiple whitespaces with just one whitespace
    text = text.replace("’", "'")
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)  # remove non-ASCII characters

    # tokenize into sentences
    sentences = nltk.sent_tokenize(text)

    formatted_content = '\n\n'.join(sentences)

    return formatted_content

def scrape_article(url):
    # add header to make it look like a request from a web browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # set timeout if takign tooo long 
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # check for request errors

        # get text content of article
        content = response.text

        # parse with BeautifulSoup
        soup = BeautifulSoup(content, 'lxml')

        # extract text from paragraphs 
        paragraphs = soup.find_all('p')
        text = ' '.join([para.get_text() for para in paragraphs])

        # # extract images @TODO: fix so that images are placed correctly throughout the article. 
        # images = []
        # for img in soup.find_all('img'):
        #     img_src = img.get('src')
        #     if img_src and img_src.startswith(('http', 'https')):
        #         images.append(img_src)

        # remove unwanted characters or patterns 
        text = re.sub(r'\s+', ' ', text)  # replace multiple whitespaces with just one whitespace
        text = text.replace("’", "'")
        text = re.sub(r'[^\x00-\x7F]+', ' ', text)  # remove non-ASCII characters

        # tokenize into sentences
        sentences = nltk.sent_tokenize(text)


        

        formatted_content = '\n\n'.join(sentences)

        # # include images in the formatted content
        # for img in images:
        #     formatted_content += f'\n\n<img src="{img}" alt="Article Image">\n'

    except requests.exceptions.RequestException as e:
        formatted_content = f"Error: {e}"

    return formatted_content

if __name__ == "__main__":
    url = 'http://example.com'  
    article_content = scrape_article(url)
    print(article_content)
