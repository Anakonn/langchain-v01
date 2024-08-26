---
translated: true
---

यह कनेक्टर-विशिष्ट लोडर डिप्रीकेट हो गया है। कृपया [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) का उपयोग करें।

>[Airbyte](https://github.com/airbytehq/airbyte) एक ईटीएल पाइपलाइन के लिए एक डेटा एकीकरण प्लेटफ़ॉर्म है जो एपीआई, डेटाबेस और फ़ाइलों से डेटा वेयरहाउस और लेक्स में जाता है। इसके पास डेटा वेयरहाउस और डेटाबेस के सबसे बड़े कैटलॉग के ईटीएल कनेक्टर हैं।

यह लोडर गोंग कनेक्टर को एक दस्तावेज़ लोडर के रूप में एक्सपोज़ करता है, जिससे आप विभिन्न गोंग ऑब्जेक्ट्स को दस्तावेज़ के रूप में लोड कर सकते हैं।

## इंस्टॉलेशन

पहले, आपको `airbyte-source-gong` पायथन पैकेज इंस्टॉल करना होगा।

```python
%pip install --upgrade --quiet  airbyte-source-gong
```

## उदाहरण

[Airbyte दस्तावेज़ पृष्ठ](https://docs.airbyte.com/integrations/sources/gong/) पर जाकर रीडर कॉन्फ़िगर करने के बारे में जानकारी देखें।
कॉन्फ़िग ऑब्जेक्ट का JSON स्कीमा जिसका पालन करना चाहिए, GitHub पर पाया जा सकता है: [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-gong/source_gong/spec.yaml](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-gong/source_gong/spec.yaml)।

सामान्य आकार इस तरह दिखता है:

```python
{
  "access_key": "<access key name>",
  "access_key_secret": "<access key secret>",
  "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
}
```

डिफ़ॉल्ट रूप से सभी फ़ील्ड मेटाडेटा में संग्रहीत होते हैं और पाठ को खाली स्ट्रिंग सेट किया जाता है। रीडर द्वारा लौटाए गए दस्तावेजों को ट्रांसफ़ॉर्म करके दस्तावेज़ का पाठ्य निर्मित करें।

```python
from langchain_community.document_loaders.airbyte import AirbyteGongLoader

config = {
    # your gong configuration
}

loader = AirbyteGongLoader(
    config=config, stream_name="calls"
)  # check the documentation linked above for a list of all streams
```

अब आप दस्तावेज़ को सामान्य तरीके से लोड कर सकते हैं।

```python
docs = loader.load()
```

क्योंकि `load` एक सूची लौटाता है, यह तब तक ब्लॉक करेगा जब तक सभी दस्तावेज़ लोड नहीं हो जाते। इस प्रक्रिया पर बेहतर नियंत्रण प्राप्त करने के लिए, आप `lazy_load` विधि का भी उपयोग कर सकते हैं जो एक इटरेटर लौटाता है:

```python
docs_iterator = loader.lazy_load()
```

ध्यान रखें कि डिफ़ॉल्ट रूप से पृष्ठ सामग्री खाली होती है और मेटाडेटा ऑब्जेक्ट में रिकॉर्ड से सभी जानकारी होती है। दस्तावेज़ों को प्रोसेस करने के लिए, आधार लोडर से अनुरासित एक वर्ग बनाएं और खुद `_handle_records` विधि को लागू करें:

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)


loader = AirbyteGongLoader(
    config=config, record_handler=handle_record, stream_name="calls"
)
docs = loader.load()
```

## इनक्रीमेंटल लोड

कुछ स्ट्रीम्स इनक्रीमेंटल लोडिंग की अनुमति देते हैं, इसका मतलब है कि स्रोत सिंक किए गए रिकॉर्डों को ट्रैक करता है और उन्हें फिर से लोड नहीं करता है। यह उन स्रोतों के लिए उपयोगी है जिनमें बहुत अधिक डेटा है और बार-बार अपडेट होता है।

इसका लाभ उठाने के लिए, लोडर के `last_state` गुण को संग्रहीत करें और लोडर बनाते समय उसे पास करें। यह सुनिश्चित करेगा कि केवल नए रिकॉर्ड लोड किए जाएं।

```python
last_state = loader.last_state  # store safely

incremental_loader = AirbyteGongLoader(
    config=config, stream_name="calls", state=last_state
)

new_docs = incremental_loader.load()
```
