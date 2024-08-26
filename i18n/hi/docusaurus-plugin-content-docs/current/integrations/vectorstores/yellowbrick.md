---
translated: true
---

# Yellowbrick

[Yellowbrick](https://yellowbrick.com/yellowbrick-data-warehouse/) एक लचीला, बहुत बड़े पैमाने पर प्रोसेसिंग (MPP) SQL डेटाबेस है जो क्लाउड और ऑन-प्रेमिसेस में चलता है, स्केल, लचीलापन और क्लाउड पोर्टेबिलिटी के लिए kubernetes का उपयोग करता है। Yellowbrick को सबसे बड़े और सबसे जटिल व्यावसायिक-महत्वपूर्ण डेटा वेयरहाउसिंग उपयोग मामलों को संबोधित करने के लिए डिज़ाइन किया गया है। Yellowbrick द्वारा प्रदान की जाने वाली स्केल की दक्षता इसे उच्च प्रदर्शन और स्केलेबल वेक्टर डेटाबेस के रूप में भी उपयोग करने में सक्षम बनाती है ताकि वेक्टर को SQL के साथ संग्रहित और खोजा जा सके।

## Yellowbrick का उपयोग ChatGpt के लिए वेक्टर स्टोर के रूप में

यह ट्यूटोरियल दिखाता है कि कैसे एक सरल चैटबॉट को ChatGpt के साथ बैकअप करके बनाया जा सकता है जो Retrieval Augmented Generation (RAG) का समर्थन करने के लिए Yellowbrick को एक वेक्टर स्टोर के रूप में उपयोग करता है। आपको क्या चाहिए:

1. [Yellowbrick सैंडबॉक्स](https://cloudlabs.yellowbrick.com/) पर एक खाता
2. [OpenAI](https://platform.openai.com/) से एक API कुंजी

ट्यूटोरियल को पांच भागों में विभाजित किया गया है। पहले हम langchain का उपयोग करके एक आधारभूत चैटबॉट बनाएंगे जो वेक्टर स्टोर के बिना ChatGpt के साथ बातचीत करेगा। दूसरा, हम Yellowbrick में एक embeddings टेबल बनाएंगे जो वेक्टर स्टोर का प्रतिनिधित्व करेगा। तीसरा, हम दस्तावेजों (Yellowbrick मैनुअल के प्रशासन अध्याय) की एक श्रृंखला लोड करेंगे। चौथा, हम उन दस्तावेजों के वेक्टर प्रतिनिधित्व बनाएंगे और Yellowbrick टेबल में संग्रहित करेंगे। अंत में, हम उन्हीं प्रश्नों को सुधारे गए चैटबॉक्स को भेजेंगे ताकि परिणाम देखा जा सके।

```python
# Install all needed libraries
%pip install --upgrade --quiet  langchain
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  psycopg2-binary
%pip install --upgrade --quiet  tiktoken
```

## सेटअप: Yellowbrick और OpenAI API से कनेक्ट करने के लिए उपयोग की जाने वाली जानकारी दर्ज करें

हमारा चैटबॉट langchain लाइब्रेरी के माध्यम से ChatGpt के साथ एकीकृत है, इसलिए आपको पहले OpenAI से एक API कुंजी की आवश्यकता होगी:

OpenAI के लिए एक API कुंजी प्राप्त करने के लिए:
1. https://platform.openai.com/ पर पंजीकरण करें
2. एक भुगतान विधि जोड़ें - आप मुफ्त कोटा से अधिक नहीं जाएंगे
3. एक API कुंजी बनाएं

आपको Yellowbrick सैंडबॉक्स खाता साइन अप करते समय प्राप्त स्वागत ईमेल से अपना उपयोगकर्ता नाम, पासवर्ड और डेटाबेस नाम भी होना चाहिए।

निम्नलिखित को अपने Yellowbrick डेटाबेस और OpenAPI कुंजी के लिए जानकारी शामिल करने के लिए संशोधित किया जाना चाहिए।

```python
# Modify these values to match your Yellowbrick Sandbox and OpenAI API Key
YBUSER = "[SANDBOX USER]"
YBPASSWORD = "[SANDBOX PASSWORD]"
YBDATABASE = "[SANDBOX_DATABASE]"
YBHOST = "trialsandbox.sandbox.aws.yellowbrickcloud.com"

OPENAI_API_KEY = "[OPENAI API KEY]"
```

```python
# Import libraries and setup keys / login info
import os
import pathlib
import re
import sys
import urllib.parse as urlparse
from getpass import getpass

import psycopg2
from IPython.display import Markdown, display
from langchain.chains import LLMChain, RetrievalQAWithSourcesChain
from langchain.schema import Document
from langchain_community.vectorstores import Yellowbrick
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Establish connection parameters to Yellowbrick.  If you've signed up for Sandbox, fill in the information from your welcome mail here:
yellowbrick_connection_string = (
    f"postgres://{urlparse.quote(YBUSER)}:{YBPASSWORD}@{YBHOST}:5432/{YBDATABASE}"
)

YB_DOC_DATABASE = "sample_data"
YB_DOC_TABLE = "yellowbrick_documentation"
embedding_table = "my_embeddings"

# API Key for OpenAI.  Signup at https://platform.openai.com
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
```

## भाग 1: वेक्टर स्टोर के बिना ChatGpt द्वारा समर्थित एक आधारभूत चैटबॉट बनाना

हम langchain का उपयोग करके ChatGPT को क्वेरी करेंगे। क्योंकि कोई वेक्टर स्टोर नहीं है, ChatGPT के पास प्रश्न का उत्तर देने के लिए कोई संदर्भ नहीं होगा।

```python
# Set up the chat model and specific prompt
system_template = """If you don't know the answer, Make up your best guess."""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

chain_type_kwargs = {"prompt": prompt}
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",  # Modify model_name if you have access to GPT-4
    temperature=0,
    max_tokens=256,
)

chain = LLMChain(
    llm=llm,
    prompt=prompt,
    verbose=False,
)


def print_result_simple(query):
    result = chain(query)
    output_text = f"""### Question:
  {query}
  ### Answer:
  {result['text']}
    """
    display(Markdown(output_text))


# Use the chain to query
print_result_simple("How many databases can be in a Yellowbrick Instance?")

print_result_simple("What's an easy way to add users in bulk to Yellowbrick?")
```

## भाग 2: Yellowbrick से कनेक्ट करें और embedding टेबल बनाएं

अपने दस्तावेज़ embeddings को Yellowbrick में लोड करने के लिए, आपको उन्हें संग्रहित करने के लिए अपना खुद का टेबल बनाना चाहिए। ध्यान दें कि टेबल को संग्रहित किया जाता है उस Yellowbrick डेटाबेस को UTF-8 एनकोडिंग में होना चाहिए।

निम्नलिखित स्कीमा के साथ एक UTF-8 डेटाबेस में एक टेबल बनाएं, और अपने चयनित टेबल नाम प्रदान करें:

```python
# Establish a connection to the Yellowbrick database
try:
    conn = psycopg2.connect(yellowbrick_connection_string)
except psycopg2.Error as e:
    print(f"Error connecting to the database: {e}")
    exit(1)

# Create a cursor object using the connection
cursor = conn.cursor()

# Define the SQL statement to create a table
create_table_query = f"""
CREATE TABLE IF NOT EXISTS {embedding_table} (
    doc_id uuid NOT NULL,
    embedding_id smallint NOT NULL,
    embedding double precision NOT NULL
)
DISTRIBUTE ON (doc_id);
truncate table {embedding_table};
"""

# Execute the SQL query to create a table
try:
    cursor.execute(create_table_query)
    print(f"Table '{embedding_table}' created successfully!")
except psycopg2.Error as e:
    print(f"Error creating table: {e}")
    conn.rollback()

# Commit changes and close the cursor and connection
conn.commit()
cursor.close()
conn.close()
```

## भाग 3: Yellowbrick में मौजूद एक मौजूदा टेबल से दस्तावेज़ निकालें

दस्तावेज़ पथ और सामग्री को Yellowbrick टेबल से निकालें। अगले चरण में हम इन दस्तावेजों से embeddings बनाने का उपयोग करेंगे।

```python
yellowbrick_doc_connection_string = (
    f"postgres://{urlparse.quote(YBUSER)}:{YBPASSWORD}@{YBHOST}:5432/{YB_DOC_DATABASE}"
)

print(yellowbrick_doc_connection_string)

# Establish a connection to the Yellowbrick database
conn = psycopg2.connect(yellowbrick_doc_connection_string)

# Create a cursor object
cursor = conn.cursor()

# Query to select all documents from the table
query = f"SELECT path, document FROM {YB_DOC_TABLE}"

# Execute the query
cursor.execute(query)

# Fetch all documents
yellowbrick_documents = cursor.fetchall()

print(f"Extracted {len(yellowbrick_documents)} documents successfully!")

# Close the cursor and connection
cursor.close()
conn.close()
```

## भाग 4: दस्तावेजों के साथ Yellowbrick वेक्टर स्टोर को लोड करें

दस्तावेजों के माध्यम से जाएं, उन्हें पाचनीय टुकड़ों में विभाजित करें, embedding बनाएं और Yellowbrick टेबल में डालें। यह लगभग 5 मिनट लेता है।

```python
# Split documents into chunks for conversion to embeddings
DOCUMENT_BASE_URL = "https://docs.yellowbrick.com/6.7.1/"  # Actual URL


separator = "\n## "  # This separator assumes Markdown docs from the repo uses ### as logical main header most of the time
chunk_size_limit = 2000
max_chunk_overlap = 200

documents = [
    Document(
        page_content=document[1],
        metadata={"source": DOCUMENT_BASE_URL + document[0].replace(".md", ".html")},
    )
    for document in yellowbrick_documents
]

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size_limit,
    chunk_overlap=max_chunk_overlap,
    separators=[separator, "\nn", "\n", ",", " ", ""],
)
split_docs = text_splitter.split_documents(documents)

docs_text = [doc.page_content for doc in split_docs]

embeddings = OpenAIEmbeddings()
vector_store = Yellowbrick.from_documents(
    documents=split_docs,
    embedding=embeddings,
    connection_info=yellowbrick_connection_string,
    table=embedding_table,
)

print(f"Created vector store with {len(documents)} documents")
```

## भाग 5: Yellowbrick को वेक्टर स्टोर के रूप में उपयोग करने वाला एक चैटबॉट बनाना

अब, हम Yellowbrick को एक वेक्टर स्टोर के रूप में जोड़ते हैं। वेक्टर स्टोर को Yellowbrick उत्पाद प्रलेखन के प्रशासनिक अध्याय का प्रतिनिधित्व करने वाले embeddings से भर दिया गया है।

हम ऊपर दिए गए ही प्रश्नों को भेजेंगे ताकि सुधारे गए प्रतिक्रियाओं को देखा जा सके।

```python
system_template = """Use the following pieces of context to answer the users question.
Take note of the sources and include them in the answer in the format: "SOURCES: source1 source2", use "SOURCES" in capital letters regardless of the number of sources.
If you don't know the answer, just say that "I don't know", don't try to make up an answer.
----------------
{summaries}"""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

vector_store = Yellowbrick(
    OpenAIEmbeddings(),
    yellowbrick_connection_string,
    embedding_table,  # Change the table name to reflect your embeddings
)

chain_type_kwargs = {"prompt": prompt}
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",  # Modify model_name if you have access to GPT-4
    temperature=0,
    max_tokens=256,
)
chain = RetrievalQAWithSourcesChain.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,
    chain_type_kwargs=chain_type_kwargs,
)


def print_result_sources(query):
    result = chain(query)
    output_text = f"""### Question:
  {query}
  ### Answer:
  {result['answer']}
  ### Sources:
  {result['sources']}
  ### All relevant sources:
  {', '.join(list(set([doc.metadata['source'] for doc in result['source_documents']])))}
    """
    display(Markdown(output_text))


# Use the chain to query

print_result_sources("How many databases can be in a Yellowbrick Instance?")

print_result_sources("Whats an easy way to add users in bulk to Yellowbrick?")
```

## भाग 6: प्रदर्शन में वृद्धि के लिए एक सूचकांक पेश करना

Yellowbrick स्थानीय संवेदनशील हैशिंग (Locality-Sensitive Hashing) दृष्टिकोण का उपयोग करके सूचकांकन का भी समर्थन करता है। यह एक अनुमानित निकटतम पड़ोसी खोज तकनीक है, और समानता खोज समय को सटीकता के खर्च पर व्यापक बनाने की अनुमति देती है। सूचकांक दो नए समायोज्य मापदंड पेश करता है:

- हाइपरप्लेन की संख्या, जिसे `create_lsh_index(num_hyperplanes)` तर्क के रूप में प्रदान किया जाता है। अधिक दस्तावेज़ होने पर, अधिक हाइपरप्लेन की आवश्यकता होती है। LSH आयाम-कमी का एक रूप है। मूल embeddings को कम आयामी वेक्टरों में रूपांतरित किया जाता है जहां घटकों की संख्या हाइपरप्लेन की संख्या के समान है।
- हैमिंग दूरी, एक पूर्णांक जो खोज की व्यापकता को दर्शाता है। छोटी हैमिंग दूरियों से तेज़ पुनर्प्राप्ति लेकिन कम सटीकता होती है।

यहां आप Yellowbrick में लोड किए गए embeddings पर एक सूचकांक बनाने का तरीका है। हम पिछले चैट सत्र को भी दोबारा चलाएंगे, लेकिन इस बार पुनर्प्राप्ति सूचकांक का उपयोग करेगी। ध्यान दें कि इतने कम दस्तावेजों के लिए, आप प्रदर्शन के मामले में सूचकांकन का लाभ नहीं देखेंगे।

```python
system_template = """Use the following pieces of context to answer the users question.
Take note of the sources and include them in the answer in the format: "SOURCES: source1 source2", use "SOURCES" in capital letters regardless of the number of sources.
If you don't know the answer, just say that "I don't know", don't try to make up an answer.
----------------
{summaries}"""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

vector_store = Yellowbrick(
    OpenAIEmbeddings(),
    yellowbrick_connection_string,
    embedding_table,  # Change the table name to reflect your embeddings
)

lsh_params = Yellowbrick.IndexParams(
    Yellowbrick.IndexType.LSH, {"num_hyperplanes": 8, "hamming_distance": 2}
)
vector_store.create_index(lsh_params)

chain_type_kwargs = {"prompt": prompt}
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",  # Modify model_name if you have access to GPT-4
    temperature=0,
    max_tokens=256,
)
chain = RetrievalQAWithSourcesChain.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(
        k=5, search_kwargs={"index_params": lsh_params}
    ),
    return_source_documents=True,
    chain_type_kwargs=chain_type_kwargs,
)


def print_result_sources(query):
    result = chain(query)
    output_text = f"""### Question:
  {query}
  ### Answer:
  {result['answer']}
  ### Sources:
  {result['sources']}
  ### All relevant sources:
  {', '.join(list(set([doc.metadata['source'] for doc in result['source_documents']])))}
    """
    display(Markdown(output_text))


# Use the chain to query

print_result_sources("How many databases can be in a Yellowbrick Instance?")

print_result_sources("Whats an easy way to add users in bulk to Yellowbrick?")
```

## अगले कदम:

यह कोड अलग-अलग प्रश्न पूछने के लिए संशोधित किया जा सकता है। आप अपने खुद के दस्तावेज़ों को भी वेक्टर स्टोर में लोड कर सकते हैं। langchain मॉड्यूल बहुत लचीला है और विभिन्न प्रकार की फ़ाइलों (HTML, PDF आदि सहित) को पार्स कर सकता है।

आप इसे Huggingface embeddings मॉडल और Meta's Llama 2 LLM का उपयोग करने के लिए भी संशोधित कर सकते हैं ताकि एक पूरी तरह से निजी चैटबॉक्स अनुभव प्राप्त हो।
