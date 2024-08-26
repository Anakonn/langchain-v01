---
translated: true
---

यह दस्तावेज़ का एक हिस्सा है।

# TiDB

> [TiDB Cloud](https://tidbcloud.com/), एक व्यापक डेटाबेस-एज-ए-सर्विस (DBaaS) समाधान है, जो समर्पित और सर्वरलेस विकल्प प्रदान करता है। TiDB Serverless अब MySQL परिदृश्य में एक अंतर्निहित वेक्टर खोज को एकीकृत कर रहा है। इस सुधार के साथ, आप नए डेटाबेस या अतिरिक्त तकनीकी स्टैक की आवश्यकता के बिना TiDB Serverless का उपयोग करके सुचारु रूप से AI अनुप्रयोग विकसित कर सकते हैं। निजी बीटा के लिए प्रतीक्षा सूची में शामिल होकर इसका अनुभव करें https://tidb.cloud/ai।

यह नोटबुक बताता है कि `TiDBLoader` का उपयोग करके langchain में TiDB से डेटा कैसे लोड किया जाए।

## पूर्वापेक्षाएं

`TiDBLoader` का उपयोग करने से पहले, हम निम्नलिखित निर्भरताओं को स्थापित करेंगे:

```python
%pip install --upgrade --quiet langchain
```

फिर, हम TiDB से कनेक्शन कॉन्फ़िगर करेंगे। इस नोटबुक में, हम TiDB Cloud द्वारा प्रदान किए गए मानक कनेक्शन विधि का पालन करेंगे ताकि एक सुरक्षित और कुशल डेटाबेस कनेक्शन स्थापित किया जा सके।

```python
import getpass

# copy from tidb cloud console，replace it with your own
tidb_connection_string_template = "mysql+pymysql://<USER>:<PASSWORD>@<HOST>:4000/<DB>?ssl_ca=/etc/ssl/cert.pem&ssl_verify_cert=true&ssl_verify_identity=true"
tidb_password = getpass.getpass("Input your TiDB password:")
tidb_connection_string = tidb_connection_string_template.replace(
    "<PASSWORD>", tidb_password
)
```

## TiDB से डेटा लोड करें

यहां कुछ प्रमुख तर्क हैं जिनका उपयोग आप `TiDBLoader` के व्यवहार को अनुकूलित करने के लिए कर सकते हैं:

- `query` (str): यह TiDB डेटाबेस के खिलाफ निष्पादित किया जाने वाला SQL क्वेरी है। क्वेरी को ऐसा होना चाहिए कि वह आपके `Document` ऑब्जेक्ट में लोड करने के लिए डेटा का चयन करे।
    उदाहरण के लिए, आप `"SELECT * FROM my_table"` जैसी क्वेरी का उपयोग कर सकते हैं ताकि `my_table` से सभी डेटा प्राप्त किया जा सके।

- `page_content_columns` (Optional[List[str]]): प्रत्येक `Document` ऑब्जेक्ट के `page_content` में शामिल किए जाने वाले कॉलम नामों की सूची निर्दिष्ट करता है।
    यदि `None` (डिफ़ॉल्ट) पर सेट किया गया है, तो क्वेरी द्वारा वापस किए गए सभी कॉलम `page_content` में शामिल किए जाएंगे। यह आपको अपने डेटा के विशिष्ट कॉलमों के आधार पर प्रत्येक दस्तावेज़ के सामग्री को अनुकूलित करने में मदद करता है।

- `metadata_columns` (Optional[List[str]]): प्रत्येक `Document` ऑब्जेक्ट के `metadata` में शामिल किए जाने वाले कॉलम नामों की सूची निर्दिष्ट करता है।
    डिफ़ॉल्ट रूप से, यह सूची खाली है, जिसका अर्थ है कि जब तक स्पष्ट रूप से निर्दिष्ट न किया जाए, कोई मेटाडेटा शामिल नहीं होगा। यह प्रत्येक दस्तावेज़ के बारे में अतिरिक्त जानकारी को शामिल करने के लिए उपयोगी है जो मुख्य सामग्री का हिस्सा नहीं है लेकिन प्रसंस्करण या विश्लेषण के लिए अभी भी मूल्यवान है।

```python
from sqlalchemy import Column, Integer, MetaData, String, Table, create_engine

# Connect to the database
engine = create_engine(tidb_connection_string)
metadata = MetaData()
table_name = "test_tidb_loader"

# Create a table
test_table = Table(
    table_name,
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(255)),
    Column("description", String(255)),
)
metadata.create_all(engine)


with engine.connect() as connection:
    transaction = connection.begin()
    try:
        connection.execute(
            test_table.insert(),
            [
                {"name": "Item 1", "description": "Description of Item 1"},
                {"name": "Item 2", "description": "Description of Item 2"},
                {"name": "Item 3", "description": "Description of Item 3"},
            ],
        )
        transaction.commit()
    except:
        transaction.rollback()
        raise
```

```python
from langchain_community.document_loaders import TiDBLoader

# Setup TiDBLoader to retrieve data
loader = TiDBLoader(
    connection_string=tidb_connection_string,
    query=f"SELECT * FROM {table_name};",
    page_content_columns=["name", "description"],
    metadata_columns=["id"],
)

# Load data
documents = loader.load()

# Display the loaded documents
for doc in documents:
    print("-" * 30)
    print(f"content: {doc.page_content}\nmetada: {doc.metadata}")
```

```output
------------------------------
content: name: Item 1
description: Description of Item 1
metada: {'id': 1}
------------------------------
content: name: Item 2
description: Description of Item 2
metada: {'id': 2}
------------------------------
content: name: Item 3
description: Description of Item 3
metada: {'id': 3}
```

```python
test_table.drop(bind=engine)
```
