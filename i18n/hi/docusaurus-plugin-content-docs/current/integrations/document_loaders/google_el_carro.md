---
translated: true
---

# Google El Carro for Oracle Workloads

> Google [El Carro Oracle Operator](https://github.com/GoogleCloudPlatform/elcarro-oracle-operator)
एक ऐसा तरीका प्रदान करता है जिससे आप Kubernetes में Oracle डेटाबेस चला सकते हैं, जो एक पोर्टेबल, ओपन सोर्स, समुदाय-संचालित, कोई वेंडर लॉक-इन वाला कंटेनर ऑर्केस्ट्रेशन सिस्टम है। El Carro
व्यापक और सुसंगत कॉन्फ़िगरेशन और तैनाती के लिए एक शक्तिशाली घोषणात्मक API प्रदान करता है, साथ ही वास्तविक समय की परिचालन और
निगरानी के लिए भी।
El Carro Langchain एकीकरण का उपयोग करके अपने Oracle डेटाबेस की क्षमताओं का विस्तार करें
AI-संचालित अनुभव बनाने के लिए।

यह गाइड बताती है कि El Carro Langchain एकीकरण का उपयोग कैसे करें
[langchain दस्तावेज़ सहेजें, लोड करें और हटाएं](/docs/modules/data_connection/document_loaders/)
`ElCarroLoader` और `ElCarroDocumentSaver` के साथ। यह एकीकरण किसी भी Oracle डेटाबेस के लिए काम करता है, भले ही वह कहीं भी चल रहा हो।

[GitHub](https://github.com/googleapis/langchain-google-el-carro-python/) पर पैकेज के बारे में अधिक जानें।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-el-carro-python/blob/main/docs/document_loader.ipynb)

## शुरू करने से पहले

कृपया El Carro Oracle डेटाबेस सेट अप करने के लिए
README के [Getting Started](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/README.md#getting-started)
अनुभाग को पूरा करें।

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण `langchain-google-el-carro` पैकेज में मौजूद है, इसलिए
हमें इसे इंस्टॉल करना होगा।

```python
%pip install --upgrade --quiet langchain-google-el-carro
```

## मूलभूत उपयोग

### Oracle डेटाबेस कनेक्शन सेट अप करें

अपने Oracle डेटाबेस कनेक्शन विवरण के साथ निम्नलिखित चर भरें।

```python
# @title Set Your Values Here { display-mode: "form" }
HOST = "127.0.0.1"  # @param {type: "string"}
PORT = 3307  # @param {type: "integer"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
USER = "my-user"  # @param {type: "string"}
PASSWORD = input("Please provide a password to be used for the database user: ")
```

यदि आप El Carro का उपयोग कर रहे हैं, तो आप होस्टनेम और पोर्ट मान El Carro Kubernetes इंस्टेंस की
स्थिति में पा सकते हैं।
अपने PDB के लिए बनाए गए उपयोगकर्ता पासवर्ड का उपयोग करें।

उदाहरण आउटपुट:

```output
kubectl get -w instances.oracle.db.anthosapis.com -n db
NAME   DB ENGINE   VERSION   EDITION      ENDPOINT      URL                DB NAMES   BACKUP ID   READYSTATUS   READYREASON        DBREADYSTATUS   DBREADYREASON

mydb   Oracle      18c       Express      mydb-svc.db   34.71.69.25:6021   ['pdbname']            TRUE          CreateComplete     True            CreateComplete
```

### ElCarroEngine कनेक्शन पूल

`ElCarroEngine` आपके Oracle डेटाबेस के लिए एक कनेक्शन पूल कॉन्फ़िगर करता है, जिससे आपके एप्लिकेशन से सफल कनेक्शन हो सकते हैं और उद्योग की सर्वश्रेष्ठ प्रथाओं का पालन किया जा सकता है।

```python
from langchain_google_el_carro import ElCarroEngine

elcarro_engine = ElCarroEngine.from_instance(
    db_host=HOST,
    db_port=PORT,
    db_name=DATABASE,
    db_user=USER,
    db_password=PASSWORD,
)
```

### एक तालिका इनिशियलाइज़ करें

`elcarro_engine.init_document_table(<table_name>)` के माध्यम से डिफ़ॉल्ट स्कीमा की एक तालिका इनिशियलाइज़ करें। तालिका कॉलम:

- page_content (प्रकार: text)
- langchain_metadata (प्रकार: JSON)

```python
elcarro_engine.drop_document_table(TABLE_NAME)
elcarro_engine.init_document_table(
    table_name=TABLE_NAME,
)
```

### दस्तावेज़ सहेजें

`ElCarroDocumentSaver.add_documents(<documents>)` के साथ langchain दस्तावेज़ सहेजें।
`ElCarroDocumentSaver` क्लास को इनिशियलाइज़ करने के लिए आपको 2 चीज़ों की आवश्यकता है:

1. `elcarro_engine` - एक `ElCarroEngine` इंजन का एक इंस्टेंस।
2. `table_name` - Oracle डेटाबेस में langchain दस्तावेज़ को स्टोर करने के लिए तालिका का नाम।

```python
from langchain_core.documents import Document
from langchain_google_el_carro import ElCarroDocumentSaver

doc = Document(
    page_content="Banana",
    metadata={"type": "fruit", "weight": 100, "organic": 1},
)

saver = ElCarroDocumentSaver(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
)
saver.add_documents([doc])
```

### दस्तावेज़ लोड करें

`ElCarroLoader.load()` या `ElCarroLoader.lazy_load()` के साथ langchain दस्तावेज़ लोड करें।
`lazy_load` एक जनरेटर लौटाता है जो केवल इटरेशन के दौरान डेटाबेस से प्रश्न करता है।
`ElCarroLoader` क्लास को इनिशियलाइज़ करने के लिए आपको निम्नलिखित प्रदान करने की आवश्यकता है:

1. `elcarro_engine` - एक `ElCarroEngine` इंजन का एक इंस्टेंस।
2. `table_name` - Oracle डेटाबेस में langchain दस्तावेज़ को स्टोर करने के लिए तालिका का नाम।

```python
from langchain_google_el_carro import ElCarroLoader

loader = ElCarroLoader(elcarro_engine=elcarro_engine, table_name=TABLE_NAME)
docs = loader.lazy_load()
for doc in docs:
    print("Loaded documents:", doc)
```

### क्वेरी के माध्यम से दस्तावेज़ लोड करें

तालिका से दस्तावेज़ लोड करने के अलावा, हम SQL क्वेरी से उत्पन्न दृश्य से दस्तावेज़ भी लोड कर सकते हैं। उदाहरण के लिए:

```python
from langchain_google_el_carro import ElCarroLoader

loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    query=f"SELECT * FROM {TABLE_NAME} WHERE json_value(langchain_metadata, '$.organic') = '1'",
)
onedoc = loader.load()
print(onedoc)
```

SQL क्वेरी से उत्पन्न दृश्य का स्कीमा डिफ़ॉल्ट तालिका से अलग हो सकता है।
ऐसे मामलों में, ElCarroLoader का व्यवहार गैर-डिफ़ॉल्ट स्कीमा वाली तालिका से लोड करने के समान होता है।
[Load documents with customized document page content & metadata](#load-documents-with-customized-document-page-content--metadata) अनुभाग देखें।

### दस्तावेज़ हटाएं

`ElCarroDocumentSaver.delete(<documents>)` के साथ एक Oracle तालिका से langchain दस्तावेज़ की एक सूची हटाएं।

डिफ़ॉल्ट स्कीमा (page_content, langchain_metadata) वाली तालिका के लिए, हटाने का मानदंड है:

एक `पंक्ति` तब हटाई जानी चाहिए जब कोई `दस्तावेज़` सूची में मौजूद हो, जहां

- `document.page_content` `row[page_content]` के बराबर है
- `document.metadata` `row[langchain_metadata]` के बराबर है

```python
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(onedoc)
print("Documents after delete:", loader.load())
```

## उन्नत उपयोग

### गैर-डिफ़ॉल्ट दस्तावेज़ पृष्ठ सामग्री और मेटाडेटा के साथ दस्तावेज़ लोड करें

पहले हम एक गैर-डिफ़ॉल्ट स्कीमा वाली उदाहरण तालिका तैयार करते हैं और कुछ मनमाने डेटा से इसे भरते हैं।

```python
import sqlalchemy

create_table_query = f"""CREATE TABLE {TABLE_NAME} (
    fruit_id NUMBER GENERATED BY DEFAULT AS IDENTITY (START WITH 1),
    fruit_name VARCHAR2(100) NOT NULL,
    variety VARCHAR2(50),
    quantity_in_stock NUMBER(10) NOT NULL,
    price_per_unit NUMBER(6,2) NOT NULL,
    organic NUMBER(3) NOT NULL
)"""
elcarro_engine.drop_document_table(TABLE_NAME)

with elcarro_engine.connect() as conn:
    conn.execute(sqlalchemy.text(create_table_query))
    conn.commit()
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Apple', 'Granny Smith', 150, 0.99, 1)
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Banana', 'Cavendish', 200, 0.59, 0)
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Orange', 'Navel', 80, 1.29, 1)
            """
        )
    )
    conn.commit()
```

यदि हम अभी भी इस उदाहरण तालिका से `ElCarroLoader` के डिफ़ॉल्ट पैरामीटर के साथ langchain दस्तावेज़ लोड करते हैं,
तो लोड किए गए दस्तावेज़ों का `page_content` तालिका का पहला कॉलम होगा, और `metadata` सभी अन्य कॉलमों के कीमान युग्मों से बनेगा।

```python
loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
)
loaded_docs = loader.load()
print(f"Loaded Documents: [{loaded_docs}]")
```

हम `ElCarroLoader` को इनिशियलाइज़ करते समय `content_columns` और `metadata_columns` सेट करके लोड करने के लिए वांछित सामग्री और मेटाडेटा निर्दिष्ट कर सकते हैं।

1. `content_columns`: दस्तावेज़ के `page_content` में लिखने के लिए कॉलम।
2. `metadata_columns`: दस्तावेज़ के `metadata` में लिखने के लिए कॉलम।

उदाहरण के लिए यहां, `content_columns` में कॉलमों के मान को एक स्पेस-अलग किया हुआ स्ट्रिंग के रूप में जोड़ा जाएगा, जो लोड किए गए दस्तावेज़ों का `page_content` होगा, और `metadata_columns` में निर्दिष्ट कॉलमों के कीमान युग्मों का `metadata` होगा।

```python
loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_columns=[
        "variety",
        "quantity_in_stock",
        "price_per_unit",
        "organic",
    ],
    metadata_columns=["fruit_id", "fruit_name"],
)
loaded_docs = loader.load()
print(f"Loaded Documents: [{loaded_docs}]")
```

### सहेजें दस्तावेज़ अनुकूलित पृष्ठ सामग्री और मेटाडेटा के साथ

लैंगचेन दस्तावेज़ को तालिका में सहेजने के लिए अनुकूलित मेटाडेटा फ़ील्ड के साथ, हमें पहले `ElCarroEngine.init_document_table()` के माध्यम से ऐसी तालिका बनाने की आवश्यकता है, और हम चाहते हैं कि इसमें `metadata_columns` की सूची हो। इस उदाहरण में, बनाई गई तालिका में निम्नलिखित तालिका स्तंभ होंगे:

- सामग्री (प्रकार: पाठ): फल वर्णन को संग्रहीत करने के लिए।
- प्रकार (प्रकार VARCHAR2(200)): फल प्रकार को संग्रहीत करने के लिए।
- वजन (प्रकार INT): फल वजन को संग्रहीत करने के लिए।
- अतिरिक्त_json_मेटाडेटा (प्रकार: JSON): फल के अन्य मेटाडेटा जानकारी को संग्रहीत करने के लिए।

हम `elcarro_engine.init_document_table()` के साथ निम्नलिखित पैरामीटर का उपयोग कर सकते हैं ताकि तालिका बनाई जा सके:

1. `table_name`: ओरेकल डेटाबेस में लैंगचेन दस्तावेज़ को संग्रहीत करने के लिए तालिका का नाम।
2. `metadata_columns`: मेटाडेटा स्तंभों की सूची को दर्शाने वाला `sqlalchemy.Column`।
3. `content_column`: लैंगचेन दस्तावेज़ के `page_content` को संग्रहीत करने के लिए स्तंभ का नाम। डिफ़ॉल्ट: `"page_content", "VARCHAR2(4000)"`
4. `metadata_json_column`: अतिरिक्त JSON `metadata` को संग्रहीत करने के लिए स्तंभ का नाम। डिफ़ॉल्ट: `"langchain_metadata", "VARCHAR2(4000)"`।

```python
elcarro_engine.drop_document_table(TABLE_NAME)
elcarro_engine.init_document_table(
    table_name=TABLE_NAME,
    metadata_columns=[
        sqlalchemy.Column("type", sqlalchemy.dialects.oracle.VARCHAR2(200)),
        sqlalchemy.Column("weight", sqlalchemy.INT),
    ],
    content_column="content",
    metadata_json_column="extra_json_metadata",
)
```

`ElCarroDocumentSaver.add_documents(<documents>)` के साथ दस्तावेज़ सहेजें। जैसा कि इस उदाहरण में देखा जा सकता है,

- `document.page_content` को `content` स्तंभ में सहेजा जाएगा।
- `document.metadata.type` को `type` स्तंभ में सहेजा जाएगा।
- `document.metadata.weight` को `weight` स्तंभ में सहेजा जाएगा।
- `document.metadata.organic` को JSON प्रारूप में `extra_json_metadata` स्तंभ में सहेजा जाएगा।

```python
doc = Document(
    page_content="Banana",
    metadata={"type": "fruit", "weight": 100, "organic": 1},
)

print(f"Original Document: [{doc}]")

saver = ElCarroDocumentSaver(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_column="content",
    metadata_json_column="extra_json_metadata",
)
saver.add_documents([doc])

loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_columns=["content"],
    metadata_columns=[
        "type",
        "weight",
    ],
    metadata_json_column="extra_json_metadata",
)

loaded_docs = loader.load()
print(f"Loaded Document: [{loaded_docs[0]}]")
```

### अनुकूलित पृष्ठ सामग्री और मेटाडेटा के साथ दस्तावेज़ हटाएं

हम `ElCarroDocumentSaver.delete(<documents>)` के माध्यम से अनुकूलित मेटाडेटा स्तंभों के साथ दस्तावेज़ को भी हटा सकते हैं। हटाने का मानदंड यह है:

एक `पंक्ति` तब हटाई जाएगी जब कोई `दस्तावेज़` सूची में मौजूद होगा, जिसके लिए

- `document.page_content` `row[page_content]` के बराबर है
- प्रत्येक मेटाडेटा फ़ील्ड `k` के लिए `document.metadata`
    - `document.metadata[k]` `row[k]` के बराबर है या `document.metadata[k]` `row[langchain_metadata][k]` के बराबर है
- `row` में कोई अतिरिक्त मेटाडेटा फ़ील्ड `document.metadata` में मौजूद नहीं है।

```python
loader = ElCarroLoader(elcarro_engine=elcarro_engine, table_name=TABLE_NAME)
saver.delete(loader.load())
print(f"Documents left: {len(loader.load())}")
```

## और उदाहरण

कृपया पूर्ण कोड उदाहरणों के लिए
[demo_doc_loader_basic.py](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/samples/demo_doc_loader_basic.py)
और [demo_doc_loader_advanced.py](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/samples/demo_doc_loader_advanced.py)
देखें।
