---
translated: true
---

#  Activeloop Deep Lake

>[Activeloop Deep Lake](https://docs.activeloop.ai/) एक मल्टी-मोडल वेक्टर स्टोर के रूप में जो एम्बेडिंग्स और उनके मेटाडेटा को संग्रहीत करता है जिसमें टेक्स्ट, Jsons, इमेज, ऑडियो, वीडियो, और अधिक शामिल हैं। यह डेटा को स्थानीय रूप से, आपके क्लाउड में, या Activeloop स्टोरेज पर संग्रहीत करता है। यह एम्बेडिंग्स और उनके एट्रिब्यूट्स सहित हाइब्रिड सर्च करता है।

यह नोटबुक `Activeloop Deep Lake` से संबंधित बुनियादी कार्यक्षमता को प्रदर्शित करती है। जबकि `Deep Lake` एम्बेडिंग्स को संग्रहीत कर सकता है, यह किसी भी प्रकार का डेटा संग्रहीत करने में सक्षम है। यह संस्करण नियंत्रण, क्वेरी इंजन और डीप लर्निंग फ्रेमवर्क के लिए स्ट्रीमिंग डाटालोडर्स के साथ एक सर्वरलेस डेटा लेक है।

अधिक जानकारी के लिए, कृपया Deep Lake [दस्तावेज़ीकरण](https://docs.activeloop.ai) या [api संदर्भ](https://docs.deeplake.ai) देखें।

## सेटअप

```python
%pip install --upgrade --quiet  langchain-openai 'deeplake[enterprise]' tiktoken
```

## Activeloop द्वारा प्रदान किया गया उदाहरण

[LangChain के साथ एकीकरण](https://docs.activeloop.ai/tutorials/vector-store/deep-lake-vector-store-in-langchain)।

## स्थानीय रूप से Deep Lake

```python
from langchain_community.vectorstores import DeepLake
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
activeloop_token = getpass.getpass("activeloop token:")
embeddings = OpenAIEmbeddings()
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

### एक स्थानीय डेटासेट बनाएं

`./deeplake/` पर स्थानीय रूप से एक डेटासेट बनाएं, फिर समानता खोज चलाएं। Deeplake+LangChain एकीकरण हुड के तहत Deep Lake डेटासेट का उपयोग करता है, इसलिए `dataset` और `vector store` को परस्पर उपयोग किया जाता है। अपने क्लाउड में या Deep Lake स्टोरेज में एक डेटासेट बनाने के लिए, [पथ को तदनुसार समायोजित करें](https://docs.activeloop.ai/storage-and-credentials/storage-options)।

```python
db = DeepLake(dataset_path="./my_deeplake/", embedding=embeddings, overwrite=True)
db.add_documents(docs)
# or shorter
# db = DeepLake.from_documents(docs, dataset_path="./my_deeplake/", embedding=embeddings, overwrite=True)
```

### डेटासेट क्वेरी करें

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```output


Dataset(path='./my_deeplake/', tensors=['embedding', 'id', 'metadata', 'text'])

  tensor      htype      shape      dtype  compression
  -------    -------    -------    -------  -------
 embedding  embedding  (42, 1536)  float32   None
    id        text      (42, 1)      str     None
 metadata     json      (42, 1)      str     None
   text       text      (42, 1)      str     None


```

डेटासेट सारांश प्रिंटिंग को हमेशा के लिए अक्षम करने के लिए, आप VectorStore प्रारंभिककरण के दौरान verbose=False निर्दिष्ट कर सकते हैं।

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

बाद में, आप एम्बेडिंग्स को पुनः संगणना किए बिना डेटासेट को पुनः लोड कर सकते हैं।

```python
db = DeepLake(dataset_path="./my_deeplake/", embedding=embeddings, read_only=True)
docs = db.similarity_search(query)
```

```output
Deep Lake Dataset in ./my_deeplake/ already exists, loading from the storage
```

Deep Lake, फिलहाल, एकल लेखक और बहुवाचक है। `read_only=True` सेट करना लेखक लॉक प्राप्त करने से बचने में मदद करता है।

### पुनर्प्राप्ति प्रश्न/उत्तर

```python
from langchain.chains import RetrievalQA
from langchain_openai import OpenAIChat

qa = RetrievalQA.from_chain_type(
    llm=OpenAIChat(model="gpt-3.5-turbo"),
    chain_type="stuff",
    retriever=db.as_retriever(),
)
```

```output
/home/ubuntu/langchain_activeloop/langchain/libs/langchain/langchain/llms/openai.py:786: UserWarning: You are trying to use a chat model. This way of initializing it is no longer supported. Instead, please use: `from langchain_openai import ChatOpenAI`
  warnings.warn(
```

```python
query = "What did the president say about Ketanji Brown Jackson"
qa.run(query)
```

```output
'The president said that Ketanji Brown Jackson is a former top litigator in private practice and a former federal public defender. She comes from a family of public school educators and police officers. She is a consensus builder and has received a broad range of support since being nominated.'
```

### मेटाडेटा में एट्रिब्यूट आधारित फ़िल्टरिंग

आइए एक और वेक्टर स्टोर बनाएं जिसमें मेटाडेटा हो जिसमें दस्तावेज़ों के बनाए गए वर्ष शामिल हों।

```python
import random

for d in docs:
    d.metadata["year"] = random.randint(2012, 2014)

db = DeepLake.from_documents(
    docs, embeddings, dataset_path="./my_deeplake/", overwrite=True
)
```

```output


Dataset(path='./my_deeplake/', tensors=['embedding', 'id', 'metadata', 'text'])

  tensor      htype      shape     dtype  compression
  -------    -------    -------   -------  -------
 embedding  embedding  (4, 1536)  float32   None
    id        text      (4, 1)      str     None
 metadata     json      (4, 1)      str     None
   text       text      (4, 1)      str     None


```

```python
db.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    filter={"metadata": {"year": 2013}},
)
```

```output
100%|██████████| 4/4 [00:00<00:00, 2936.16it/s]
```

```output
[Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. \n\nWe can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  \n\nWe’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  \n\nWe’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. \n\nWe’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.', metadata={'source': '../../modules/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='Tonight, I’m announcing a crackdown on these companies overcharging American businesses and consumers. \n\nAnd as Wall Street firms take over more nursing homes, quality in those homes has gone down and costs have gone up.  \n\nThat ends on my watch. \n\nMedicare is going to set higher standards for nursing homes and make sure your loved ones get the care they deserve and expect. \n\nWe’ll also cut costs and keep the economy going strong by giving workers a fair shot, provide more training and apprenticeships, hire them based on their skills not degrees. \n\nLet’s pass the Paycheck Fairness Act and paid leave.  \n\nRaise the minimum wage to $15 an hour and extend the Child Tax Credit, so no one has to raise a family in poverty. \n\nLet’s increase Pell Grants and increase our historic support of HBCUs, and invest in what Jill—our First Lady who teaches full-time—calls America’s best-kept secret: community colleges.', metadata={'source': '../../modules/state_of_the_union.txt', 'year': 2013})]
```

### दूरी फ़ंक्शन चुनना

दूरी फ़ंक्शन `L2` यूलिडियन के लिए, `L1` न्यूक्लियर के लिए, `Max` l-infinity दूरी, `cos` कोसाइन समानता के लिए, `dot` डॉट उत्पाद के लिए

```python
db.similarity_search(
    "What did the president say about Ketanji Brown Jackson?", distance_metric="cos"
)
```

```output
[Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. \n\nWe can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  \n\nWe’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  \n\nWe’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. \n\nWe’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.', metadata={'source': '../../modules/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='Tonight, I’m announcing a crackdown on these companies overcharging American businesses and consumers. \n\nAnd as Wall Street firms take over more nursing homes, quality in those homes has gone down and costs have gone up.  \n\nThat ends on my watch. \n\nMedicare is going to set higher standards for nursing homes and make sure your loved ones get the care they deserve and expect. \n\nWe’ll also cut costs and keep the economy going strong by giving workers a fair shot, provide more training and apprenticeships, hire them based on their skills not degrees. \n\nLet’s pass the Paycheck Fairness Act and paid leave.  \n\nRaise the minimum wage to $15 an hour and extend the Child Tax Credit, so no one has to raise a family in poverty. \n\nLet’s increase Pell Grants and increase our historic support of HBCUs, and invest in what Jill—our First Lady who teaches full-time—calls America’s best-kept secret: community colleges.', metadata={'source': '../../modules/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong. \n\nAs I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. \n\nWhile it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice. \n\nAnd soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things. \n\nSo tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.  \n\nFirst, beat the opioid epidemic.', metadata={'source': '../../modules/state_of_the_union.txt', 'year': 2012})]
```

### अधिकतम मार्जिनल प्रासंगिकता

अधिकतम मार्जिनल प्रासंगिकता का उपयोग करना

```python
db.max_marginal_relevance_search(
    "What did the president say about Ketanji Brown Jackson?"
)
```

```output
[Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='Tonight, I’m announcing a crackdown on these companies overcharging American businesses and consumers. \n\nAnd as Wall Street firms take over more nursing homes, quality in those homes has gone down and costs have gone up.  \n\nThat ends on my watch. \n\nMedicare is going to set higher standards for nursing homes and make sure your loved ones get the care they deserve and expect. \n\nWe’ll also cut costs and keep the economy going strong by giving workers a fair shot, provide more training and apprenticeships, hire them based on their skills not degrees. \n\nLet’s pass the Paycheck Fairness Act and paid leave.  \n\nRaise the minimum wage to $15 an hour and extend the Child Tax Credit, so no one has to raise a family in poverty. \n\nLet’s increase Pell Grants and increase our historic support of HBCUs, and invest in what Jill—our First Lady who teaches full-time—calls America’s best-kept secret: community colleges.', metadata={'source': '../../modules/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. \n\nWe can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  \n\nWe’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  \n\nWe’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. \n\nWe’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.', metadata={'source': '../../modules/state_of_the_union.txt', 'year': 2013}),
 Document(page_content='And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong. \n\nAs I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. \n\nWhile it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice. \n\nAnd soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things. \n\nSo tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.  \n\nFirst, beat the opioid epidemic.', metadata={'source': '../../modules/state_of_the_union.txt', 'year': 2012})]
```

### डेटासेट हटाएं

```python
db.delete_dataset()
```

और अगर हटाना विफल हो जाता है तो आप जबरन हटा भी सकते हैं

```python
DeepLake.force_delete_by_path("./my_deeplake")
```

## क्लाउड (Activeloop, AWS, GCS, आदि) या मेमोरी में Deep Lake डेटासेट

डिफ़ॉल्ट रूप से, Deep Lake डेटासेट स्थानीय रूप से संग्रहीत होते हैं। उन्हें मेमोरी में, Deep Lake Managed DB में, या किसी भी ऑब्जेक्ट स्टोरेज में संग्रहीत करने के लिए, आप [वेक्टर स्टोर बनाते समय संबंधित पथ और क्रेडेंशियल्स प्रदान कर सकते हैं](https://docs.activeloop.ai/storage-and-credentials/storage-options)। कुछ पथों के लिए Activeloop के साथ पंजीकरण और एक API टोकन का निर्माण आवश्यक है जिसे [यहां से प्राप्त किया जा सकता है](https://app.activeloop.ai/)

```python
os.environ["ACTIVELOOP_TOKEN"] = activeloop_token
```

```python
# Embed and store the texts
username = "<USERNAME_OR_ORG>"  # your username on app.activeloop.ai
dataset_path = f"hub://{username}/langchain_testing_python"  # could be also ./local/path (much faster locally), s3://bucket/path/to/dataset, gcs://path/to/dataset, etc.

docs = text_splitter.split_documents(documents)

embedding = OpenAIEmbeddings()
db = DeepLake(dataset_path=dataset_path, embedding=embeddings, overwrite=True)
ids = db.add_documents(docs)
```

```output
Your Deep Lake dataset has been successfully created!



Dataset(path='hub://adilkhan/langchain_testing_python', tensors=['embedding', 'id', 'metadata', 'text'])

  tensor      htype      shape      dtype  compression
  -------    -------    -------    -------  -------
 embedding  embedding  (42, 1536)  float32   None
    id        text      (42, 1)      str     None
 metadata     json      (42, 1)      str     None
   text       text      (42, 1)      str     None


```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

#### `tensor_db` निष्पादन विकल्प

Deep Lake के Managed Tensor Database का उपयोग करने के लिए, वेक्टर स्टोर के निर्माण के दौरान रनटाइम पैरामीटर को {'tensor_db': True} के रूप में निर्दिष्ट करना आवश्यक है। यह कॉन्फ़िगरेशन क्वेरीज़ को Managed Tensor Database पर निष्पादित करने में सक्षम बनाता है, न कि क्लाइंट साइड पर। यह ध्यान दिया जाना चाहिए कि यह कार्यक्षमता स्थानीय रूप से या मेमोरी में संग्रहीत डेटासेट्स पर लागू नहीं होती है। यदि एक वेक्टर स्टोर पहले से ही Managed Tensor Database के बाहर बनाया गया है, तो इसे निर्दिष्ट चरणों का पालन करके Managed Tensor Database में स्थानांतरित किया जा सकता है।

```python
# Embed and store the texts
username = "<USERNAME_OR_ORG>"  # your username on app.activeloop.ai
dataset_path = f"hub://{username}/langchain_testing"

docs = text_splitter.split_documents(documents)

embedding = OpenAIEmbeddings()
db = DeepLake(
    dataset_path=dataset_path,
    embedding=embeddings,
    overwrite=True,
    runtime={"tensor_db": True},
)
ids = db.add_documents(docs)
```

```output
Your Deep Lake dataset has been successfully created!

|

Dataset(path='hub://adilkhan/langchain_testing', tensors=['embedding', 'id', 'metadata', 'text'])

  tensor      htype      shape      dtype  compression
  -------    -------    -------    -------  -------
 embedding  embedding  (42, 1536)  float32   None
    id        text      (42, 1)      str     None
 metadata     json      (42, 1)      str     None
   text       text      (42, 1)      str     None


```

### TQL सर्च

इसके अलावा, क्वेरीज़ को भी similarity_search विधि के भीतर समर्थित किया जाता है, जिसके द्वारा क्वेरी को Deep Lake के Tensor Query Language (TQL) का उपयोग करके निर्दिष्ट किया जा सकता है।

```python
search_id = db.vectorstore.dataset.id[0].numpy()
```

```python
search_id[0]
```

```output
'8a6ff326-3a85-11ee-b840-13905694aaaf'
```

```python
docs = db.similarity_search(
    query=None,
    tql=f"SELECT * WHERE id == '{search_id[0]}'",
)
```

```python
db.vectorstore.summary()
```

```output
Dataset(path='hub://adilkhan/langchain_testing', tensors=['embedding', 'id', 'metadata', 'text'])

  tensor      htype      shape      dtype  compression
  -------    -------    -------    -------  -------
 embedding  embedding  (42, 1536)  float32   None
    id        text      (42, 1)      str     None
 metadata     json      (42, 1)      str     None
   text       text      (42, 1)      str     None
```

### AWS S3 पर वेक्टर स्टोर्स बनाना

```python
dataset_path = "s3://BUCKET/langchain_test"  # could be also ./local/path (much faster locally), hub://bucket/path/to/dataset, gcs://path/to/dataset, etc.

embedding = OpenAIEmbeddings()
db = DeepLake.from_documents(
    docs,
    dataset_path=dataset_path,
    embedding=embeddings,
    overwrite=True,
    creds={
        "aws_access_key_id": os.environ["AWS_ACCESS_KEY_ID"],
        "aws_secret_access_key": os.environ["AWS_SECRET_ACCESS_KEY"],
        "aws_session_token": os.environ["AWS_SESSION_TOKEN"],  # Optional
    },
)
```

```output
s3://hub-2.0-datasets-n/langchain_test loaded successfully.

Evaluating ingest: 100%|██████████| 1/1 [00:10<00:00
\

Dataset(path='s3://hub-2.0-datasets-n/langchain_test', tensors=['embedding', 'ids', 'metadata', 'text'])

  tensor     htype     shape     dtype  compression
  -------   -------   -------   -------  -------
 embedding  generic  (4, 1536)  float32   None
    ids      text     (4, 1)      str     None
 metadata    json     (4, 1)      str     None
   text      text     (4, 1)      str     None


```

## Deep Lake API

आप Deep Lake डेटासेट को `db.vectorstore` पर एक्सेस कर सकते हैं

```python
# get structure of the dataset
db.vectorstore.summary()
```

```output
Dataset(path='hub://adilkhan/langchain_testing', tensors=['embedding', 'id', 'metadata', 'text'])

  tensor      htype      shape      dtype  compression
  -------    -------    -------    -------  -------
 embedding  embedding  (42, 1536)  float32   None
    id        text      (42, 1)      str     None
 metadata     json      (42, 1)      str     None
   text       text      (42, 1)      str     None
```

```python
# get embeddings numpy array
embeds = db.vectorstore.dataset.embedding.numpy()
```

### स्थानीय डेटासेट को क्लाउड में स्थानांतरित करें

पहले से बनाए गए डेटासेट को क्लाउड में कॉपी करें। आप क्लाउड से स्थानीय में भी स्थानांतरित कर सकते हैं।

```python
import deeplake

username = "davitbun"  # your username on app.activeloop.ai
source = f"hub://{username}/langchain_testing"  # could be local, s3, gcs, etc.
destination = f"hub://{username}/langchain_test_copy"  # could be local, s3, gcs, etc.

deeplake.deepcopy(src=source, dest=destination, overwrite=True)
```

```output
Copying dataset: 100%|██████████| 56/56 [00:38<00:00

This dataset can be visualized in Jupyter Notebook by ds.visualize() or at https://app.activeloop.ai/davitbun/langchain_test_copy
Your Deep Lake dataset has been successfully created!
The dataset is private so make sure you are logged in!
```

```output
Dataset(path='hub://davitbun/langchain_test_copy', tensors=['embedding', 'ids', 'metadata', 'text'])
```

```python
db = DeepLake(dataset_path=destination, embedding=embeddings)
db.add_documents(docs)
```

```output


This dataset can be visualized in Jupyter Notebook by ds.visualize() or at https://app.activeloop.ai/davitbun/langchain_test_copy

/

hub://davitbun/langchain_test_copy loaded successfully.

Deep Lake Dataset in hub://davitbun/langchain_test_copy already exists, loading from the storage

Dataset(path='hub://davitbun/langchain_test_copy', tensors=['embedding', 'ids', 'metadata', 'text'])

  tensor     htype     shape     dtype  compression
  -------   -------   -------   -------  -------
 embedding  generic  (4, 1536)  float32   None
    ids      text     (4, 1)      str     None
 metadata    json     (4, 1)      str     None
   text      text     (4, 1)      str     None

Evaluating ingest: 100%|██████████| 1/1 [00:31<00:00
-

Dataset(path='hub://davitbun/langchain_test_copy', tensors=['embedding', 'ids', 'metadata', 'text'])

  tensor     htype     shape     dtype  compression
  -------   -------   -------   -------  -------
 embedding  generic  (8, 1536)  float32   None
    ids      text     (8, 1)      str     None
 metadata    json     (8, 1)      str     None
   text      text     (8, 1)      str     None


```

```output
['ad42f3fe-e188-11ed-b66d-41c5f7b85421',
 'ad42f3ff-e188-11ed-b66d-41c5f7b85421',
 'ad42f400-e188-11ed-b66d-41c5f7b85421',
 'ad42f401-e188-11ed-b66d-41c5f7b85421']
```
