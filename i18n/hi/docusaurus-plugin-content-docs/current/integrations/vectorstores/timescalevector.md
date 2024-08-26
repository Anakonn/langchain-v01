---
translated: true
---

# टाइमस्केल वेक्टर (पोस्टग्रेस)

>[Timescale Vector](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) AI अनुप्रयोगों के लिए `PostgreSQL++` वेक्टर डेटाबेस है।

यह नोटबुक दिखाती है कि पोस्टग्रेस वेक्टर डेटाबेस `Timescale Vector` का उपयोग कैसे करें। आप सीखेंगे कि TimescaleVector का उपयोग कैसे करें (1) सिमेंटिक सर्च के लिए, (2) समय-आधारित वेक्टर सर्च के लिए, (3) स्व-प्रश्न पूछने के लिए, और (4) क्वेरी को तेज़ करने के लिए इंडेक्स कैसे बनाएं।

## टाइमस्केल वेक्टर क्या है?

`Timescale Vector` आपको `PostgreSQL` में लाखों वेक्टर एम्बेडिंग्स को कुशलतापूर्वक संग्रहीत और क्वेरी करने में सक्षम बनाता है।
- `pgvector` को तेज़ और अधिक सटीक समानता सर्च के साथ 100M+ वेक्टर पर `DiskANN` प्रेरित इंडेक्सिंग एल्गोरिदम के माध्यम से बढ़ाता है।
- स्वचालित समय-आधारित विभाजन और इंडेक्सिंग के माध्यम से तेज समय-आधारित वेक्टर सर्च को सक्षम करता है।
- वेक्टर एम्बेडिंग्स और रिलेशनल डेटा के लिए एक परिचित SQL इंटरफ़ेस प्रदान करता है।

`Timescale Vector` एआई के लिए क्लाउड `PostgreSQL` है जो आपको POC से उत्पादन तक स्केल करता है:
- आपको रिलेशनल मेटाडेटा, वेक्टर एम्बेडिंग्स और समय-श्रृंखला डेटा को एकल डेटाबेस में संग्रहीत करने में सक्षम बनाकर संचालन को सरल बनाता है।
- स्ट्रीमिंग बैकअप और प्रतिकृति, उच्च उपलब्धता और रो-लेवल सुरक्षा जैसी एंटरप्राइज़-ग्रेड सुविधाओं के साथ रॉक-सॉलिड PostgreSQL नींव से लाभान्वित होता है।
- एंटरप्राइज़-ग्रेड सुरक्षा और अनुपालन के साथ एक निश्चिंत अनुभव सक्षम करता है।

## टाइमस्केल वेक्टर तक कैसे पहुँचें

`Timescale Vector` [Timescale](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) पर उपलब्ध है, जो क्लाउड PostgreSQL प्लेटफॉर्म है। (इस समय कोई स्व-होस्टेड संस्करण नहीं है।)

LangChain उपयोगकर्ताओं को Timescale Vector के लिए 90-दिन का मुफ्त ट्रायल मिलता है।
- शुरू करने के लिए, [signup](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) Timescale पर करें, एक नया डेटाबेस बनाएं और इस नोटबुक का पालन करें!
- अधिक विवरण और प्रदर्शन बेंचमार्क के लिए [Timescale Vector explainer blog](https://www.timescale.com/blog/how-we-made-postgresql-the-best-vector-database/?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) देखें।
- Python में Timescale Vector का उपयोग करने पर अधिक विवरण के लिए [installation instructions](https://github.com/timescale/python-vector) देखें।

## सेटअप

इस ट्यूटोरियल का पालन करने के लिए तैयार होने के लिए इन चरणों का पालन करें।

```python
# Pip install necessary packages
%pip install --upgrade --quiet  timescale-vector
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  tiktoken
```

इस उदाहरण में, हम `OpenAIEmbeddings` का उपयोग करेंगे, इसलिए चलिए आपके OpenAI API कुंजी को लोड करते हैं।

```python
import os

# Run export OPENAI_API_KEY=sk-YOUR_OPENAI_API_KEY...
# Get openAI api key by reading local .env file
from dotenv import find_dotenv, load_dotenv

_ = load_dotenv(find_dotenv())
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
```

```python
# Get the API key and save it as an environment variable
# import os
# import getpass
# os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")

```

```python
from typing import Tuple
```

अगला हम आवश्यक Python लाइब्रेरीज़ और LangChain से लाइब्रेरीज़ आयात करेंगे। ध्यान दें कि हम `timescale-vector` लाइब्रेरी और TimescaleVector LangChain vectorstore को भी आयात करते हैं।

```python
from datetime import datetime, timedelta

from langchain_community.docstore.document import Document
from langchain_community.document_loaders import TextLoader
from langchain_community.document_loaders.json_loader import JSONLoader
from langchain_community.vectorstores.timescalevector import TimescaleVector
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

## 1. यूक्लिडियन दूरी के साथ समानता खोज (डिफ़ॉल्ट)

पहले, हम स्टेट ऑफ़ द यूनियन भाषण पर समानता खोज क्वेरी का एक उदाहरण देखेंगे ताकि दिए गए क्वेरी वाक्य के लिए सबसे समान वाक्य खोजे जा सकें। हम अपने समानता मीट्रिक के रूप में [Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance) का उपयोग करेंगे।

```python
# Load the text and split it into chunks
loader = TextLoader("../../../extras/modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

अगला, हम अपने Timescale डेटाबेस के लिए सेवा URL लोड करेंगे।

यदि आपने अभी तक ऐसा नहीं किया है, [signup for Timescale](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) करें, और एक नया डेटाबेस बनाएं।

फिर, अपने PostgreSQL डेटाबेस से कनेक्ट करने के लिए, आपको अपनी सेवा URI की आवश्यकता होगी, जो आपको चीटशीट या `.env` फ़ाइल में मिलेगा जो आपने नया डेटाबेस बनाने के बाद डाउनलोड किया था।

URI कुछ इस तरह दिखेगा: `postgres://tsdbadmin:<password>@<id>.tsdb.cloud.timescale.com:<port>/tsdb?sslmode=require`।

```python
# Timescale Vector needs the service url to your cloud database. You can see this as soon as you create the
# service in the cloud UI or in your credentials.sql file
SERVICE_URL = os.environ["TIMESCALE_SERVICE_URL"]

# Specify directly if testing
# SERVICE_URL = "postgres://tsdbadmin:<password>@<id>.tsdb.cloud.timescale.com:<port>/tsdb?sslmode=require"

# # You can get also it from an environment variables. We suggest using a .env file.
# import os
# SERVICE_URL = os.environ.get("TIMESCALE_SERVICE_URL", "")
```

अगला हम एक TimescaleVector vectorstore बनाएंगे। हम एक संग्रह नाम निर्दिष्ट करेंगे, जो हमारे डेटा को संग्रहीत करने वाली तालिका का नाम होगा।

नोट: TimescaleVector का एक नया उदाहरण बनाते समय, TimescaleVector मॉड्यूल संग्रह के नाम के साथ एक तालिका बनाने का प्रयास करेगा। तो, सुनिश्चित करें कि संग्रह का नाम अद्वितीय है (यानी यह पहले से मौजूद नहीं है)।

```python
# The TimescaleVector Module will create a table with the name of the collection.
COLLECTION_NAME = "state_of_the_union_test"

# Create a Timescale Vector instance from the collection of documents
db = TimescaleVector.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=COLLECTION_NAME,
    service_url=SERVICE_URL,
)
```

अब जब हमने अपना डेटा लोड कर लिया है, हम एक समानता खोज कर सकते हैं।

```python
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db.similarity_search_with_score(query)
```

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.18443380687035138
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18452197313308139
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.21720781018594182
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.21724902288621384
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
```

### एक रिट्रीवर के रूप में टाइमस्केल वेक्टर का उपयोग करना

TimescaleVector स्टोर को प्रारंभ करने के बाद, आप इसे [retriever](/docs/modules/data_connection/retrievers/) के रूप में उपयोग कर सकते हैं।

```python
# Use TimescaleVector as a retriever
retriever = db.as_retriever()
```

```python
print(retriever)
```

```output
tags=['TimescaleVector', 'OpenAIEmbeddings'] metadata=None vectorstore=<langchain_community.vectorstores.timescalevector.TimescaleVector object at 0x10fc8d070> search_type='similarity' search_kwargs={}
```

आइए RetrievalQA चैन और स्टफ डॉक्यूमेंट्स चैन के साथ Timescale Vector का रिट्रीवर के रूप में उपयोग करने का एक उदाहरण देखें।

इस उदाहरण में, हम वही क्वेरी पूछेंगे जैसा कि ऊपर, लेकिन इस बार हम Timescale Vector द्वारा लौटाए गए प्रासंगिक दस्तावेजों को एक LLM को संदर्भ के रूप में पास करेंगे ताकि हमारे प्रश्न का उत्तर दे सकें।

पहले हम अपनी स्टफ चैन बनाएंगे:

```python
# Initialize GPT3.5 model
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0.1, model="gpt-3.5-turbo-16k")

# Initialize a RetrievalQA class from a stuff chain
from langchain.chains import RetrievalQA

qa_stuff = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    verbose=True,
)
```

```python
query = "What did the president say about Ketanji Brown Jackson?"
response = qa_stuff.run(query)
```

```output


[1m> Entering new RetrievalQA chain...[0m

[1m> Finished chain.[0m
```

```python
print(response)
```

```output
The President said that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson, who is one of our nation's top legal minds and will continue Justice Breyer's legacy of excellence. He also mentioned that since her nomination, she has received a broad range of support from various groups, including the Fraternal Order of Police and former judges appointed by Democrats and Republicans.
```

## 2. समय-आधारित फ़िल्टरिंग के साथ समानता खोज

Timescale Vector के लिए एक प्रमुख उपयोग मामला कुशल समय-आधारित वेक्टर खोज है। Timescale Vector इसे स्वचालित रूप से समय के अनुसार वेक्टर (और संबंधित मेटाडेटा) को विभाजित करके सक्षम बनाता है। यह आपको क्वेरी वेक्टर और समय के लिए समानता दोनों द्वारा वेक्टर को कुशलतापूर्वक क्वेरी करने की अनुमति देता है।

समय-आधारित वेक्टर खोज कार्यक्षमता निम्नलिखित अनुप्रयोगों के लिए सहायक है:
- LLM प्रतिक्रिया इतिहास संग्रहीत करना और पुनः प्राप्त करना (जैसे चैटबॉट्स)
- क्वेरी वेक्टर के समान नवीनतम एम्बेडिंग्स को खोजना (जैसे हाल की खबरें)।
- प्रासंगिक समय सीमा तक समानता खोज को सीमित करना (जैसे ज्ञान आधार के बारे में समय-आधारित प्रश्न पूछना)

TimescaleVector के समय-आधारित वेक्टर खोज कार्यक्षमता का उपयोग कैसे करें, यह दिखाने के लिए, हम TimescaleDB के लिए गिट लॉग इतिहास के बारे में प्रश्न पूछेंगे। हम दिखाएंगे कि समय-आधारित uuid के साथ दस्तावेज़ों को कैसे जोड़ें और समय सीमा फ़िल्टर के साथ समानता खोज कैसे चलाएं।

### गिट लॉग JSON से सामग्री और मेटाडेटा निकालें

पहले हम अपने PostgreSQL डेटाबेस में `timescale_commits` नामक एक नए संग्रह में गिट लॉग डेटा लोड करेंगे।

हम एक सहायक फ़ंक्शन परिभाषित करेंगे जो इसके टाइमस्टैम्प के आधार पर किसी दस्तावेज़ और संबंधित वेक्टर एम्बेडिंग के लिए एक uuid बनाएगा। हम इस फ़ंक्शन का उपयोग प्रत्येक गिट लॉग प्रविष्टि के लिए एक uuid बनाने के लिए करेंगे।

महत्वपूर्ण नोट: यदि आप दस्तावेज़ों के साथ काम कर रहे हैं और वेक्टर के लिए वर्तमान तिथि और समय को समय-आधारित खोज के लिए चाहते हैं, तो आप इस चरण को छोड़ सकते हैं। जब दस्तावेज़ों को निगला जाता है तो डिफ़ॉल्ट रूप से एक uuid स्वचालित रूप से उत्पन्न हो जाएगा।

```python
from timescale_vector import client


# Function to take in a date string in the past and return a uuid v1
def create_uuid(date_string: str):
    if date_string is None:
        return None
    time_format = "%a %b %d %H:%M:%S %Y %z"
    datetime_obj = datetime.strptime(date_string, time_format)
    uuid = client.uuid_from_time(datetime_obj)
    return str(uuid)
```

अगला, हम JSON रिकॉर्ड से प्रासंगिक मेटाडेटा निकालने के लिए एक मेटाडेटा फ़ंक्शन को परिभाषित करेंगे। हम इस फ़ंक्शन को JSONLoader को पास करेंगे। अधिक विवरण के लिए [JSON document loader docs](/docs/modules/data_connection/document_loaders/json) देखें।

```python
# Helper function to split name and email given an author string consisting of Name Lastname <email>
def split_name(input_string: str) -> Tuple[str, str]:
    if input_string is None:
        return None, None
    start = input_string.find("<")
    end = input_string.find(">")
    name = input_string[:start].strip()
    email = input_string[start + 1 : end].strip()
    return name, email


# Helper function to transform a date string into a timestamp_tz string
def create_date(input_string: str) -> datetime:
    if input_string is None:
        return None
    # Define a dictionary to map month abbreviations to their numerical equivalents
    month_dict = {
        "Jan": "01",
        "Feb": "02",
        "Mar": "03",
        "Apr": "04",
        "May": "05",
        "Jun": "06",
        "Jul": "07",
        "Aug": "08",
        "Sep": "09",
        "Oct": "10",
        "Nov": "11",
        "Dec": "12",
    }

    # Split the input string into its components
    components = input_string.split()
    # Extract relevant information
    day = components[2]
    month = month_dict[components[1]]
    year = components[4]
    time = components[3]
    timezone_offset_minutes = int(components[5])  # Convert the offset to minutes
    timezone_hours = timezone_offset_minutes // 60  # Calculate the hours
    timezone_minutes = timezone_offset_minutes % 60  # Calculate the remaining minutes
    # Create a formatted string for the timestamptz in PostgreSQL format
    timestamp_tz_str = (
        f"{year}-{month}-{day} {time}+{timezone_hours:02}{timezone_minutes:02}"
    )
    return timestamp_tz_str


# Metadata extraction function to extract metadata from a JSON record
def extract_metadata(record: dict, metadata: dict) -> dict:
    record_name, record_email = split_name(record["author"])
    metadata["id"] = create_uuid(record["date"])
    metadata["date"] = create_date(record["date"])
    metadata["author_name"] = record_name
    metadata["author_email"] = record_email
    metadata["commit_hash"] = record["commit"]
    return metadata
```

अगला, आपको [उदाहरण डेटासेट डाउनलोड करें](https://s3.amazonaws.com/assets.timescale.com/ai/ts_git_log.json) और इसे इस नोटबुक के समान निर्देशिका में रखें।

आप निम्नलिखित कमांड का उपयोग कर सकते हैं:

```python
# Download the file using curl and save it as commit_history.csv
# Note: Execute this command in your terminal, in the same directory as the notebook
!curl -O https://s3.amazonaws.com/assets.timescale.com/ai/ts_git_log.json
```

अंत में हम JSON रिकॉर्ड्स को पार्स करने के लिए JSON लोडर को प्रारंभ कर सकते हैं। हम सादगी के लिए खाली रिकॉर्ड भी हटा देंगे।

```python
# Define path to the JSON file relative to this notebook
# Change this to the path to your JSON file
FILE_PATH = "../../../../../ts_git_log.json"

# Load data from JSON file and extract metadata
loader = JSONLoader(
    file_path=FILE_PATH,
    jq_schema=".commit_history[]",
    text_content=False,
    metadata_func=extract_metadata,
)
documents = loader.load()

# Remove documents with None dates
documents = [doc for doc in documents if doc.metadata["date"] is not None]
```

```python
print(documents[0])
```

```output
page_content='{"commit": "44e41c12ab25e36c202f58e068ced262eadc8d16", "author": "Lakshmi Narayanan Sreethar<lakshmi@timescale.com>", "date": "Tue Sep 5 21:03:21 2023 +0530", "change summary": "Fix segfault in set_integer_now_func", "change details": "When an invalid function oid is passed to set_integer_now_func, it finds out that the function oid is invalid but before throwing the error, it calls ReleaseSysCache on an invalid tuple causing a segfault. Fixed that by removing the invalid call to ReleaseSysCache.  Fixes #6037 "}' metadata={'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/ts_git_log.json', 'seq_num': 1, 'id': '8b407680-4c01-11ee-96a6-b82284ddccc6', 'date': '2023-09-5 21:03:21+0850', 'author_name': 'Lakshmi Narayanan Sreethar', 'author_email': 'lakshmi@timescale.com', 'commit_hash': '44e41c12ab25e36c202f58e068ced262eadc8d16'}
```

### दस्तावेज़ और मेटाडेटा को TimescaleVector vectorstore में लोड करें

अब जब हमने अपने दस्तावेज़ तैयार कर लिए हैं, तो चलिए उन्हें प्रोसेस करते हैं और उनके वेक्टर एम्बेडिंग प्रतिनिधित्वों के साथ उन्हें अपने TimescaleVector vectorstore में लोड करते हैं।

चूंकि यह एक डेमो है, हम केवल पहले 500 रिकॉर्ड्स लोड करेंगे। व्यावहारिक रूप से, आप जितने चाहें उतने रिकॉर्ड्स लोड कर सकते हैं।

```python
NUM_RECORDS = 500
documents = documents[:NUM_RECORDS]
```

फिर हम CharacterTextSplitter का उपयोग करेंगे, यदि आवश्यक हो तो एम्बेडिंग को आसान बनाने के लिए दस्तावेज़ों को छोटे टुकड़ों में विभाजित करने के लिए। ध्यान दें कि यह विभाजन प्रक्रिया प्रत्येक दस्तावेज़ के लिए मेटाडेटा को बनाए रखती है।

```python
# Split the documents into chunks for embedding
text_splitter = CharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)
docs = text_splitter.split_documents(documents)
```

अगला हम उस संग्रह से Timescale Vector उदाहरण बनाएंगे जिसे हमने प्री-प्रोसेसिंग पूरा किया था।

पहले, हम एक संग्रह नाम परिभाषित करेंगे, जो हमारे PostgreSQL डेटाबेस में हमारी तालिका का नाम होगा।

हम एक समय डेल्टा भी परिभाषित करेंगे, जिसे हम `time_partition_interval` तर्क में पास करेंगे, जिसका उपयोग डेटा को समय के अनुसार विभाजित करने के लिए अंतराल के रूप में किया जाएगा। प्रत्येक विभाजन निर्दिष्ट समय अवधि के लिए डेटा से बना होगा। सादगी के लिए हम 7 दिनों का उपयोग करेंगे, लेकिन आप अपने उपयोग मामले के लिए जो भी मान समझ में आता है, उसे चुन सकते हैं— उदाहरण के लिए यदि आप हाल ही के वेक्टर को अक्सर क्वेरी करते हैं तो आप 1 दिन की छोटी समय डेल्टा का उपयोग करना चाह सकते हैं, या यदि आप दशकों लंबी समय अवधि पर वेक्टर को क्वेरी करते हैं तो आप 6 महीने या 1 साल की बड़ी समय डेल्टा का उपयोग करना चाह सकते हैं।

अंत में, हम TimescaleVector उदाहरण बनाएंगे। हम `ids` तर्क को हमारे मेटाडेटा के `uuid` फ़ील्ड के रूप में निर्दिष्ट करते हैं जो हमने ऊपर प्री-प्रोसेसिंग चरण में बनाया था। हम ऐसा इसलिए करते हैं क्योंकि हम चाहते हैं कि हमारे uuids का समय भाग अतीत में तारीखों को प्रतिबिंबित करे (यानी जब कमिट किया गया था)। हालांकि, यदि हम चाहते थे कि हमारा दस्तावेज़ वर्तमान तिथि और समय से जुड़ा हो, तो हम id तर्क को हटा सकते हैं और uuid स्वचालित रूप से वर्तमान तिथि और समय के साथ बनाए जाएंगे।

```python
# Define collection name
COLLECTION_NAME = "timescale_commits"
embeddings = OpenAIEmbeddings()

# Create a Timescale Vector instance from the collection of documents
db = TimescaleVector.from_documents(
    embedding=embeddings,
    ids=[doc.metadata["id"] for doc in docs],
    documents=docs,
    collection_name=COLLECTION_NAME,
    service_url=SERVICE_URL,
    time_partition_interval=timedelta(days=7),
)
```

### समय और समानता द्वारा वेक्टरों को क्वेरी करना

अब जब हमने अपने दस्तावेज़ों को TimescaleVector में लोड कर लिया है, तो हम उन्हें समय और समानता द्वारा क्वेरी कर सकते हैं।

TimescaleVector समय-आधारित फ़िल्टरिंग के साथ समानता खोज करके वेक्टरों को क्वेरी करने के लिए कई विधियाँ प्रदान करता है।

चलो नीचे प्रत्येक विधि को देखें:

```python
# Time filter variables
start_dt = datetime(2023, 8, 1, 22, 10, 35)  # Start date = 1 August 2023, 22:10:35
end_dt = datetime(2023, 8, 30, 22, 10, 35)  # End date = 30 August 2023, 22:10:35
td = timedelta(days=7)  # Time delta = 7 days

query = "What's new with TimescaleDB functions?"
```

विधि 1: एक निर्दिष्ट प्रारंभ तिथि और समाप्ति तिथि के भीतर फ़िल्टर करें।

```python
# Method 1: Query for vectors between start_date and end_date
docs_with_score = db.similarity_search_with_score(
    query, start_date=start_dt, end_date=end_dt
)

for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print("Date: ", doc.metadata["date"])
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.17488396167755127
Date:  2023-08-29 18:13:24+0320
{"commit": " e4facda540286b0affba47ccc63959fefe2a7b26", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Aug 29 18:13:24 2023 +0200", "change summary": "Add compatibility layer for _timescaledb_internal functions", "change details": "With timescaledb 2.12 all the functions present in _timescaledb_internal were moved into the _timescaledb_functions schema to improve schema security. This patch adds a compatibility layer so external callers of these internal functions will not break and allow for more flexibility when migrating. "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18102192878723145
Date:  2023-08-20 22:47:10+0320
{"commit": " 0a66bdb8d36a1879246bd652e4c28500c4b951ab", "author": "Sven Klemm<sven@timescale.com>", "date": "Sun Aug 20 22:47:10 2023 +0200", "change summary": "Move functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for the following functions:  - to_unix_microseconds(timestamptz) - to_timestamp(bigint) - to_timestamp_without_timezone(bigint) - to_date(bigint) - to_interval(bigint) - interval_to_usec(interval) - time_to_internal(anyelement) - subtract_integer_from_now(regclass, bigint) "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18150119891755445
Date:  2023-08-22 12:01:19+0320
{"commit": " cf04496e4b4237440274eb25e4e02472fc4e06fc", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Aug 22 12:01:19 2023 +0200", "change summary": "Move utility functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for the following functions:  - generate_uuid() - get_git_commit() - get_os_info() - tsl_loaded() "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18422493887617963
Date:  2023-08-9 15:26:03+0500
{"commit": " 44eab9cf9bef34274c88efd37a750eaa74cd8044", "author": "Konstantina Skovola<konstantina@timescale.com>", "date": "Wed Aug 9 15:26:03 2023 +0300", "change summary": "Release 2.11.2", "change details": "This release contains bug fixes since the 2.11.1 release. We recommend that you upgrade at the next available opportunity.  **Features** * #5923 Feature flags for TimescaleDB features  **Bugfixes** * #5680 Fix DISTINCT query with JOIN on multiple segmentby columns * #5774 Fixed two bugs in decompression sorted merge code * #5786 Ensure pg_config --cppflags are passed * #5906 Fix quoting owners in sql scripts. * #5912 Fix crash in 1-step integer policy creation  **Thanks** * @mrksngl for submitting a PR to fix extension upgrade scripts * @ericdevries for reporting an issue with DISTINCT queries using segmentby columns of compressed hypertable "}
--------------------------------------------------------------------------------
```

ध्यान दें कि क्वेरी केवल निर्दिष्ट तिथि सीमा के भीतर परिणाम लौटाती है।

विधि 2: एक निर्दिष्ट प्रारंभ तिथि और एक समय अंतराल के भीतर फ़िल्टर करें।

```python
# Method 2: Query for vectors between start_dt and a time delta td later
# Most relevant vectors between 1 August and 7 days later
docs_with_score = db.similarity_search_with_score(
    query, start_date=start_dt, time_delta=td
)

for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print("Date: ", doc.metadata["date"])
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.18458807468414307
Date:  2023-08-3 14:30:23+0500
{"commit": " 7aeed663b9c0f337b530fd6cad47704a51a9b2ec", "author": "Dmitry Simonenko<dmitry@timescale.com>", "date": "Thu Aug 3 14:30:23 2023 +0300", "change summary": "Feature flags for TimescaleDB features", "change details": "This PR adds several GUCs which allow to enable/disable major timescaledb features:  - enable_hypertable_create - enable_hypertable_compression - enable_cagg_create - enable_policy_create "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.20492422580718994
Date:  2023-08-7 18:31:40+0320
{"commit": " 07762ea4cedefc88497f0d1f8712d1515cdc5b6e", "author": "Sven Klemm<sven@timescale.com>", "date": "Mon Aug 7 18:31:40 2023 +0200", "change summary": "Test timescaledb debian 12 packages in CI", "change details": ""}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.21106326580047607
Date:  2023-08-3 14:36:39+0500
{"commit": " 2863daf3df83c63ee36c0cf7b66c522da5b4e127", "author": "Dmitry Simonenko<dmitry@timescale.com>", "date": "Thu Aug 3 14:36:39 2023 +0300", "change summary": "Support CREATE INDEX ONLY ON main table", "change details": "This PR adds support for CREATE INDEX ONLY ON clause which allows to create index only on the main table excluding chunks.  Fix #5908 "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.21698051691055298
Date:  2023-08-2 20:24:14+0140
{"commit": " 3af0d282ea71d9a8f27159a6171e9516e62ec9cb", "author": "Lakshmi Narayanan Sreethar<lakshmi@timescale.com>", "date": "Wed Aug 2 20:24:14 2023 +0100", "change summary": "PG16: ExecInsertIndexTuples requires additional parameter", "change details": "PG16 adds a new boolean parameter to the ExecInsertIndexTuples function to denote if the index is a BRIN index, which is then used to determine if the index update can be skipped. The fix also removes the INDEX_ATTR_BITMAP_ALL enum value.  Adapt these changes by updating the compat function to accomodate the new parameter added to the ExecInsertIndexTuples function and using an alternative for the removed INDEX_ATTR_BITMAP_ALL enum value.  postgres/postgres@19d8e23 "}
--------------------------------------------------------------------------------
```

एक बार फिर, ध्यान दें कि हमें पिछले क्वेरी से अलग निर्दिष्ट समय फ़िल्टर के भीतर परिणाम मिलते हैं।

विधि 3: एक निर्दिष्ट समाप्ति तिथि और एक समय अंतराल से पहले के भीतर फ़िल्टर करें।

```python
# Method 3: Query for vectors between end_dt and a time delta td earlier
# Most relevant vectors between 30 August and 7 days earlier
docs_with_score = db.similarity_search_with_score(query, end_date=end_dt, time_delta=td)

for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print("Date: ", doc.metadata["date"])
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.17488396167755127
Date:  2023-08-29 18:13:24+0320
{"commit": " e4facda540286b0affba47ccc63959fefe2a7b26", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Aug 29 18:13:24 2023 +0200", "change summary": "Add compatibility layer for _timescaledb_internal functions", "change details": "With timescaledb 2.12 all the functions present in _timescaledb_internal were moved into the _timescaledb_functions schema to improve schema security. This patch adds a compatibility layer so external callers of these internal functions will not break and allow for more flexibility when migrating. "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18496227264404297
Date:  2023-08-29 10:49:47+0320
{"commit": " a9751ccd5eb030026d7b975d22753f5964972389", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Aug 29 10:49:47 2023 +0200", "change summary": "Move partitioning functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for the following functions:  - get_partition_for_key(val anyelement) - get_partition_hash(val anyelement) "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.1871250867843628
Date:  2023-08-28 23:26:23+0320
{"commit": " b2a91494a11d8b82849b6f11f9ea6dc26ef8a8cb", "author": "Sven Klemm<sven@timescale.com>", "date": "Mon Aug 28 23:26:23 2023 +0200", "change summary": "Move ddl_internal functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for the following functions:  - chunk_constraint_add_table_constraint(_timescaledb_catalog.chunk_constraint) - chunk_drop_replica(regclass,name) - chunk_index_clone(oid) - chunk_index_replace(oid,oid) - create_chunk_replica_table(regclass,name) - drop_stale_chunks(name,integer[]) - health() - hypertable_constraint_add_table_fk_constraint(name,name,name,integer) - process_ddl_event() - wait_subscription_sync(name,name,integer,numeric) "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18867712088363497
Date:  2023-08-27 13:20:04+0320
{"commit": " e02b1f348eb4c48def00b7d5227238b4d9d41a4a", "author": "Sven Klemm<sven@timescale.com>", "date": "Sun Aug 27 13:20:04 2023 +0200", "change summary": "Simplify schema move update script", "change details": "Use dynamic sql to create the ALTER FUNCTION statements for those functions that may not exist in previous versions. "}
--------------------------------------------------------------------------------
```

विधि 4: हम केवल अपनी क्वेरी में एक प्रारंभ तिथि निर्दिष्ट करके एक निर्दिष्ट तिथि के बाद के सभी वेक्टरों के लिए भी फ़िल्टर कर सकते हैं।

विधि 5: इसी तरह, हम केवल अपनी क्वेरी में एक समाप्ति तिथि निर्दिष्ट करके एक निर्दिष्ट तिथि से पहले के सभी वेक्टरों के लिए फ़िल्टर कर सकते हैं।

```python
# Method 4: Query all vectors after start_date
docs_with_score = db.similarity_search_with_score(query, start_date=start_dt)

for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print("Date: ", doc.metadata["date"])
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.17488396167755127
Date:  2023-08-29 18:13:24+0320
{"commit": " e4facda540286b0affba47ccc63959fefe2a7b26", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Aug 29 18:13:24 2023 +0200", "change summary": "Add compatibility layer for _timescaledb_internal functions", "change details": "With timescaledb 2.12 all the functions present in _timescaledb_internal were moved into the _timescaledb_functions schema to improve schema security. This patch adds a compatibility layer so external callers of these internal functions will not break and allow for more flexibility when migrating. "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18102192878723145
Date:  2023-08-20 22:47:10+0320
{"commit": " 0a66bdb8d36a1879246bd652e4c28500c4b951ab", "author": "Sven Klemm<sven@timescale.com>", "date": "Sun Aug 20 22:47:10 2023 +0200", "change summary": "Move functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for the following functions:  - to_unix_microseconds(timestamptz) - to_timestamp(bigint) - to_timestamp_without_timezone(bigint) - to_date(bigint) - to_interval(bigint) - interval_to_usec(interval) - time_to_internal(anyelement) - subtract_integer_from_now(regclass, bigint) "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18150119891755445
Date:  2023-08-22 12:01:19+0320
{"commit": " cf04496e4b4237440274eb25e4e02472fc4e06fc", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Aug 22 12:01:19 2023 +0200", "change summary": "Move utility functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for the following functions:  - generate_uuid() - get_git_commit() - get_os_info() - tsl_loaded() "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18422493887617963
Date:  2023-08-9 15:26:03+0500
{"commit": " 44eab9cf9bef34274c88efd37a750eaa74cd8044", "author": "Konstantina Skovola<konstantina@timescale.com>", "date": "Wed Aug 9 15:26:03 2023 +0300", "change summary": "Release 2.11.2", "change details": "This release contains bug fixes since the 2.11.1 release. We recommend that you upgrade at the next available opportunity.  **Features** * #5923 Feature flags for TimescaleDB features  **Bugfixes** * #5680 Fix DISTINCT query with JOIN on multiple segmentby columns * #5774 Fixed two bugs in decompression sorted merge code * #5786 Ensure pg_config --cppflags are passed * #5906 Fix quoting owners in sql scripts. * #5912 Fix crash in 1-step integer policy creation  **Thanks** * @mrksngl for submitting a PR to fix extension upgrade scripts * @ericdevries for reporting an issue with DISTINCT queries using segmentby columns of compressed hypertable "}
--------------------------------------------------------------------------------
```

```python
# Method 5: Query all vectors before end_date
docs_with_score = db.similarity_search_with_score(query, end_date=end_dt)

for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print("Date: ", doc.metadata["date"])
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.16723191738128662
Date:  2023-04-11 22:01:14+0320
{"commit": " 0595ff0888f2ffb8d313acb0bda9642578a9ade3", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Apr 11 22:01:14 2023 +0200", "change summary": "Move type support functions into _timescaledb_functions schema", "change details": ""}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.1706540584564209
Date:  2023-04-6 13:00:00+0320
{"commit": " 04f43335dea11e9c467ee558ad8edfc00c1a45ed", "author": "Sven Klemm<sven@timescale.com>", "date": "Thu Apr 6 13:00:00 2023 +0200", "change summary": "Move aggregate support function into _timescaledb_functions", "change details": "This patch moves the support functions for histogram, first and last into the _timescaledb_functions schema. Since we alter the schema of the existing functions in upgrade scripts and do not change the aggregates this should work completely transparently for any user objects using those aggregates. "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.17462033033370972
Date:  2023-03-31 08:22:57+0320
{"commit": " feef9206facc5c5f506661de4a81d96ef059b095", "author": "Sven Klemm<sven@timescale.com>", "date": "Fri Mar 31 08:22:57 2023 +0200", "change summary": "Add _timescaledb_functions schema", "change details": "Currently internal user objects like chunks and our functions live in the same schema making locking down that schema hard. This patch adds a new schema _timescaledb_functions that is meant to be the schema used for timescaledb internal functions to allow separation of code and chunks or other user objects. "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.17488396167755127
Date:  2023-08-29 18:13:24+0320
{"commit": " e4facda540286b0affba47ccc63959fefe2a7b26", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Aug 29 18:13:24 2023 +0200", "change summary": "Add compatibility layer for _timescaledb_internal functions", "change details": "With timescaledb 2.12 all the functions present in _timescaledb_internal were moved into the _timescaledb_functions schema to improve schema security. This patch adds a compatibility layer so external callers of these internal functions will not break and allow for more flexibility when migrating. "}
--------------------------------------------------------------------------------
```

मुख्य निष्कर्ष यह है कि ऊपर दिए गए प्रत्येक परिणाम में, केवल निर्दिष्ट समय सीमा के भीतर के वेक्टर लौटाए जाते हैं। ये क्वेरी बहुत कुशल हैं क्योंकि उन्हें केवल संबंधित विभाजनों की खोज करने की आवश्यकता होती है।

हम इस कार्यक्षमता का उपयोग प्रश्न उत्तर देने के लिए भी कर सकते हैं, जहां हम किसी प्रश्न का उत्तर देने के लिए संदर्भ के रूप में उपयोग करने के लिए निर्दिष्ट समय सीमा के भीतर सबसे प्रासंगिक वेक्टर खोजना चाहते हैं। चलिए नीचे एक उदाहरण देखते हैं, Timescale Vector का उपयोग करके एक पुनः प्राप्तकर्ता के रूप में:

```python
# Set timescale vector as a retriever and specify start and end dates via kwargs
retriever = db.as_retriever(search_kwargs={"start_date": start_dt, "end_date": end_dt})
```

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0.1, model="gpt-3.5-turbo-16k")

from langchain.chains import RetrievalQA

qa_stuff = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    verbose=True,
)

query = (
    "What's new with the timescaledb functions? Tell me when these changes were made."
)
response = qa_stuff.run(query)
print(response)
```

```output


[1m> Entering new RetrievalQA chain...[0m

[1m> Finished chain.[0m
The following changes were made to the timescaledb functions:

1. "Add compatibility layer for _timescaledb_internal functions" - This change was made on Tue Aug 29 18:13:24 2023 +0200.
2. "Move functions to _timescaledb_functions schema" - This change was made on Sun Aug 20 22:47:10 2023 +0200.
3. "Move utility functions to _timescaledb_functions schema" - This change was made on Tue Aug 22 12:01:19 2023 +0200.
4. "Move partitioning functions to _timescaledb_functions schema" - This change was made on Tue Aug 29 10:49:47 2023 +0200.
```

ध्यान दें कि संदर्भ जो LLM उत्तर देने के लिए उपयोग करता है, वे केवल निर्दिष्ट तिथि सीमा के भीतर पुनः प्राप्त दस्तावेज़ों से हैं।

यह दिखाता है कि आप अपनी क्वेरी के लिए प्रासंगिक समय सीमाओं के भीतर दस्तावेज़ों को पुनः प्राप्त करके Timescale Vector का उपयोग पुनः प्राप्ति संवर्धित पीढ़ी को बढ़ाने के लिए कैसे कर सकते हैं।

## 3. क्वेरी को गति देने के लिए ANN खोज सूचकांक का उपयोग करना

आप एम्बेडिंग कॉलम पर एक सूचकांक बनाकर समानता क्वेरी को गति दे सकते हैं। आपको यह केवल तभी करना चाहिए जब आपने अपने डेटा का एक बड़ा हिस्सा ग्रहण कर लिया हो।

Timescale Vector निम्नलिखित सूचकांकों का समर्थन करता है:
- timescale_vector index (tsv): तेज़ समानता खोज के लिए एक disk-ann प्रेरित ग्राफ़ सूचकांक (डिफ़ॉल्ट)।
- pgvector का HNSW सूचकांक: तेज़ समानता खोज के लिए एक पदानुक्रमित नेविगेबल स्मॉल वर्ल्ड ग्राफ़ सूचकांक।
- pgvector का IVFFLAT सूचकांक: तेज़ समानता खोज के लिए एक उलटा फ़ाइल सूचकांक।

महत्वपूर्ण नोट: PostgreSQL में, प्रत्येक तालिका में किसी विशेष कॉलम पर केवल एक सूचकांक हो सकता है। इसलिए यदि आप विभिन्न सूचकांक प्रकारों के प्रदर्शन का परीक्षण करना चाहते हैं, तो आप या तो (1) विभिन्न सूचकांकों के साथ कई तालिकाएँ बनाकर, (2) उसी तालिका में कई वेक्टर कॉलम बनाकर और प्रत्येक कॉलम पर विभिन्न सूचकांक बनाकर, या (3) उसी कॉलम पर सूचकांक को हटाकर और फिर से बनाकर और परिणामों की तुलना करके ऐसा कर सकते हैं।

```python
# Initialize an existing TimescaleVector store
COLLECTION_NAME = "timescale_commits"
embeddings = OpenAIEmbeddings()
db = TimescaleVector(
    collection_name=COLLECTION_NAME,
    service_url=SERVICE_URL,
    embedding_function=embeddings,
)
```

डिफ़ॉल्ट पैरामीटर का उपयोग करके, बिना अतिरिक्त तर्कों के `create_index()` फ़ंक्शन का उपयोग करने से डिफ़ॉल्ट रूप से एक timescale_vector_index बन जाएगा।

```python
# create an index
# by default this will create a Timescale Vector (DiskANN) index
db.create_index()
```

आप सूचकांक के लिए पैरामीटर भी निर्दिष्ट कर सकते हैं। प्रदर्शन पर उनके प्रभाव के बारे में पूरी चर्चा के लिए Timescale Vector दस्तावेज़ देखें।

नोट: आपको पैरामीटर निर्दिष्ट करने की आवश्यकता नहीं है क्योंकि हमने स्मार्ट डिफ़ॉल्ट सेट किए हैं। लेकिन यदि आप अपने विशिष्ट डेटासेट के लिए अधिक प्रदर्शन प्राप्त करने के लिए प्रयोग करना चाहते हैं तो आप हमेशा अपने पैरामीटर निर्दिष्ट कर सकते हैं।

```python
# drop the old index
db.drop_index()

# create an index
# Note: You don't need to specify m and ef_construction parameters as we set smart defaults.
db.create_index(index_type="tsv", max_alpha=1.0, num_neighbors=50)
```

Timescale Vector HNSW ANN अनुक्रमण एल्गोरिदम का समर्थन करता है, साथ ही ivfflat ANN अनुक्रमण एल्गोरिदम का भी। बस `index_type` तर्क में निर्दिष्ट करें कि आप कौन सा सूचकांक बनाना चाहते हैं, और सूचकांक के लिए पैरामीटर वैकल्पिक रूप से निर्दिष्ट करें।

```python
# drop the old index
db.drop_index()

# Create an HNSW index
# Note: You don't need to specify m and ef_construction parameters as we set smart defaults.
db.create_index(index_type="hnsw", m=16, ef_construction=64)
```

```python
# drop the old index
db.drop_index()

# Create an IVFFLAT index
# Note: You don't need to specify num_lists and num_records parameters as we set smart defaults.
db.create_index(index_type="ivfflat", num_lists=20, num_records=1000)
```

सामान्यतः, हम डिफ़ॉल्ट timescale वेक्टर सूचकांक, या HNSW सूचकांक का उपयोग करने की सिफारिश करते हैं।

```python
# drop the old index
db.drop_index()
# Create a new timescale vector index
db.create_index()
```

## 4. Timescale Vector के साथ आत्म-क्वेरी पुनः प्राप्तकर्ता

Timescale Vector आत्म-क्वेरी पुनः प्राप्तकर्ता कार्यक्षमता का भी समर्थन करता है, जो इसे स्वयं क्वेरी करने की क्षमता देता है। एक प्राकृतिक भाषा क्वेरी के साथ एक क्वेरी कथन और फ़िल्टर (एकल या संयोजित) दिए जाने पर, पुनः प्राप्तकर्ता एक SQL क्वेरी लिखने के लिए एक क्वेरी निर्माण LLM श्रृंखला का उपयोग करता है और फिर इसे Timescale Vector वेक्टरस्टोर में अंतर्निहित PostgreSQL डेटाबेस पर लागू करता है।

आत्म-क्वेरी पर अधिक जानकारी के लिए, [दस्तावेज़ देखें](/docs/modules/data_connection/retrievers/self_query/)।

Timescale Vector के साथ आत्म-क्वेरी को स्पष्ट करने के लिए, हम भाग 3 से वही gitlog डेटासेट का उपयोग करेंगे।

```python
COLLECTION_NAME = "timescale_commits"
vectorstore = TimescaleVector(
    embedding_function=OpenAIEmbeddings(),
    collection_name=COLLECTION_NAME,
    service_url=SERVICE_URL,
)
```

इसके बाद हम अपने आत्म-क्वेरी पुनः प्राप्तकर्ता को बनाएंगे। ऐसा करने के लिए हमें अपनी दस्तावेज़ों का समर्थन करने वाले मेटाडेटा फ़ील्ड के बारे में कुछ जानकारी प्रदान करनी होगी और दस्तावेज़ सामग्रियों का एक संक्षिप्त विवरण देना होगा।

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

# Give LLM info about the metadata fields
metadata_field_info = [
    AttributeInfo(
        name="id",
        description="A UUID v1 generated from the date of the commit",
        type="uuid",
    ),
    AttributeInfo(
        name="date",
        description="The date of the commit in timestamptz format",
        type="timestamptz",
    ),
    AttributeInfo(
        name="author_name",
        description="The name of the author of the commit",
        type="string",
    ),
    AttributeInfo(
        name="author_email",
        description="The email address of the author of the commit",
        type="string",
    ),
]
document_content_description = "The git log commit summary containing the commit hash, author, date of commit, change summary and change details"

# Instantiate the self-query retriever from an LLM
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```

अब चलिए अपने gitlog डेटासेट पर आत्म-क्वेरी पुनः प्राप्तकर्ता का परीक्षण करते हैं।

नीचे दी गई क्वेरी चलाएँ और ध्यान दें कि आप कैसे एक क्वेरी, फ़िल्टर के साथ एक क्वेरी, और संयोजित फ़िल्टर (AND, OR के साथ फ़िल्टर) के साथ एक क्वेरी को प्राकृतिक भाषा में निर्दिष्ट कर सकते हैं और आत्म-क्वेरी पुनः प्राप्तकर्ता उस क्वेरी को SQL में अनुवाद करेगा और Timescale Vector PostgreSQL वेक्टरस्टोर पर खोज करेगा।

यह आत्म-क्वेरी पुनः प्राप्तकर्ता की शक्ति को दर्शाता है। आप इसका उपयोग अपने या अपने उपयोगकर्ताओं को सीधे कोई SQL लिखने के बिना अपने वेक्टरस्टोर पर जटिल खोज करने के लिए कर सकते हैं!

```python
# This example specifies a relevant query
retriever.invoke("What are improvements made to continuous aggregates?")
```

```output
/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/libs/langchain/langchain/chains/llm.py:275: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(

query='improvements to continuous aggregates' filter=None limit=None
```

```output
[Document(page_content='{"commit": " 35c91204987ccb0161d745af1a39b7eb91bc65a5", "author": "Fabr\\u00edzio de Royes Mello<fabriziomello@gmail.com>", "date": "Thu Nov 24 13:19:36 2022 -0300", "change summary": "Add Hierarchical Continuous Aggregates validations", "change details": "Commit 3749953e introduce Hierarchical Continuous Aggregates (aka Continuous Aggregate on top of another Continuous Aggregate) but it lacks of some basic validations.  Validations added during the creation of a Hierarchical Continuous Aggregate:  * Forbid create a continuous aggregate with fixed-width bucket on top of   a continuous aggregate with variable-width bucket.  * Forbid incompatible bucket widths:   - should not be equal;   - bucket width of the new continuous aggregate should be greater than     the source continuous aggregate;   - bucket width of the new continuous aggregate should be multiple of     the source continuous aggregate. "}', metadata={'id': 'c98d1c00-6c13-11ed-9bbe-23925ce74d13', 'date': '2022-11-24 13:19:36+-500', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 446, 'author_name': 'Fabrízio de Royes Mello', 'commit_hash': ' 35c91204987ccb0161d745af1a39b7eb91bc65a5', 'author_email': 'fabriziomello@gmail.com'}),
 Document(page_content='{"commit": " 3749953e9704e45df8f621607989ada0714ce28d", "author": "Fabr\\u00edzio de Royes Mello<fabriziomello@gmail.com>", "date": "Wed Oct 5 18:45:40 2022 -0300", "change summary": "Hierarchical Continuous Aggregates", "change details": "Enable users create Hierarchical Continuous Aggregates (aka Continuous Aggregates on top of another Continuous Aggregates).  With this PR users can create levels of aggregation granularity in Continuous Aggregates making the refresh process even faster.  A problem with this feature can be in upper levels we can end up with the \\"average of averages\\". But to get the \\"real average\\" we can rely on \\"stats_aggs\\" TimescaleDB Toolkit function that calculate and store the partials that can be finalized with other toolkit functions like \\"average\\" and \\"sum\\".  Closes #1400 "}', metadata={'id': '0df31a00-44f7-11ed-9794-ebcc1227340f', 'date': '2022-10-5 18:45:40+-500', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 470, 'author_name': 'Fabrízio de Royes Mello', 'commit_hash': ' 3749953e9704e45df8f621607989ada0714ce28d', 'author_email': 'fabriziomello@gmail.com'}),
 Document(page_content='{"commit": " a6ff7ba6cc15b280a275e5acd315741ec9c86acc", "author": "Mats Kindahl<mats@timescale.com>", "date": "Tue Feb 28 12:04:17 2023 +0100", "change summary": "Rename columns in old-style continuous aggregates", "change details": "For continuous aggregates with the old-style partial aggregates renaming columns that are not in the group-by clause will generate an error when upgrading to a later version. The reason is that it is implicitly assumed that the name of the column is the same as for the direct view. This holds true for new-style continous aggregates, but is not always true for old-style continuous aggregates. In particular, columns that are not part of the `GROUP BY` clause can have an internally generated name.  This commit fixes that by extracting the name of the column from the partial view and use that when renaming the partial view column and the materialized table column. "}', metadata={'id': 'a49ace80-b757-11ed-8138-2390fd44ffd9', 'date': '2023-02-28 12:04:17+0140', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 294, 'author_name': 'Mats Kindahl', 'commit_hash': ' a6ff7ba6cc15b280a275e5acd315741ec9c86acc', 'author_email': 'mats@timescale.com'}),
 Document(page_content='{"commit": " 5bba74a2ec083728f8e93e09d03d102568fd72b5", "author": "Fabr\\u00edzio de Royes Mello<fabriziomello@gmail.com>", "date": "Mon Aug 7 19:49:47 2023 -0300", "change summary": "Relax strong table lock when refreshing a CAGG", "change details": "When refreshing a Continuous Aggregate we take a table lock on _timescaledb_catalog.continuous_aggs_invalidation_threshold when processing the invalidation logs (the first transaction of the refresh Continuous Aggregate procedure). It means that even two different Continuous Aggregates over two different hypertables will wait each other in the first phase of the refreshing procedure. Also it lead to problems when a pg_dump is running because it take an AccessShareLock on tables so Continuous Aggregate refresh execution will wait until the pg_dump finish.  Improved it by relaxing the strong table-level lock to a row-level lock so now the Continuous Aggregate refresh procedure can be executed in multiple sessions with less locks.  Fix #3554 "}', metadata={'id': 'b5583780-3574-11ee-a5ba-2e305874a58f', 'date': '2023-08-7 19:49:47+-500', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 27, 'author_name': 'Fabrízio de Royes Mello', 'commit_hash': ' 5bba74a2ec083728f8e93e09d03d102568fd72b5', 'author_email': 'fabriziomello@gmail.com'})]
```

```python
# This example specifies a filter
retriever.invoke("What commits did Sven Klemm add?")
```

```output
query=' ' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='author_name', value='Sven Klemm') limit=None
```

```output
[Document(page_content='{"commit": " e2e7ae304521b74ac6b3f157a207da047d44ab06", "author": "Sven Klemm<sven@timescale.com>", "date": "Fri Mar 3 11:22:06 2023 +0100", "change summary": "Don\'t run sanitizer test on individual PRs", "change details": "Sanitizer tests take a long time to run so we don\'t want to run them on individual PRs but instead run them nightly and on commits to master. "}', metadata={'id': '3f401b00-b9ad-11ed-b5ea-a3fd40b9ac16', 'date': '2023-03-3 11:22:06+0140', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 295, 'author_name': 'Sven Klemm', 'commit_hash': ' e2e7ae304521b74ac6b3f157a207da047d44ab06', 'author_email': 'sven@timescale.com'}),
 Document(page_content='{"commit": " d8f19e57a04d17593df5f2c694eae8775faddbc7", "author": "Sven Klemm<sven@timescale.com>", "date": "Wed Feb 1 08:34:20 2023 +0100", "change summary": "Bump version of setup-wsl github action", "change details": "The currently used version pulls in Node.js 12 which is deprecated on github.  https://github.blog/changelog/2022-09-22-github-actions-all-actions-will-begin-running-on-node16-instead-of-node12/ "}', metadata={'id': 'd70de600-a202-11ed-85d6-30b6df240f49', 'date': '2023-02-1 08:34:20+0140', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 350, 'author_name': 'Sven Klemm', 'commit_hash': ' d8f19e57a04d17593df5f2c694eae8775faddbc7', 'author_email': 'sven@timescale.com'}),
 Document(page_content='{"commit": " 83b13cf6f73a74656dde9cc6ec6cf76740cddd3c", "author": "Sven Klemm<sven@timescale.com>", "date": "Fri Nov 25 08:27:45 2022 +0100", "change summary": "Use packaged postgres for sqlsmith and coverity CI", "change details": "The sqlsmith and coverity workflows used the cache postgres build but could not produce a build by themselves and therefore relied on other workflows to produce the cached binaries. This patch changes those workflows to use normal postgres packages instead of custom built postgres to remove that dependency. "}', metadata={'id': 'a786ae80-6c92-11ed-bd6c-a57bd3348b97', 'date': '2022-11-25 08:27:45+0140', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 447, 'author_name': 'Sven Klemm', 'commit_hash': ' 83b13cf6f73a74656dde9cc6ec6cf76740cddd3c', 'author_email': 'sven@timescale.com'}),
 Document(page_content='{"commit": " b1314e63f2ff6151ab5becfb105afa3682286a4d", "author": "Sven Klemm<sven@timescale.com>", "date": "Thu Dec 22 12:03:35 2022 +0100", "change summary": "Fix RPM package test for PG15 on centos 7", "change details": "Installing PG15 on Centos 7 requires the EPEL repository to satisfy the dependencies. "}', metadata={'id': '477b1d80-81e8-11ed-9c8c-9b5abbd67c98', 'date': '2022-12-22 12:03:35+0140', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 408, 'author_name': 'Sven Klemm', 'commit_hash': ' b1314e63f2ff6151ab5becfb105afa3682286a4d', 'author_email': 'sven@timescale.com'})]
```

```python
# This example specifies a query and filter
retriever.invoke("What commits about timescaledb_functions did Sven Klemm add?")
```

```output
query='timescaledb_functions' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='author_name', value='Sven Klemm') limit=None
```

```output
[Document(page_content='{"commit": " 04f43335dea11e9c467ee558ad8edfc00c1a45ed", "author": "Sven Klemm<sven@timescale.com>", "date": "Thu Apr 6 13:00:00 2023 +0200", "change summary": "Move aggregate support function into _timescaledb_functions", "change details": "This patch moves the support functions for histogram, first and last into the _timescaledb_functions schema. Since we alter the schema of the existing functions in upgrade scripts and do not change the aggregates this should work completely transparently for any user objects using those aggregates. "}', metadata={'id': '2cb47800-d46a-11ed-8f0e-2b624245c561', 'date': '2023-04-6 13:00:00+0320', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 233, 'author_name': 'Sven Klemm', 'commit_hash': ' 04f43335dea11e9c467ee558ad8edfc00c1a45ed', 'author_email': 'sven@timescale.com'}),
 Document(page_content='{"commit": " feef9206facc5c5f506661de4a81d96ef059b095", "author": "Sven Klemm<sven@timescale.com>", "date": "Fri Mar 31 08:22:57 2023 +0200", "change summary": "Add _timescaledb_functions schema", "change details": "Currently internal user objects like chunks and our functions live in the same schema making locking down that schema hard. This patch adds a new schema _timescaledb_functions that is meant to be the schema used for timescaledb internal functions to allow separation of code and chunks or other user objects. "}', metadata={'id': '7a257680-cf8c-11ed-848c-a515e8687479', 'date': '2023-03-31 08:22:57+0320', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 239, 'author_name': 'Sven Klemm', 'commit_hash': ' feef9206facc5c5f506661de4a81d96ef059b095', 'author_email': 'sven@timescale.com'}),
 Document(page_content='{"commit": " 0a66bdb8d36a1879246bd652e4c28500c4b951ab", "author": "Sven Klemm<sven@timescale.com>", "date": "Sun Aug 20 22:47:10 2023 +0200", "change summary": "Move functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for the following functions:  - to_unix_microseconds(timestamptz) - to_timestamp(bigint) - to_timestamp_without_timezone(bigint) - to_date(bigint) - to_interval(bigint) - interval_to_usec(interval) - time_to_internal(anyelement) - subtract_integer_from_now(regclass, bigint) "}', metadata={'id': 'bb99db00-3f9a-11ee-a8dc-0b9c1a5a37c4', 'date': '2023-08-20 22:47:10+0320', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 41, 'author_name': 'Sven Klemm', 'commit_hash': ' 0a66bdb8d36a1879246bd652e4c28500c4b951ab', 'author_email': 'sven@timescale.com'}),
 Document(page_content='{"commit": " 56ea8b4de93cefc38e002202d8ac96947dcbaa77", "author": "Sven Klemm<sven@timescale.com>", "date": "Thu Apr 13 13:16:14 2023 +0200", "change summary": "Move trigger functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for our trigger functions. "}', metadata={'id': '9a255300-d9ec-11ed-988f-7086c8ca463a', 'date': '2023-04-13 13:16:14+0320', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 44, 'author_name': 'Sven Klemm', 'commit_hash': ' 56ea8b4de93cefc38e002202d8ac96947dcbaa77', 'author_email': 'sven@timescale.com'})]
```

```python
# This example specifies a time-based filter
retriever.invoke("What commits were added in July 2023?")
```

```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='date', value='2023-07-01T00:00:00Z'), Comparison(comparator=<Comparator.LTE: 'lte'>, attribute='date', value='2023-07-31T23:59:59Z')]) limit=None
```

```output
[Document(page_content='{"commit": " 5cf354e2469ee7e43248bed382a4b49fc7ccfecd", "author": "Markus Engel<engel@sero-systems.de>", "date": "Mon Jul 31 11:28:25 2023 +0200", "change summary": "Fix quoting owners in sql scripts.", "change details": "When referring to a role from a string type, it must be properly quoted using pg_catalog.quote_ident before it can be casted to regrole. Fixed this, especially in update scripts. "}', metadata={'id': '99590280-2f84-11ee-915b-5715b2447de4', 'date': '2023-07-31 11:28:25+0320', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 76, 'author_name': 'Markus Engel', 'commit_hash': ' 5cf354e2469ee7e43248bed382a4b49fc7ccfecd', 'author_email': 'engel@sero-systems.de'}),
 Document(page_content='{"commit": " 88aaf23ae37fe7f47252b87325eb570aa417c607", "author": "noctarius aka Christoph Engelbert<me@noctarius.com>", "date": "Wed Jul 12 14:53:40 2023 +0200", "change summary": "Allow Replica Identity (Alter Table) on CAGGs (#5868)", "change details": "This commit is a follow up of #5515, which added support for ALTER TABLE\\r ... REPLICA IDENTITY (FULL | INDEX) on hypertables.\\r \\r This commit allows the execution against materialized hypertables to\\r enable update / delete operations on continuous aggregates when logical\\r replication in enabled for them."}', metadata={'id': '1fcfa200-20b3-11ee-9a18-370561c7cb1a', 'date': '2023-07-12 14:53:40+0320', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 96, 'author_name': 'noctarius aka Christoph Engelbert', 'commit_hash': ' 88aaf23ae37fe7f47252b87325eb570aa417c607', 'author_email': 'me@noctarius.com'}),
 Document(page_content='{"commit": " d5268c36fbd23fa2a93c0371998286e8688247bb", "author": "Alexander Kuzmenkov<36882414+akuzm@users.noreply.github.com>", "date": "Fri Jul 28 13:35:05 2023 +0200", "change summary": "Fix SQLSmith workflow", "change details": "The build was failing because it was picking up the wrong version of Postgres. Remove it. "}', metadata={'id': 'cc0fba80-2d3a-11ee-ae7d-36dc25cad3b8', 'date': '2023-07-28 13:35:05+0320', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 82, 'author_name': 'Alexander Kuzmenkov', 'commit_hash': ' d5268c36fbd23fa2a93c0371998286e8688247bb', 'author_email': '36882414+akuzm@users.noreply.github.com'}),
 Document(page_content='{"commit": " 61c288ec5eb966a9b4d8ed90cd026ffc5e3543c9", "author": "Lakshmi Narayanan Sreethar<lakshmi@timescale.com>", "date": "Tue Jul 25 16:11:35 2023 +0530", "change summary": "Fix broken CI after PG12 removal", "change details": "The commit cdea343cc updated the gh_matrix_builder.py script but failed to import PG_LATEST variable into the script thus breaking the CI. Import that variable to fix the CI tests. "}', metadata={'id': 'd3835980-2ad7-11ee-b98d-c4e3092e076e', 'date': '2023-07-25 16:11:35+0850', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 84, 'author_name': 'Lakshmi Narayanan Sreethar', 'commit_hash': ' 61c288ec5eb966a9b4d8ed90cd026ffc5e3543c9', 'author_email': 'lakshmi@timescale.com'})]
```

```python
# This example specifies a query and a LIMIT value
retriever.invoke("What are two commits about hierarchical continuous aggregates?")
```

```output
query='hierarchical continuous aggregates' filter=None limit=2
```

```output
[Document(page_content='{"commit": " 35c91204987ccb0161d745af1a39b7eb91bc65a5", "author": "Fabr\\u00edzio de Royes Mello<fabriziomello@gmail.com>", "date": "Thu Nov 24 13:19:36 2022 -0300", "change summary": "Add Hierarchical Continuous Aggregates validations", "change details": "Commit 3749953e introduce Hierarchical Continuous Aggregates (aka Continuous Aggregate on top of another Continuous Aggregate) but it lacks of some basic validations.  Validations added during the creation of a Hierarchical Continuous Aggregate:  * Forbid create a continuous aggregate with fixed-width bucket on top of   a continuous aggregate with variable-width bucket.  * Forbid incompatible bucket widths:   - should not be equal;   - bucket width of the new continuous aggregate should be greater than     the source continuous aggregate;   - bucket width of the new continuous aggregate should be multiple of     the source continuous aggregate. "}', metadata={'id': 'c98d1c00-6c13-11ed-9bbe-23925ce74d13', 'date': '2022-11-24 13:19:36+-500', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 446, 'author_name': 'Fabrízio de Royes Mello', 'commit_hash': ' 35c91204987ccb0161d745af1a39b7eb91bc65a5', 'author_email': 'fabriziomello@gmail.com'}),
 Document(page_content='{"commit": " 3749953e9704e45df8f621607989ada0714ce28d", "author": "Fabr\\u00edzio de Royes Mello<fabriziomello@gmail.com>", "date": "Wed Oct 5 18:45:40 2022 -0300", "change summary": "Hierarchical Continuous Aggregates", "change details": "Enable users create Hierarchical Continuous Aggregates (aka Continuous Aggregates on top of another Continuous Aggregates).  With this PR users can create levels of aggregation granularity in Continuous Aggregates making the refresh process even faster.  A problem with this feature can be in upper levels we can end up with the \\"average of averages\\". But to get the \\"real average\\" we can rely on \\"stats_aggs\\" TimescaleDB Toolkit function that calculate and store the partials that can be finalized with other toolkit functions like \\"average\\" and \\"sum\\".  Closes #1400 "}', metadata={'id': '0df31a00-44f7-11ed-9794-ebcc1227340f', 'date': '2022-10-5 18:45:40+-500', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 470, 'author_name': 'Fabrízio de Royes Mello', 'commit_hash': ' 3749953e9704e45df8f621607989ada0714ce28d', 'author_email': 'fabriziomello@gmail.com'})]
```

## 5. मौजूदा TimescaleVector वेक्टरस्टोर के साथ काम करना

ऊपर दिए गए उदाहरणों में, हमने दस्तावेज़ों का एक संग्रह से एक वेक्टरस्टोर बनाया। हालांकि, अक्सर हम एक मौजूदा वेक्टरस्टोर में डेटा डालना और क्वेरी करना चाहते हैं। चलिए देखते हैं कि TimescaleVector वेक्टरस्टोर में मौजूदा दस्तावेज़ों के संग्रह को कैसे प्रारंभ करें, दस्तावेज़ जोड़ें और क्वेरी करें।

एक मौजूदा Timescale Vector स्टोर के साथ काम करने के लिए, हमें जिस तालिका का हम क्वेरी करना चाहते हैं (`COLLECTION_NAME`) और क्लाउड PostgreSQL डेटाबेस का URL (`SERVICE_URL`) जानना होगा।

```python
# Initialize the existing
COLLECTION_NAME = "timescale_commits"
embeddings = OpenAIEmbeddings()
vectorstore = TimescaleVector(
    collection_name=COLLECTION_NAME,
    service_url=SERVICE_URL,
    embedding_function=embeddings,
)
```

तालिका में नया डेटा लोड करने के लिए, हम `add_document()` फ़ंक्शन का उपयोग करते हैं। यह फ़ंक्शन दस्तावेज़ों की एक सूची और मेटाडेटा की एक सूची लेता है। मेटाडेटा में प्रत्येक दस्तावेज़ के लिए एक अद्वितीय आईडी होनी चाहिए।

यदि आप चाहते हैं कि आपके दस्तावेज़ वर्तमान तिथि और समय से जुड़े हों, तो आपको आईडी की एक सूची बनाने की आवश्यकता नहीं है। प्रत्येक दस्तावेज़ के लिए स्वचालित रूप से एक uuid उत्पन्न किया जाएगा।

यदि आप चाहते हैं कि आपके दस्तावेज़ पिछले तिथि और समय से जुड़े हों, तो आप ऊपर अनुभाग 2 में दिखाए गए अनुसार `timecale-vector` पायथन लाइब्रेरी में `uuid_from_time` फ़ंक्शन का उपयोग करके आईडी की एक सूची बना सकते हैं। यह फ़ंक्शन एक datetime ऑब्जेक्ट लेता है और एक uuid लौटाता है जिसमें तिथि और समय uuid में एन्कोडेड होता है।

```python
# Add documents to a collection in TimescaleVector
ids = vectorstore.add_documents([Document(page_content="foo")])
ids
```

```output
['a34f2b8a-53d7-11ee-8cc3-de1e4b2a0118']
```

```python
# Query the vectorstore for similar documents
docs_with_score = vectorstore.similarity_search_with_score("foo")
```

```python
docs_with_score[0]
```

```output
(Document(page_content='foo', metadata={}), 5.006789860928507e-06)
```

```python
docs_with_score[1]
```

```output
(Document(page_content='{"commit": " 00b566dfe478c11134bcf1e7bcf38943e7fafe8f", "author": "Fabr\\u00edzio de Royes Mello<fabriziomello@gmail.com>", "date": "Mon Mar 6 15:51:03 2023 -0300", "change summary": "Remove unused functions", "change details": "We don\'t use `ts_catalog_delete[_only]` functions anywhere and instead we rely on `ts_catalog_delete_tid[_only]` functions so removing it from our code base. "}', metadata={'id': 'd7f5c580-bc4f-11ed-9712-ffa0126a201a', 'date': '2023-03-6 15:51:03+-500', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 285, 'author_name': 'Fabrízio de Royes Mello', 'commit_hash': ' 00b566dfe478c11134bcf1e7bcf38943e7fafe8f', 'author_email': 'fabriziomello@gmail.com'}),
 0.23607668446580354)
```

### डेटा हटाना

आप uuid द्वारा या मेटाडेटा पर एक फ़िल्टर द्वारा डेटा हटा सकते हैं।

```python
ids = vectorstore.add_documents([Document(page_content="Bar")])

vectorstore.delete(ids)
```

```output
True
```

मेटाडेटा का उपयोग करके हटाना विशेष रूप से उपयोगी है यदि आप किसी विशेष स्रोत से समय-समय पर जानकारी अपडेट करना चाहते हैं, या किसी विशेष तिथि या किसी अन्य मेटाडेटा विशेषता को।

```python
vectorstore.add_documents(
    [Document(page_content="Hello World", metadata={"source": "www.example.com/hello"})]
)
vectorstore.add_documents(
    [Document(page_content="Adios", metadata={"source": "www.example.com/adios"})]
)

vectorstore.delete_by_metadata({"source": "www.example.com/adios"})

vectorstore.add_documents(
    [
        Document(
            page_content="Adios, but newer!",
            metadata={"source": "www.example.com/adios"},
        )
    ]
)
```

```output
['c6367004-53d7-11ee-8cc3-de1e4b2a0118']
```

### एक वेक्टरस्टोर को ओवरराइड करना

यदि आपके पास एक मौजूदा संग्रह है, तो आप `from_documents` करके और `pre_delete_collection` = True सेट करके इसे ओवरराइड कर सकते हैं।

```python
db = TimescaleVector.from_documents(
    documents=docs,
    embedding=embeddings,
    collection_name=COLLECTION_NAME,
    service_url=SERVICE_URL,
    pre_delete_collection=True,
)
```

```python
docs_with_score = db.similarity_search_with_score("foo")
```

```python
docs_with_score[0]
```
