---
translated: true
---

# Google Cloud Document AI

Document AI गूगल क्लाउड का एक दस्तावेज़ समझने का प्लेटफ़ॉर्म है जो अव्यवस्थित डेटा को दस्तावेजों से संरचित डेटा में बदलता है, जिससे इसे समझना, विश्लेषण करना और उपभोग करना आसान हो जाता है।

अधिक जानें:

- [Document AI अवलोकन](https://cloud.google.com/document-ai/docs/overview)
- [Document AI वीडियो और प्रयोगशालाएं](https://cloud.google.com/document-ai/docs/videos)
- [इसे आज़माएं!](https://cloud.google.com/document-ai/docs/drag-and-drop)

मॉड्यूल में गूगल क्लाउड से DocAI पर आधारित एक `PDF` पार्सर शामिल है।

इस पार्सर का उपयोग करने के लिए आपको दो लाइब्रेरी स्थापित करनी होगी:

```python
%pip install --upgrade --quiet  langchain-google-community[docai]
```

पहले, आपको एक Google Cloud Storage (GCS) बकेट सेट अप करना होगा और यहां वर्णित तरीके से अपना स्वयं का ऑप्टिकल करैक्टर रिकग्निशन (OCR) प्रोसेसर बनाना होगा: https://cloud.google.com/document-ai/docs/create-processor

`GCS_OUTPUT_PATH` को GCS पर एक फ़ोल्डर पथ (` gs://` से शुरू होने वाला) होना चाहिए और `PROCESSOR_NAME` को `projects/PROJECT_NUMBER/locations/LOCATION/processors/PROCESSOR_ID` या `projects/PROJECT_NUMBER/locations/LOCATION/processors/PROCESSOR_ID/processorVersions/PROCESSOR_VERSION_ID` जैसा दिखना चाहिए। आप इसे या तो प्रोग्रामातिक रूप से प्राप्त कर सकते हैं या गूगल क्लाउड कंसोल में `प्रोसेसर विवरण` टैब के `पूर्वानुमान अंतःबिंदु` अनुभाग से कॉपी कर सकते हैं।

```python
GCS_OUTPUT_PATH = "gs://BUCKET_NAME/FOLDER_PATH"
PROCESSOR_NAME = "projects/PROJECT_NUMBER/locations/LOCATION/processors/PROCESSOR_ID"
```

```python
from langchain_core.document_loaders.blob_loaders import Blob
from langchain_google_community import DocAIParser
```

अब, एक `DocAIParser` बनाएं।

```python
parser = DocAIParser(
    location="us", processor_name=PROCESSOR_NAME, gcs_output_path=GCS_OUTPUT_PATH
)
```

इस उदाहरण के लिए, आप एक सार्वजनिक GCS बकेट में अपलोड किए गए एक Alphabet कमाई रिपोर्ट का उपयोग कर सकते हैं।

[2022Q1_alphabet_earnings_release.pdf](https://storage.googleapis.com/cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs/2022Q1_alphabet_earnings_release.pdf)

दस्तावेज़ को `lazy_parse()` विधि में पास करें।

```python
blob = Blob(
    path="gs://cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs/2022Q1_alphabet_earnings_release.pdf"
)
```

हमें प्रति पृष्ठ एक दस्तावेज़ मिलेगा, कुल 11 दस्तावेज़।

```python
docs = list(parser.lazy_parse(blob))
print(len(docs))
```

```output
11
```

आप एक-एक करके एक ब्लॉब का अंत-से-अंत पार्सिंग कर सकते हैं। यदि आपके पास कई दस्तावेज़ हैं, तो उन्हें एक साथ बैच करना और शायद पार्सिंग को परिणामों को संभालने से अलग करना एक बेहतर दृष्टिकोण हो सकता है।

```python
operations = parser.docai_parse([blob])
print([op.operation.name for op in operations])
```

```output
['projects/543079149601/locations/us/operations/16447136779727347991']
```

आप यह जांच सकते हैं कि क्या ऑपरेशन पूरे हो गए हैं:

```python
parser.is_running(operations)
```

```output
True
```

और जब वे पूरे हो जाएं, तो आप परिणामों को पार्स कर सकते हैं:

```python
parser.is_running(operations)
```

```output
False
```

```python
results = parser.get_results(operations)
print(results[0])
```

```output
DocAIParsingResults(source_path='gs://vertex-pgt/examples/goog-exhibit-99-1-q1-2023-19.pdf', parsed_path='gs://vertex-pgt/test/run1/16447136779727347991/0')
```

और अब हम पार्स किए गए परिणामों से दस्तावेज़ जनरेट कर सकते हैं:

```python
docs = list(parser.parse_from_results(results))
```

```python
print(len(docs))
```

```output
11
```
