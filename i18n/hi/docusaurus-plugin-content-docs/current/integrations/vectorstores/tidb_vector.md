---
translated: true
---

# TiDB Vector

> [TiDB Cloud](https://tidbcloud.com/), एक व्यापक डेटाबेस-ऐज-ए-सर्विस (DBaaS) समाधान है, जो समर्पित और सर्वरलेस विकल्प प्रदान करता है। TiDB Serverless अब MySQL परिदृश्य में एक बिल्ट-इन वेक्टर खोज को एकीकृत कर रहा है। इस सुधार के साथ, आप नए डेटाबेस या अतिरिक्त तकनीकी स्टैक की आवश्यकता के बिना TiDB Serverless का उपयोग करके सुचारु रूप से AI अनुप्रयोग विकसित कर सकते हैं। निजी बीटा के लिए प्रतीक्षा सूची में शामिल होकर इसका अनुभव करें https://tidb.cloud/ai.

यह नोटबुक TiDB Vector कार्यक्षमता का उपयोग करने के बारे में विस्तृत मार्गदर्शन प्रदान करता है, इसकी विशेषताओं और व्यावहारिक अनुप्रयोगों को प्रदर्शित करता है।

## वातावरण सेट करना

आवश्यक पैकेज स्थापित करके शुरू करें।

```python
%pip install langchain
%pip install langchain-openai
%pip install pymysql
%pip install tidb-vector
```

OpenAI और TiDB होस्ट सेटिंग्स को कॉन्फ़िगर करें जिनकी आपको आवश्यकता होगी। इस नोटबुक में, हम TiDB Cloud द्वारा प्रदान किए गए मानक कनेक्शन विधि का पालन करेंगे ताकि एक सुरक्षित और कुशल डेटाबेस कनेक्शन स्थापित किया जा सके।

```python
# Here we useimport getpass
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
# copy from tidb cloud console
tidb_connection_string_template = "mysql+pymysql://<USER>:<PASSWORD>@<HOST>:4000/<DB>?ssl_ca=/etc/ssl/cert.pem&ssl_verify_cert=true&ssl_verify_identity=true"
# tidb_connection_string_template = "mysql+pymysql://root:<PASSWORD>@34.212.137.91:4000/test"
tidb_password = getpass.getpass("Input your TiDB password:")
tidb_connection_string = tidb_connection_string_template.replace(
    "<PASSWORD>", tidb_password
)
```

निम्नलिखित डेटा तैयार करें।

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import TiDBVectorStore
from langchain_openai import OpenAIEmbeddings
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

## सेमेंटिक समानता खोज

TiDB कोसाइन और यूक्लिडियन दूरियों ('कोसाइन', 'l2') दोनों का समर्थन करता है, जहां 'कोसाइन' डिफ़ॉल्ट विकल्प है।

नीचे दिया गया कोड स्निपेट `TABLE_NAME` नाम का एक तालिका TiDB में बनाता है, जो वेक्टर खोज के लिए अनुकूलित है। इस कोड को सफलतापूर्वक निष्पादित करने के बाद, आप अपने TiDB डेटाबेस में सीधे `TABLE_NAME` तालिका को देख और उपयोग कर सकेंगे।

```python
TABLE_NAME = "semantic_embeddings"
db = TiDBVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    table_name=TABLE_NAME,
    connection_string=tidb_connection_string,
    distance_strategy="cosine",  # default, another option is "l2"
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db.similarity_search_with_score(query, k=3)
```

कृपया ध्यान दें कि कोसाइन दूरी कम होने से अधिक समानता का संकेत मिलता है।

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.18459301498220004
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.2172729943284636
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.2262166799003692
And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong.

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential.

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things.

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.

First, beat the opioid epidemic.
--------------------------------------------------------------------------------
```

इसके अलावा, समानता_खोज_प्रासंगिकता_स्कोर विधि का उपयोग प्रासंगिकता स्कोर प्राप्त करने के लिए किया जा सकता है, जहां अधिक स्कोर अधिक समानता का संकेत देता है।

```python
docs_with_relevance_score = db.similarity_search_with_relevance_scores(query, k=2)
for doc, score in docs_with_relevance_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.8154069850178
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.7827270056715364
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
```

# मेटाडेटा के साथ फ़िल्टर करें

लागू किए गए फ़िल्टर के साथ संरेखित निकटतम पड़ोसी परिणाम प्राप्त करने के लिए मेटाडेटा फ़िल्टर का उपयोग करें।

## समर्थित मेटाडेटा प्रकार

TiDB Vector स्टोर में प्रत्येक वेक्टर को एक JSON ऑब्जेक्ट के भीतर कुंजी-मूल्य युग्मों के रूप में मेटाडेटा के साथ जोड़ा जा सकता है। कुंजियां स्ट्रिंग हैं, और मूल्य निम्नलिखित प्रकारों में से हो सकते हैं:

- स्ट्रिंग
- संख्या (पूर्णांक या फ्लोटिंग पॉइंट)
- बूलियन (सच, झूठ)

उदाहरण के लिए, निम्नलिखित मान्य मेटाडेटा पेलोड पर विचार करें:

```json
{
    "page": 12,
    "book_tile": "Siddhartha"
}
```

## मेटाडेटा फ़िल्टर वाक्य-रचना

उपलब्ध फ़िल्टर में शामिल हैं:

- $or - किसी भी एक दिए गए शर्त को पूरा करने वाले वेक्टर का चयन करता है।
- $and - सभी दिए गए शर्तों को पूरा करने वाले वेक्टर का चयन करता है।
- $eq - बराबर
- $ne - बराबर नहीं
- $gt - से अधिक
- $gte - से अधिक या बराबर
- $lt - से कम
- $lte - से कम या बराबर
- $in - सूची में
- $nin - सूची में नहीं

मान लें कि एक वेक्टर मेटाडेटा के साथ है:

```json
{
    "page": 12,
    "book_tile": "Siddhartha"
}
```

निम्नलिखित मेटाडेटा फ़िल्टर वेक्टर से मेल खाएंगे।

```json
{"page": 12}

{"page":{"$eq": 12}}

{"page":{"$in": [11, 12, 13]}}

{"page":{"$nin": [13]}}

{"page":{"$lt": 11}}

{
    "$or": [{"page": 11}, {"page": 12}],
    "$and": [{"page": 12}, {"page": 13}],
}
```

कृपया ध्यान दें कि मेटाडेटा फ़िल्टर में प्रत्येक कुंजी-मूल्य युग्म को एक अलग फ़िल्टर क्लॉज के रूप में माना जाता है, और ये क्लॉज AND तर्किक ऑपरेटर का उपयोग करके संयुक्त किए जाते हैं।

```python
db.add_texts(
    texts=[
        "TiDB Vector offers advanced, high-speed vector processing capabilities, enhancing AI workflows with efficient data handling and analytics support.",
        "TiDB Vector, starting as low as $10 per month for basic usage",
    ],
    metadatas=[
        {"title": "TiDB Vector functionality"},
        {"title": "TiDB Vector Pricing"},
    ],
)
```

```output
[UUID('c782cb02-8eec-45be-a31f-fdb78914f0a7'),
 UUID('08dcd2ba-9f16-4f29-a9b7-18141f8edae3')]
```

```python
docs_with_score = db.similarity_search_with_score(
    "Introduction to TiDB Vector", filter={"title": "TiDB Vector functionality"}, k=4
)
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.12761409169211535
TiDB Vector offers advanced, high-speed vector processing capabilities, enhancing AI workflows with efficient data handling and analytics support.
--------------------------------------------------------------------------------
```

### रिट्रीवर के रूप में उपयोग करना

Langchain में, एक रिट्रीवर एक अनरूपित क्वेरी के जवाब में दस्तावेज़ों को पुनर्प्राप्त करने का एक इंटरफ़ेस है, जो एक वेक्टर स्टोर की तुलना में व्यापक कार्यक्षमता प्रदान करता है। नीचे दिया गया कोड TiDB Vector को एक रिट्रीवर के रूप में कैसे उपयोग करें, दिखाता है।

```python
retriever = db.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"k": 3, "score_threshold": 0.8},
)
docs_retrieved = retriever.invoke(query)
for doc in docs_retrieved:
    print("-" * 80)
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
```

## उन्नत उपयोग मामला परिदृश्य

आइए एक उन्नत उपयोग मामले पर नज़र डालें - एक यात्रा एजेंट अपने ग्राहकों के लिए एक कस्टम यात्रा रिपोर्ट तैयार कर रहा है जो स्वच्छ लाउंज और शाकाहारी विकल्प जैसी सुविधाओं वाले हवाई अड्डों की तलाश करते हैं। प्रक्रिया में शामिल हैं:
- हवाई अड्डों की समीक्षाओं में सेमेंटिक खोज करके इन सुविधाओं को पूरा करने वाले हवाई अड्डों के कोड निकालना।
- इन कोडों को मार्ग जानकारी के साथ जोड़ने वाला एक बाद का SQL क्वेरी, जो ग्राहकों की पसंद के अनुरूप एयरलाइनों और गंतव्यों का ब्यौरा प्रदान करता है।

पहले, हवाई अड्डे से संबंधित कुछ डेटा तैयार करते हैं।

```python
# create table to store airplan data
db.tidb_vector_client.execute(
    """CREATE TABLE airplan_routes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        airport_code VARCHAR(10),
        airline_code VARCHAR(10),
        destination_code VARCHAR(10),
        route_details TEXT,
        duration TIME,
        frequency INT,
        airplane_type VARCHAR(50),
        price DECIMAL(10, 2),
        layover TEXT
    );"""
)

# insert some data into Routes and our vector table
db.tidb_vector_client.execute(
    """INSERT INTO airplan_routes (
        airport_code,
        airline_code,
        destination_code,
        route_details,
        duration,
        frequency,
        airplane_type,
        price,
        layover
    ) VALUES
    ('JFK', 'DL', 'LAX', 'Non-stop from JFK to LAX.', '06:00:00', 5, 'Boeing 777', 299.99, 'None'),
    ('LAX', 'AA', 'ORD', 'Direct LAX to ORD route.', '04:00:00', 3, 'Airbus A320', 149.99, 'None'),
    ('EFGH', 'UA', 'SEA', 'Daily flights from SFO to SEA.', '02:30:00', 7, 'Boeing 737', 129.99, 'None');
    """
)
db.add_texts(
    texts=[
        "Clean lounges and excellent vegetarian dining options. Highly recommended.",
        "Comfortable seating in lounge areas and diverse food selections, including vegetarian.",
        "Small airport with basic facilities.",
    ],
    metadatas=[
        {"airport_code": "JFK"},
        {"airport_code": "LAX"},
        {"airport_code": "EFGH"},
    ],
)
```

```output
[UUID('6dab390f-acd9-4c7d-b252-616606fbc89b'),
 UUID('9e811801-0e6b-4893-8886-60f4fb67ce69'),
 UUID('f426747c-0f7b-4c62-97ed-3eeb7c8dd76e')]
```

स्वच्छ सुविधाओं और शाकाहारी विकल्पों वाले हवाई अड्डों को वेक्टर खोज के माध्यम से खोजना

```python
retriever = db.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"k": 3, "score_threshold": 0.85},
)
semantic_query = "Could you recommend a US airport with clean lounges and good vegetarian dining options?"
reviews = retriever.invoke(semantic_query)
for r in reviews:
    print("-" * 80)
    print(r.page_content)
    print(r.metadata)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Clean lounges and excellent vegetarian dining options. Highly recommended.
{'airport_code': 'JFK'}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Comfortable seating in lounge areas and diverse food selections, including vegetarian.
{'airport_code': 'LAX'}
--------------------------------------------------------------------------------
```

```python
# Extracting airport codes from the metadata
airport_codes = [review.metadata["airport_code"] for review in reviews]

# Executing a query to get the airport details
search_query = "SELECT * FROM airplan_routes WHERE airport_code IN :codes"
params = {"codes": tuple(airport_codes)}

airport_details = db.tidb_vector_client.execute(search_query, params)
airport_details.get("result")
```

```output
[(1, 'JFK', 'DL', 'LAX', 'Non-stop from JFK to LAX.', datetime.timedelta(seconds=21600), 5, 'Boeing 777', Decimal('299.99'), 'None'),
 (2, 'LAX', 'AA', 'ORD', 'Direct LAX to ORD route.', datetime.timedelta(seconds=14400), 3, 'Airbus A320', Decimal('149.99'), 'None')]
```

वैकल्पिक रूप से, हम एक ही SQL क्वेरी का उपयोग करके खोज को एक चरण में पूरा कर सकते हैं।

```python
search_query = f"""
    SELECT
        VEC_Cosine_Distance(se.embedding, :query_vector) as distance,
        ar.*,
        se.document as airport_review
    FROM
        airplan_routes ar
    JOIN
        {TABLE_NAME} se ON ar.airport_code = JSON_UNQUOTE(JSON_EXTRACT(se.meta, '$.airport_code'))
    ORDER BY distance ASC
    LIMIT 5;
"""
query_vector = embeddings.embed_query(semantic_query)
params = {"query_vector": str(query_vector)}
airport_details = db.tidb_vector_client.execute(search_query, params)
airport_details.get("result")
```

```output
[(0.1219207353407008, 1, 'JFK', 'DL', 'LAX', 'Non-stop from JFK to LAX.', datetime.timedelta(seconds=21600), 5, 'Boeing 777', Decimal('299.99'), 'None', 'Clean lounges and excellent vegetarian dining options. Highly recommended.'),
 (0.14613754359804654, 2, 'LAX', 'AA', 'ORD', 'Direct LAX to ORD route.', datetime.timedelta(seconds=14400), 3, 'Airbus A320', Decimal('149.99'), 'None', 'Comfortable seating in lounge areas and diverse food selections, including vegetarian.'),
 (0.19840519342700513, 3, 'EFGH', 'UA', 'SEA', 'Daily flights from SFO to SEA.', datetime.timedelta(seconds=9000), 7, 'Boeing 737', Decimal('129.99'), 'None', 'Small airport with basic facilities.')]
```

```python
# clean up
db.tidb_vector_client.execute("DROP TABLE airplan_routes")
```

```output
{'success': True, 'result': 0, 'error': None}
```

# हटाना

आप `.drop_vectorstore()` विधि का उपयोग करके TiDB Vector स्टोर को हटा सकते हैं।

```python
db.drop_vectorstore()
```
