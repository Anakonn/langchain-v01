---
translated: true
---

# Oracle AI Vector Search: एम्बेडिंग्स जनरेट करें

Oracle AI Vector Search कृत्रिम बुद्धिमत्ता (AI) कार्यभार के लिए डिज़ाइन किया गया है जो आपको डेटा को कीवर्ड के बजाय अर्थ के आधार पर क्वेरी करने की अनुमति देता है। Oracle AI Vector Search के सबसे बड़े लाभों में से एक यह है कि अनструक्चर्ड डेटा पर सेमेंटिक खोज को एक ही सिस्टम में व्यावसायिक डेटा पर रिलेशनल खोज के साथ जोड़ा जा सकता है। यह न केवल शक्तिशाली है, बल्कि महत्वपूर्ण रूप से अधिक प्रभावी भी है क्योंकि आपको एक विशेषीकृत वेक्टर डेटाबेस जोड़ने की आवश्यकता नहीं है, जिससे कई सिस्टमों के बीच डेटा टुकड़ीकरण की समस्या समाप्त हो जाती है।

इस गाइड में Oracle AI Vector Search में एम्बेडिंग क्षमताओं का उपयोग करके अपने दस्तावेजों के लिए एम्बेडिंग्स कैसे जनरेट करें, यह दिखाया गया है।

### पूर्वापेक्षाएं

Oracle AI Vector Search के साथ Langchain का उपयोग करने के लिए कृपया Oracle Python क्लाइंट ड्राइवर स्थापित करें।

```python
# pip install oracledb
```

### Oracle डेटाबेस से कनेक्ट करें

निम्नलिखित सैंपल कोड Oracle डेटाबेस से कनेक्ट करने का तरीका दिखाएगा।

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

एम्बेडिंग के लिए, हमारे पास ऐसे प्रदाता विकल्प हैं जिनमें से उपयोगकर्ता चुन सकते हैं जैसे कि डेटाबेस, ocigenai, huggingface, openai जैसे तृतीय पक्ष प्रदाता आदि। यदि उपयोगकर्ता तृतीय पक्ष प्रदाता का उपयोग करने का चुनाव करते हैं, तो उन्हें संबंधित प्रमाणीकरण जानकारी के साथ क्रेडेंशियल बनाना होगा। दूसरी ओर, यदि उपयोगकर्ता 'डेटाबेस' को प्रदाता के रूप में चुनते हैं, तो उन्हें एम्बेडिंग के लिए Oracle डेटाबेस में एक onnx मॉडल लोड करना होगा।

### ONNX मॉडल लोड करें

एम्बेडिंग्स जनरेट करने के लिए, Oracle उपयोगकर्ताओं को चुनने के लिए कुछ प्रदाता विकल्प प्रदान करता है। उपयोगकर्ता 'डेटाबेस' प्रदाता या कुछ तृतीय पक्ष प्रदाताओं जैसे OCIGENAI, HuggingFace आदि का चयन कर सकते हैं।

***नोट*** यदि उपयोगकर्ता डेटाबेस विकल्प का चयन करते हैं, तो उन्हें Oracle डेटाबेस में एक ONNX मॉडल लोड करना होगा। यदि उपयोगकर्ता एम्बेडिंग्स जनरेट करने के लिए तृतीय पक्ष प्रदाता का उपयोग करने का चुनाव करते हैं, तो उन्हें Oracle डेटाबेस में ONNX मॉडल लोड करने की आवश्यकता नहीं है।

ONNX मॉडल का उपयोग करने के एक प्रमुख लाभ यह है कि उपयोगकर्ताओं को अपने डेटा को तृतीय पक्ष को स्थानांतरित करने की आवश्यकता नहीं है। और साथ ही, यह किसी भी नेटवर्क या REST API कॉल को शामिल नहीं करता है, इसलिए यह बेहतर प्रदर्शन प्रदान कर सकता है।

Oracle डेटाबेस में ONNX मॉडल लोड करने के लिए यहां एक सैंपल कोड है:

```python
from langchain_community.embeddings.oracleai import OracleEmbeddings

# please update with your related information
# make sure that you have onnx file in the system
onnx_dir = "DEMO_DIR"
onnx_file = "tinybert.onnx"
model_name = "demo_model"

try:
    OracleEmbeddings.load_onnx_model(conn, onnx_dir, onnx_file, model_name)
    print("ONNX model loaded.")
except Exception as e:
    print("ONNX model loading failed!")
    sys.exit(1)
```

### क्रेडेंशियल बनाएं

दूसरी ओर, यदि उपयोगकर्ता एम्बेडिंग्स जनरेट करने के लिए तृतीय पक्ष प्रदाता का उपयोग करने का चुनाव करते हैं, तो उन्हें तृतीय पक्ष प्रदाता के एंडपॉइंट तक पहुंचने के लिए क्रेडेंशियल बनाना होगा।

***नोट:*** यदि उपयोगकर्ता 'डेटाबेस' प्रदाता का उपयोग करके एम्बेडिंग्स जनरेट करने का चुनाव करते हैं, तो उन्हें कोई भी क्रेडेंशियल बनाने की आवश्यकता नहीं है। यदि उपयोगकर्ता तृतीय पक्ष प्रदाता का उपयोग करने का चुनाव करते हैं, तो उन्हें उपयोग करने के लिए चुने गए तृतीय पक्ष प्रदाता के लिए क्रेडेंशियल बनाना होगा।

यहां एक सैंपल उदाहरण है:

```python
try:
    cursor = conn.cursor()
    cursor.execute(
        """
       declare
           jo json_object_t;
       begin
           -- HuggingFace
           dbms_vector_chain.drop_credential(credential_name  => 'HF_CRED');
           jo := json_object_t();
           jo.put('access_token', '<access_token>');
           dbms_vector_chain.create_credential(
               credential_name   =>  'HF_CRED',
               params            => json(jo.to_string));

           -- OCIGENAI
           dbms_vector_chain.drop_credential(credential_name  => 'OCI_CRED');
           jo := json_object_t();
           jo.put('user_ocid','<user_ocid>');
           jo.put('tenancy_ocid','<tenancy_ocid>');
           jo.put('compartment_ocid','<compartment_ocid>');
           jo.put('private_key','<private_key>');
           jo.put('fingerprint','<fingerprint>');
           dbms_vector_chain.create_credential(
               credential_name   => 'OCI_CRED',
               params            => json(jo.to_string));
       end;
       """
    )
    cursor.close()
    print("Credentials created.")
except Exception as ex:
    cursor.close()
    raise
```

### एम्बेडिंग्स जनरेट करें

Oracle AI Vector Search एम्बेडिंग्स जनरेट करने के कई तरीके प्रदान करता है। उपयोगकर्ता Oracle डेटाबेस में एक ONNX एम्बेडिंग मॉडल लोड कर सकते हैं और उसका उपयोग एम्बेडिंग्स जनरेट करने के लिए कर सकते हैं या कुछ तृतीय पक्ष API एंडपॉइंट का उपयोग कर सकते हैं। कृपया इन पैरामीटरों के बारे में पूरी जानकारी के लिए Oracle AI Vector Search गाइडबुक देखें।

***नोट:*** उपयोगकर्ताओं को 'डेटाबेस' प्रदाता (यानी ONNX मॉडल का उपयोग करना) के अलावा किसी भी तृतीय पक्ष एम्बेडिंग जनरेशन प्रदाताओं का उपयोग करने के लिए प्रॉक्सी सेट करना पड़ सकता है।

```python
# proxy to be used when we instantiate summary and embedder object
proxy = "<proxy>"
```

निम्नलिखित सैंपल कोड एम्बेडिंग्स कैसे जनरेट करें, यह दिखाएगा:

```python
from langchain_community.embeddings.oracleai import OracleEmbeddings
from langchain_core.documents import Document

"""
# using ocigenai
embedder_params = {
    "provider": "ocigenai",
    "credential_name": "OCI_CRED",
    "url": "https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/20231130/actions/embedText",
    "model": "cohere.embed-english-light-v3.0",
}

# using huggingface
embedder_params = {
    "provider": "huggingface",
    "credential_name": "HF_CRED",
    "url": "https://api-inference.huggingface.co/pipeline/feature-extraction/",
    "model": "sentence-transformers/all-MiniLM-L6-v2",
    "wait_for_model": "true"
}
"""

# using ONNX model loaded to Oracle Database
embedder_params = {"provider": "database", "model": "demo_model"}

# Remove proxy if not required
embedder = OracleEmbeddings(conn=conn, params=embedder_params, proxy=proxy)
embed = embedder.embed_query("Hello World!")

""" verify """
print(f"Embedding generated by OracleEmbeddings: {embed}")
```

### एंड टू एंड डेमो

कृपया हमारे पूर्ण डेमो गाइड [Oracle AI Vector Search End-to-End Demo Guide](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.md) देखें ताकि Oracle AI Vector Search की मदद से एक एंड टू एंड RAG पाइपलाइन बना सकें।
