---
translated: true
---

# Google Cloud SQL for SQL server

> [Cloud SQL](https://cloud.google.com/sql) एक पूरी तरह से प्रबंधित रिलेशनल डेटाबेस सेवा है जो उच्च प्रदर्शन, सुचारु एकीकरण और प्रभावशाली स्केलेबिलिटी प्रदान करती है। यह [MySQL](https://cloud.google.com/sql/mysql), [PostgreSQL](https://cloud.google.com/sql/postgres) और [SQL Server](https://cloud.google.com/sql/sqlserver) डेटाबेस इंजन प्रदान करती है। Cloud SQL के Langchain एकीकरण का उपयोग करके अपने डेटाबेस एप्लिकेशन को AI-संचालित अनुभव बनाने के लिए विस्तारित करें।

यह नोटबुक [Cloud SQL for SQL server](https://cloud.google.com/sql/sqlserver) का उपयोग करके [Langchain दस्तावेज़ों को सहेजने, लोड करने और हटाने](/docs/modules/data_connection/document_loaders/) के बारे में बताता है, जिसमें `MSSQLLoader` और `MSSQLDocumentSaver` का उपयोग किया जाता है।

पैकेज के बारे में अधिक जानकारी [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mssql-python/) पर प्राप्त करें।

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mssql-python/blob/main/docs/document_loader.ipynb)

## शुरू करने से पहले

इस नोटबुक को चलाने के लिए, आपको निम्नलिखित कार्य करने होंगे:

* [एक Google Cloud प्रोजेक्ट बनाएं](https://developers.google.com/workspace/guides/create-project)
* [Cloud SQL Admin API को सक्षम करें।](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
* [Cloud SQL for SQL server इंस्टेंस बनाएं](https://cloud.google.com/sql/docs/sqlserver/create-instance)
* [Cloud SQL डेटाबेस बनाएं](https://cloud.google.com/sql/docs/sqlserver/create-manage-databases)
* [डेटाबेस में एक IAM डेटाबेस उपयोगकर्ता जोड़ें](https://cloud.google.com/sql/docs/sqlserver/create-manage-users) (वैकल्पिक)

इस नोटबुक के रनटाइम वातावरण में डेटाबेस तक पहुंच की पुष्टि करने के बाद, निम्नलिखित मूल्यों को भरें और उदाहरण स्क्रिप्ट चलाने से पहले सेल चलाएं।

```python
# @markdown Please fill in the both the Google Cloud region and name of your Cloud SQL instance.
REGION = "us-central1"  # @param {type:"string"}
INSTANCE = "test-instance"  # @param {type:"string"}

# @markdown Please fill in user name and password of your Cloud SQL instance.
DB_USER = "sqlserver"  # @param {type:"string"}
DB_PASS = "password"  # @param {type:"string"}

# @markdown Please specify a database and a table for demo purpose.
DATABASE = "test"  # @param {type:"string"}
TABLE_NAME = "test-default"  # @param {type:"string"}
```

### 🦜🔗 लाइब्रेरी इंस्टॉलेशन

एकीकरण `langchain-google-cloud-sql-mssql` पैकेज में है, इसलिए हमें इसे इंस्टॉल करना होगा।

```python
%pip install --upgrade --quiet langchain-google-cloud-sql-mssql
```

**Colab केवल**: कर्नल को पुनः प्रारंभ करने के लिए निम्नलिखित सेल को अनकमेंट करें या पुनः प्रारंभ करने के लिए बटन का उपयोग करें। Vertex AI Workbench के लिए, शीर्ष पर दिए गए बटन का उपयोग करके टर्मिनल को पुनः प्रारंभ कर सकते हैं।

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 प्रमाणीकरण

इस नोटबुक में लॉग इन किए गए IAM उपयोगकर्ता के रूप में Google Cloud में प्रमाणित करें ताकि आप अपने Google Cloud प्रोजेक्ट तक पहुंच सकें।

- यदि आप इस नोटबुक को चलाने के लिए Colab का उपयोग कर रहे हैं, तो नीचे दिए गए सेल का उपयोग करें और आगे बढ़ें।
- यदि आप Vertex AI Workbench का उपयोग कर रहे हैं, तो [यहां](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env) दिए गए सेटअप निर्देशों की जांच करें।

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ अपने Google Cloud प्रोजेक्ट सेट करें

इस नोटबुक में Google Cloud संसाधनों का उपयोग करने के लिए अपने Google Cloud प्रोजेक्ट को सेट करें।

यदि आप अपने प्रोजेक्ट आईडी को नहीं जानते हैं, तो निम्नलिखित का प्रयास करें:

* `gcloud config list` चलाएं।
* `gcloud projects list` चलाएं।
* सहायता पृष्ठ देखें: [प्रोजेक्ट आईडी का पता लगाएं](https://support.google.com/googleapi/answer/7014113)।

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 💡 API सक्षमता

`langchain-google-cloud-sql-mssql` पैकेज के लिए [Cloud SQL Admin API](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com) को अपने Google Cloud प्रोजेक्ट में सक्षम करना आवश्यक है।

```python
# enable Cloud SQL Admin API
!gcloud services enable sqladmin.googleapis.com
```

## मूलभूत उपयोग

### MSSQLEngine कनेक्शन पूल

MSSQL टेबल से दस्तावेज़ सहेजने या लोड करने से पहले, हमें पहले Cloud SQL डेटाबेस के लिए एक कनेक्शन पूल कॉन्फ़िगर करना होगा। `MSSQLEngine` [SQLAlchemy कनेक्शन पूल](https://docs.sqlalchemy.org/en/20/core/pooling.html#module-sqlalchemy.pool) को आपके Cloud SQL डेटाबेस के लिए कॉन्फ़िगर करता है, जिससे आपके एप्लिकेशन से सफल कनेक्शन प्राप्त होते हैं और उद्योग की सर्वश्रेष्ठ प्रथाओं का पालन होता है।

`MSSQLEngine.from_instance()` का उपयोग करके एक `MSSQLEngine` बनाने के लिए आपको केवल 4 चीज़ें प्रदान करनी होंगी:

1. `project_id`: Cloud SQL इंस्टेंस स्थित Google Cloud प्रोजेक्ट का प्रोजेक्ट आईडी।
1. `region`: Cloud SQL इंस्टेंस स्थित क्षेत्र।
1. `instance`: Cloud SQL इंस्टेंस का नाम।
1. `database`: Cloud SQL इंस्टेंस पर कनेक्ट करने के लिए डेटाबेस का नाम।
1. `user`: डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग किया जाने वाला डेटाबेस उपयोगकर्ता।
1. `password`: डेटाबेस प्रमाणीकरण और लॉगिन के लिए उपयोग किया जाने वाला डेटाबेस पासवर्ड।

```python
from langchain_google_cloud_sql_mssql import MSSQLEngine

engine = MSSQLEngine.from_instance(
    project_id=PROJECT_ID,
    region=REGION,
    instance=INSTANCE,
    database=DATABASE,
    user=DB_USER,
    password=DB_PASS,
)
```

### एक टेबल इनिशियलाइज़ करें

`MSSQLEngine.init_document_table(<table_name>)` के माध्यम से डिफ़ॉल्ट स्कीमा वाले एक टेबल को इनिशियलाइज़ करें। टेबल कॉलम:

- page_content (प्रकार: text)
- langchain_metadata (प्रकार: JSON)

`overwrite_existing=True` फ्लैग का मतलब है कि नए इनिशियलाइज़ किए गए टेबल से किसी मौजूदा समान नाम वाले टेबल को प्रतिस्थापित कर दिया जाएगा।

```python
engine.init_document_table(TABLE_NAME, overwrite_existing=True)
```

### दस्तावेज़ सहेजें

`MSSQLDocumentSaver.add_documents(<documents>)` के साथ Langchain दस्तावेज़ सहेजें। `MSSQLDocumentSaver` क्लास को इनिशियलाइज़ करने के लिए आपको 2 चीज़ें प्रदान करनी होंगी:

1. `engine` - एक `MSSQLEngine` इंजन का एक इंस्टेंस।
2. `table_name` - Cloud SQL डेटाबेस में Langchain दस्तावेज़ को संग्रहित करने के लिए टेबल का नाम।

```python
from langchain_core.documents import Document
from langchain_google_cloud_sql_mssql import MSSQLDocumentSaver

test_docs = [
    Document(
        page_content="Apple Granny Smith 150 0.99 1",
        metadata={"fruit_id": 1},
    ),
    Document(
        page_content="Banana Cavendish 200 0.59 0",
        metadata={"fruit_id": 2},
    ),
    Document(
        page_content="Orange Navel 80 1.29 1",
        metadata={"fruit_id": 3},
    ),
]
saver = MSSQLDocumentSaver(engine=engine, table_name=TABLE_NAME)
saver.add_documents(test_docs)
```

### दस्तावेज़ लोड करें

`MSSQLLoader.load()` या `MSSQLLoader.lazy_load()` के साथ Langchain दस्तावेज़ लोड करें। `lazy_load` एक जनरेटर लौटाता है जो केवल इटरेशन के दौरान डेटाबेस से प्रश्न करता है। `MSSQLDocumentSaver` क्लास को इनिशियलाइज़ करने के लिए आपको निम्नलिखित प्रदान करना होगा:

1. `engine` - एक `MSSQLEngine` इंजन का एक इंस्टेंस।
2. `table_name` - Cloud SQL डेटाबेस में Langchain दस्तावेज़ को संग्रहित करने के लिए टेबल का नाम।

```python
from langchain_google_cloud_sql_mssql import MSSQLLoader

loader = MSSQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.lazy_load()
for doc in docs:
    print("Loaded documents:", doc)
```

### डॉक्यूमेंट्स को क्वेरी के माध्यम से लोड करें

टेबल से डॉक्यूमेंट्स लोड करने के अलावा, हम SQL क्वेरी से उत्पन्न व्यू से भी डॉक्यूमेंट्स लोड कर सकते हैं। उदाहरण के लिए:

```python
from langchain_google_cloud_sql_mssql import MSSQLLoader

loader = MSSQLLoader(
    engine=engine,
    query=f"select * from \"{TABLE_NAME}\" where JSON_VALUE(langchain_metadata, '$.fruit_id') = 1;",
)
onedoc = loader.load()
onedoc
```

SQL क्वेरी से उत्पन्न व्यू का स्कीमा डिफ़ॉल्ट टेबल से अलग हो सकता है। ऐसे मामलों में, MSSQLLoader का व्यवहार गैर-डिफ़ॉल्ट स्कीमा वाले टेबल से लोड करने के समान होता है। कृपया [अनुकूलित दस्तावेज़ पृष्ठ सामग्री और मेटाडेटा के साथ दस्तावेज़ लोड करें](#Load-documents-with-customized-document-page-content-&-metadata) खंड देखें।

### दस्तावेज़ हटाएं

`MSSQLDocumentSaver.delete(<documents>)` के साथ MSSQL टेबल से एक सूची के langchain दस्तावेज़ हटाएं।

डिफ़ॉल्ट स्कीमा (page_content, langchain_metadata) वाले टेबल के लिए, हटाने का मानदंड है:

एक `पंक्ति` तब हटाई जानी चाहिए जब एक `दस्तावेज़` सूची में मौजूद हो, जहां

- `document.page_content` बराबर है `पंक्ति[page_content]`
- `document.metadata` बराबर है `पंक्ति[langchain_metadata]`

```python
from langchain_google_cloud_sql_mssql import MSSQLLoader

loader = MSSQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(onedoc)
print("Documents after delete:", loader.load())
```

## उन्नत उपयोग

### अनुकूलित दस्तावेज़ पृष्ठ सामग्री और मेटाडेटा के साथ दस्तावेज़ लोड करें

पहले हम गैर-डिफ़ॉल्ट स्कीमा वाले एक उदाहरण टेबल तैयार करते हैं और इसे कुछ मनमाने डेटा से भर देते हैं।

```python
import sqlalchemy

with engine.connect() as conn:
    conn.execute(sqlalchemy.text(f'DROP TABLE IF EXISTS "{TABLE_NAME}"'))
    conn.commit()
    conn.execute(
        sqlalchemy.text(
            f"""
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[{TABLE_NAME}]') AND type in (N'U'))
                BEGIN
                    CREATE TABLE [dbo].[{TABLE_NAME}](
                        fruit_id INT IDENTITY(1,1) PRIMARY KEY,
                        fruit_name VARCHAR(100) NOT NULL,
                        variety VARCHAR(50),
                        quantity_in_stock INT NOT NULL,
                        price_per_unit DECIMAL(6,2) NOT NULL,
                        organic BIT NOT NULL
                    )
                END
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO "{TABLE_NAME}" (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES
                ('Apple', 'Granny Smith', 150, 0.99, 1),
                ('Banana', 'Cavendish', 200, 0.59, 0),
                ('Orange', 'Navel', 80, 1.29, 1);
            """
        )
    )
    conn.commit()
```

यदि हम अभी भी इस उदाहरण टेबल से `MSSQLLoader` के डिफ़ॉल्ट पैरामीटर के साथ langchain दस्तावेज़ लोड करते हैं, तो लोड किए गए दस्तावेज़ों का `page_content` टेबल का पहला कॉलम होगा, और `metadata` सभी अन्य कॉलमों के कीय-मूल्य युग्मों से बनेगा।

```python
loader = MSSQLLoader(
    engine=engine,
    table_name=TABLE_NAME,
)
loader.load()
```

हम `MSSQLLoader` को इनिशियलाइज़ करते समय `content_columns` और `metadata_columns` सेट करके लोड करने के लिए वांछित सामग्री और मेटाडेटा निर्दिष्ट कर सकते हैं।

1. `content_columns`: दस्तावेज़ के `page_content` में लिखने के लिए कॉलम।
2. `metadata_columns`: दस्तावेज़ के `metadata` में लिखने के लिए कॉलम।

उदाहरण के लिए यहां, `content_columns` में कॉलमों के मान को एक स्पेस-अलग किया हुआ स्ट्रिंग के रूप में जोड़ा जाएगा, जो लोड किए गए दस्तावेज़ों का `page_content` होगा, और `metadata` में केवल `metadata_columns` में निर्दिष्ट कॉलमों के कीय-मूल्य युग्म होंगे।

```python
loader = MSSQLLoader(
    engine=engine,
    table_name=TABLE_NAME,
    content_columns=[
        "variety",
        "quantity_in_stock",
        "price_per_unit",
        "organic",
    ],
    metadata_columns=["fruit_id", "fruit_name"],
)
loader.load()
```

### अनुकूलित पृष्ठ सामग्री और मेटाडेटा के साथ दस्तावेज़ सहेजें

अनुकूलित मेटाडेटा फ़ील्ड वाले टेबल में langchain दस्तावेज़ सहेजने के लिए, हमें पहले `MSSQLEngine.init_document_table()` के माध्यम से ऐसा टेबल बनाना होगा, और हम चाहते हैं कि इसमें `metadata_columns` की सूची हो। इस उदाहरण में, बनाया गया टेबल में निम्नलिखित टेबल कॉलम होंगे:

- description (type: text): फल का विवरण संग्रहित करने के लिए।
- fruit_name (type text): फल का नाम संग्रहित करने के लिए।
- organic (type tinyint(1)): यह बताने के लिए कि क्या फल जैविक है।
- other_metadata (type: JSON): फल के अन्य मेटाडेटा जानकारी संग्रहित करने के लिए।

हम `MSSQLEngine.init_document_table()` के साथ निम्नलिखित पैरामीटर का उपयोग कर सकते हैं ताकि टेबल बना सकें:

1. `table_name`: Cloud SQL डेटाबेस में langchain दस्तावेज़ को संग्रहित करने के लिए टेबल का नाम।
2. `metadata_columns`: मेटाडेटा कॉलम की सूची `sqlalchemy.Column` बताती है जिन्हें हमें चाहिए।
3. `content_column`: langchain दस्तावेज़ के `page_content` को संग्रहित करने के लिए कॉलम का नाम। डिफ़ॉल्ट: `page_content`।
4. `metadata_json_column`: langchain दस्तावेज़ के अतिरिक्त `metadata` को संग्रहित करने के लिए JSON कॉलम का नाम। डिफ़ॉल्ट: `langchain_metadata`।

```python
engine.init_document_table(
    TABLE_NAME,
    metadata_columns=[
        sqlalchemy.Column(
            "fruit_name",
            sqlalchemy.UnicodeText,
            primary_key=False,
            nullable=True,
        ),
        sqlalchemy.Column(
            "organic",
            sqlalchemy.Boolean,
            primary_key=False,
            nullable=True,
        ),
    ],
    content_column="description",
    metadata_json_column="other_metadata",
    overwrite_existing=True,
)
```

`MSSQLDocumentSaver.add_documents(<documents>)` के साथ दस्तावेज़ सहेजें। जैसा कि इस उदाहरण में देखा जा सकता है,

- `document.page_content` को `description` कॉलम में सहेजा जाएगा।
- `document.metadata.fruit_name` को `fruit_name` कॉलम में सहेजा जाएगा।
- `document.metadata.organic` को `organic` कॉलम में सहेजा जाएगा।
- `document.metadata.fruit_id` को JSON प्रारूप में `other_metadata` कॉलम में सहेजा जाएगा।

```python
test_docs = [
    Document(
        page_content="Granny Smith 150 0.99",
        metadata={"fruit_id": 1, "fruit_name": "Apple", "organic": 1},
    ),
]
saver = MSSQLDocumentSaver(
    engine=engine,
    table_name=TABLE_NAME,
    content_column="description",
    metadata_json_column="other_metadata",
)
saver.add_documents(test_docs)
```

```python
with engine.connect() as conn:
    result = conn.execute(sqlalchemy.text(f'select * from "{TABLE_NAME}";'))
    print(result.keys())
    print(result.fetchall())
```

### अनुकूलित पृष्ठ सामग्री और मेटाडेटा के साथ दस्तावेज़ हटाएं

हम `MSSQLDocumentSaver.delete(<documents>)` के माध्यम से अनुकूलित मेटाडेटा कॉलम वाले टेबल से भी दस्तावेज़ हटा सकते हैं। हटाने का मानदंड है:

एक `पंक्ति` तब हटाई जानी चाहिए जब एक `दस्तावेज़` सूची में मौजूद हो, जहां

- `document.page_content` बराबर है `पंक्ति[page_content]`
- प्रत्येक मेटाडेटा फ़ील्ड `k` के लिए `document.metadata`
    - `document.metadata[k]` बराबर है `पंक्ति[k]` या `document.metadata[k]` बराबर है `पंक्ति[langchain_metadata][k]`
- `document.metadata` में मौजूद न होने वाली कोई अतिरिक्त मेटाडेटा फ़ील्ड `पंक्ति` में मौजूद नहीं है।

```python
loader = MSSQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(docs)
print("Documents after delete:", loader.load())
```
