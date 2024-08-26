---
translated: true
---

# Airbyte CDK (डिप्रीकेटेड)

नोट: `AirbyteCDKLoader` डिप्रीकेटेड है। कृपया [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) का उपयोग करें।

>[Airbyte](https://github.com/airbytehq/airbyte) एक डेटा एकीकरण प्लेटफॉर्म है जो API, डेटाबेस और फ़ाइलों से वेयरहाउस और झीलों तक के ELT पाइपलाइन के लिए है। इसके पास डेटा वेयरहाउस और डेटाबेस के सबसे बड़े कैटलॉग के ELT कनेक्टर हैं।

कई स्रोत कनेक्टर [Airbyte CDK](https://docs.airbyte.com/connector-development/cdk-python/) का उपयोग करके कार्यान्वित किए गए हैं। यह लोडर किसी भी इन कनेक्टरों को चलाने और डेटा को दस्तावेज़ के रूप में वापस लाने की अनुमति देता है।

## इंस्टॉलेशन

पहले, आपको `airbyte-cdk` पायथन पैकेज इंस्टॉल करना होगा।

```python
%pip install --upgrade --quiet  airbyte-cdk
```

फिर, या तो [Airbyte Github रिपॉजिटरी](https://github.com/airbytehq/airbyte/tree/master/airbyte-integrations/connectors) से किसी मौजूदा कनेक्टर को इंस्टॉल करें या [Airbyte CDK](https://docs.airbyte.io/connector-development/connector-development) का उपयोग करके अपना खुद का कनेक्टर बनाएं।

उदाहरण के लिए, Github कनेक्टर को इंस्टॉल करने के लिए, चलाएं

```python
%pip install --upgrade --quiet  "source_github@git+https://github.com/airbytehq/airbyte.git@master#subdirectory=airbyte-integrations/connectors/source-github"
```

कुछ स्रोत नियमित पैकेज के रूप में PyPI पर भी प्रकाशित किए जाते हैं।

## उदाहरण

अब आप आयातित स्रोत पर आधारित `AirbyteCDKLoader` बना सकते हैं। यह कनेक्टर के लिए `config` ऑब्जेक्ट लेता है। आपको भी नाम द्वारा रिकॉर्ड लेने के लिए स्ट्रीम (`stream_name`) का चयन करना होगा। कॉन्फ़िगरेशन ऑब्जेक्ट और उपलब्ध स्ट्रीम के बारे में अधिक जानकारी के लिए कनेक्टर्स के दस्तावेज़ीकरण पृष्ठ और विनिर्देश परिभाषा देखें। Github कनेक्टर के लिए ये हैं:

* [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-github/source_github/spec.json](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-github/source_github/spec.json)।
* [https://docs.airbyte.com/integrations/sources/github/](https://docs.airbyte.com/integrations/sources/github/)

```python
from langchain_community.document_loaders.airbyte import AirbyteCDKLoader
from source_github.source import SourceGithub  # plug in your own source here

config = {
    # your github configuration
    "credentials": {"api_url": "api.github.com", "personal_access_token": "<token>"},
    "repository": "<repo>",
    "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
}

issues_loader = AirbyteCDKLoader(
    source_class=SourceGithub, config=config, stream_name="issues"
)
```

अब आप दस्तावेज़ को सामान्य तरीके से लोड कर सकते हैं।

```python
docs = issues_loader.load()
```

क्योंकि `load` एक सूची वापस देता है, यह तब तक ब्लॉक करेगा जब तक कि सभी दस्तावेज़ लोड नहीं हो जाते। इस प्रक्रिया पर बेहतर नियंत्रण प्राप्त करने के लिए, आप `lazy_load` विधि का भी उपयोग कर सकते हैं जो एक इटरेटर वापस देता है:

```python
docs_iterator = issues_loader.lazy_load()
```

ध्यान रखें कि डिफ़ॉल्ट रूप से पृष्ठ सामग्री खाली होती है और मेटाडेटा ऑब्जेक्ट रिकॉर्ड से सभी जानकारी को संग्रहीत करता है। दस्तावेज़ को अलग तरीके से बनाने के लिए, लोडर बनाते समय एक `record_handler` फ़ंक्शन पास करें:

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(
        page_content=record.data["title"] + "\n" + (record.data["body"] or ""),
        metadata=record.data,
    )


issues_loader = AirbyteCDKLoader(
    source_class=SourceGithub,
    config=config,
    stream_name="issues",
    record_handler=handle_record,
)

docs = issues_loader.load()
```

## इनक्रीमेंटल लोड

कुछ स्ट्रीम इनक्रीमेंटल लोडिंग की अनुमति देते हैं, यह मतलब है कि स्रोत सिंक किए गए रिकॉर्ड को ट्रैक करता है और उन्हें फिर से नहीं लोड करता है। यह उन स्रोतों के लिए उपयोगी है जिनमें बहुत अधिक डेटा है और बार-बार अपडेट किया जाता है।

इसका लाभ उठाने के लिए, लोडर की `last_state` गुण को संग्रहीत करें और इसे लोडर बनाते समय फिर से पास करें। यह सुनिश्चित करेगा कि केवल नए रिकॉर्ड लोड किए जाएं।

```python
last_state = issues_loader.last_state  # store safely

incremental_issue_loader = AirbyteCDKLoader(
    source_class=SourceGithub, config=config, stream_name="issues", state=last_state
)

new_docs = incremental_issue_loader.load()
```
