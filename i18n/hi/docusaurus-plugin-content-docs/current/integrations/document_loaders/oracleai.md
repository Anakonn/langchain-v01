---
translated: true
---

# ओरेकल एआई वेक्टर सर्च: दस्तावेज़ प्रोसेसिंग

ओरेकल एआई वेक्टर सर्च कृत्रिम बुद्धिमत्ता (एआई) कार्यभार के लिए डिज़ाइन किया गया है जो आपको डेटा को कीवर्ड के बजाय अर्थशास्त्र के आधार पर क्वेरी करने की अनुमति देता है। ओरेकल एआई वेक्टर सर्च का सबसे बड़ा लाभ यह है कि अनरचित डेटा पर अर्थशास्त्रीय खोज को व्यावसायिक डेटा पर रिलेशनल खोज के साथ एक ही सिस्टम में जोड़ा जा सकता है। यह न केवल शक्तिशाली है, बल्कि महत्वपूर्ण रूप से अधिक प्रभावी भी है क्योंकि आपको एक विशेषज्ञ वेक्टर डेटाबेस जोड़ने की आवश्यकता नहीं है, जिससे कई प्रणालियों के बीच डेटा टुकड़ेबंदी की समस्या समाप्त हो जाती है।

इस गाइड में ओरेकल एआई वेक्टर सर्च के भीतर दस्तावेज़ प्रोसेसिंग क्षमताओं का उपयोग करके दस्तावेज़ लोड और टुकड़ा करने का प्रदर्शन किया गया है।

### पूर्वापेक्षाएं

कृपया ओरेकल एआई वेक्टर सर्च के साथ लैंगचेन का उपयोग करने के लिए ओरेकल पायथन क्लाइंट ड्राइवर स्थापित करें।

```python
# pip install oracledb
```

### ओरेकल डेटाबेस से कनेक्ट करें

निम्नलिखित नमूना कोड ओरेकल डेटाबेस से कनेक्ट करने का तरीका दिखाएगा।

```python
import sys

import oracledb

# please update with your username, password, hostname and service_name
username = "<username>"
password = "<password>"
dsn = "<hostname>/<service_name>"

try:
    conn = oracledb.connect(user=username, password=password, dsn=dsn)
    print("Connection successful!")
except Exception as e:
    print("Connection failed!")
    sys.exit(1)
```

अब आइए कुछ नमूना दस्तावेज़ डालने के लिए एक तालिका बनाएं।

```python
try:
    cursor = conn.cursor()

    drop_table_sql = """drop table if exists demo_tab"""
    cursor.execute(drop_table_sql)

    create_table_sql = """create table demo_tab (id number, data clob)"""
    cursor.execute(create_table_sql)

    insert_row_sql = """insert into demo_tab values (:1, :2)"""
    rows_to_insert = [
        (
            1,
            "If the answer to any preceding questions is yes, then the database stops the search and allocates space from the specified tablespace; otherwise, space is allocated from the database default shared temporary tablespace.",
        ),
        (
            2,
            "A tablespace can be online (accessible) or offline (not accessible) whenever the database is open.\nA tablespace is usually online so that its data is available to users. The SYSTEM tablespace and temporary tablespaces cannot be taken offline.",
        ),
        (
            3,
            "The database stores LOBs differently from other data types. Creating a LOB column implicitly creates a LOB segment and a LOB index. The tablespace containing the LOB segment and LOB index, which are always stored together, may be different from the tablespace containing the table.\nSometimes the database can store small amounts of LOB data in the table itself rather than in a separate LOB segment.",
        ),
    ]
    cursor.executemany(insert_row_sql, rows_to_insert)

    conn.commit()

    print("Table created and populated.")
    cursor.close()
except Exception as e:
    print("Table creation failed.")
    cursor.close()
    conn.close()
    sys.exit(1)
```

### दस्तावेज़ लोड करें

उपयोगकर्ता ओरेकल डेटाबेस या फ़ाइल सिस्टम या दोनों से दस्तावेज़ लोड कर सकते हैं। उन्हें केवल लोडर पैरामीटर को तदनुसार सेट करना होगा। इन पैरामीटरों के बारे में पूरी जानकारी के लिए कृपया ओरेकल एआई वेक्टर सर्च गाइड बुक देखें।

OracleDocLoader का उपयोग करने का मुख्य लाभ यह है कि यह 150+ अलग-अलग फ़ाइल प्रारूपों को संभाल सकता है। आपको अलग-अलग फ़ाइल प्रारूपों के लिए अलग-अलग प्रकार के लोडर का उपयोग नहीं करना होगा। हम जिन प्रारूपों का समर्थन करते हैं, उनकी सूची यहां है: [ओरेकल टेक्स्ट समर्थित दस्तावेज़ प्रारूप](https://docs.oracle.com/en/database/oracle/oracle-database/23/ccref/oracle-text-supported-document-formats.html)

निम्नलिखित नमूना कोड यह दिखाएगा कि यह कैसे किया जाता है:

```python
from langchain_community.document_loaders.oracleai import OracleDocLoader
from langchain_core.documents import Document

"""
# loading a local file
loader_params = {}
loader_params["file"] = "<file>"

# loading from a local directory
loader_params = {}
loader_params["dir"] = "<directory>"
"""

# loading from Oracle Database table
loader_params = {
    "owner": "<owner>",
    "tablename": "demo_tab",
    "colname": "data",
}

""" load the docs """
loader = OracleDocLoader(conn=conn, params=loader_params)
docs = loader.load()

""" verify """
print(f"Number of docs loaded: {len(docs)}")
# print(f"Document-0: {docs[0].page_content}") # content
```

### दस्तावेज़ विभाजित करें

दस्तावेज़ अलग-अलग आकारों में हो सकते हैं: छोटे, मध्यम, बड़े या बहुत बड़े। उपयोगकर्ता अपने दस्तावेज़ों को छोटे टुकड़ों में विभाजित/टुकड़ा करना पसंद करते हैं ताकि एम्बेडिंग बनाई जा सके। उपयोगकर्ता इन विभाजन अनुकूलनों में से कई कर सकते हैं। इन पैरामीटरों के बारे में पूरी जानकारी के लिए कृपया ओरेकल एआई वेक्टर सर्च गाइड बुक देखें।

निम्नलिखित नमूना कोड यह दिखाएगा कि यह कैसे किया जाता है:

```python
from langchain_community.document_loaders.oracleai import OracleTextSplitter
from langchain_core.documents import Document

"""
# Some examples
# split by chars, max 500 chars
splitter_params = {"split": "chars", "max": 500, "normalize": "all"}

# split by words, max 100 words
splitter_params = {"split": "words", "max": 100, "normalize": "all"}

# split by sentence, max 20 sentences
splitter_params = {"split": "sentence", "max": 20, "normalize": "all"}
"""

# split by default parameters
splitter_params = {"normalize": "all"}

# get the splitter instance
splitter = OracleTextSplitter(conn=conn, params=splitter_params)

list_chunks = []
for doc in docs:
    chunks = splitter.split_text(doc.page_content)
    list_chunks.extend(chunks)

""" verify """
print(f"Number of Chunks: {len(list_chunks)}")
# print(f"Chunk-0: {list_chunks[0]}") # content
```

### एंड टू एंड डेमो

कृपया हमारे पूर्ण डेमो गाइड [ओरेकल एआई वेक्टर सर्च एंड-टू-एंड डेमो गाइड](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.md) देखें ताकि आप ओरेकल एआई वेक्टर सर्च की मदद से एक एंड-टू-एंड RAG पाइपलाइन बना सकें।
