---
translated: true
---

# ओरेकल ऑटोनोमस डेटाबेस

ओरेकल ऑटोनोमस डेटाबेस एक क्लाउड डेटाबेस है जो डेटाबेस ट्यूनिंग, सुरक्षा, बैकअप, अपडेट और अन्य रूटीन प्रबंधन कार्यों को स्वचालित करने के लिए मशीन लर्निंग का उपयोग करता है।

यह नोटबुक कवर करता है कि ओरेकल ऑटोनोमस डेटाबेस से दस्तावेज कैसे लोड किए जाएं, लोडर कनेक्शन स्ट्रिंग या टीएनएस कॉन्फ़िगरेशन के साथ कनेक्शन का समर्थन करता है।

## पूर्वापेक्षाएं

1. डेटाबेस 'Thin' मोड में चलता है:
   https://python-oracledb.readthedocs.io/en/latest/user_guide/appendix_b.html
2. `pip install oracledb`:
   https://python-oracledb.readthedocs.io/en/latest/user_guide/installation.html

## निर्देश

```python
pip install oracledb
```

```python
from langchain_community.document_loaders import OracleAutonomousDatabaseLoader
from settings import s
```

mutual TLS authentication (mTLS) के साथ, wallet_location और wallet_password कनेक्शन बनाने के लिए आवश्यक हैं, उपयोगकर्ता कनेक्शन स्ट्रिंग या टीएनएस कॉन्फ़िगरेशन विवरण प्रदान करके कनेक्शन बना सकता है।

```python
SQL_QUERY = "select prod_id, time_id from sh.costs fetch first 5 rows only"

doc_loader_1 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    config_dir=s.CONFIG_DIR,
    wallet_location=s.WALLET_LOCATION,
    wallet_password=s.PASSWORD,
    tns_name=s.TNS_NAME,
)
doc_1 = doc_loader_1.load()

doc_loader_2 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    connection_string=s.CONNECTION_STRING,
    wallet_location=s.WALLET_LOCATION,
    wallet_password=s.PASSWORD,
)
doc_2 = doc_loader_2.load()
```

TLS authentication के साथ, wallet_location और wallet_password की आवश्यकता नहीं है।

```python
doc_loader_3 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    config_dir=s.CONFIG_DIR,
    tns_name=s.TNS_NAME,
)
doc_3 = doc_loader_3.load()

doc_loader_4 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    connection_string=s.CONNECTION_STRING,
)
doc_4 = doc_loader_4.load()
```
