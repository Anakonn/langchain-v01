---
translated: true
---

यह कनेक्टर-विशिष्ट लोडर डिप्रीकेट है। कृपया [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) का उपयोग करें।

>[Airbyte](https://github.com/airbytehq/airbyte) एक डेटा एकीकरण प्लेटफॉर्म है जो API, डेटाबेस और फ़ाइलों से वेयरहाउस और लेक्स तक के ELT पाइपलाइन के लिए है। इसके पास डेटा वेयरहाउस और डेटाबेस के सबसे बड़े कैटलॉग के ELT कनेक्टर हैं।

यह लोडर Typeform कनेक्टर को एक दस्तावेज़ लोडर के रूप में एक्सपोज़ करता है, जिससे आप विभिन्न Typeform ऑब्जेक्ट्स को दस्तावेज़ के रूप में लोड कर सकते हैं।

## इंस्टॉलेशन

पहले, आपको `airbyte-source-typeform` पायथन पैकेज इंस्टॉल करना होगा।

```python
%pip install --upgrade --quiet  airbyte-source-typeform
```

## उदाहरण

[Airbyte documentation page](https://docs.airbyte.com/integrations/sources/typeform/) पर जाकर रीडर कॉन्फ़िगर करने के बारे में जानकारी प्राप्त करें।
कॉन्फ़िग ऑब्जेक्ट के लिए JSON स्कीमा को Github पर पाया जा सकता है: [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-typeform/source_typeform/spec.json](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-typeform/source_typeform/spec.json)।

सामान्य आकार इस प्रकार दिखता है:

```python
{
  "credentials": {
    "auth_type": "Private Token",
    "access_token": "<your auth token>"
  },
  "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
  "form_ids": ["<id of form to load records for>"] # if omitted, records from all forms will be loaded
}
```

डिफ़ॉल्ट रूप से सभी फ़ील्ड मेटाडेटा में संग्रहीत होते हैं और पाठ को खाली स्ट्रिंग सेट किया जाता है। रीडर द्वारा लौटाए गए दस्तावेजों को ट्रांसफ़ॉर्म करके दस्तावेज़ का पाठ बनाएं।

```python
from langchain_community.document_loaders.airbyte import AirbyteTypeformLoader

config = {
    # your typeform configuration
}

loader = AirbyteTypeformLoader(
    config=config, stream_name="forms"
)  # check the documentation linked above for a list of all streams
```

अब आप दस्तावेज़ को सामान्य तरीके से लोड कर सकते हैं।

```python
docs = loader.load()
```

`load` एक सूची लौटाता है, इसलिए यह सभी दस्तावेज़ लोड होने तक रोक देगा। इस प्रक्रिया पर बेहतर नियंत्रण प्राप्त करने के लिए, आप `lazy_load` विधि का भी उपयोग कर सकते हैं जो एक इटरेटर लौटाता है:

```python
docs_iterator = loader.lazy_load()
```

ध्यान रखें कि डिफ़ॉल्ट रूप से पृष्ठ सामग्री खाली होती है और मेटाडेटा ऑब्जेक्ट में रिकॉर्ड से सभी जानकारी होती है। अलग तरह के दस्तावेज़ बनाने के लिए, लोडर बनाते समय एक `record_handler` फ़ंक्शन पास करें:

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)


loader = AirbyteTypeformLoader(
    config=config, record_handler=handle_record, stream_name="forms"
)
docs = loader.load()
```

## इनक्रीमेंटल लोड

कुछ स्ट्रीम्स इनक्रीमेंटल लोडिंग की अनुमति देते हैं, इसका मतलब है कि स्रोत सिंक किए गए रिकॉर्ड को ट्रैक करता है और उन्हें फिर से लोड नहीं करता है। यह उन स्रोतों के लिए उपयोगी है जिनमें बहुत अधिक डेटा है और बार-बार अपडेट होता है।

इसका लाभ उठाने के लिए, लोडर के `last_state` गुण को संग्रहीत करें और लोडर बनाते समय इसे पास करें। इससे सुनिश्चित होगा कि केवल नए रिकॉर्ड लोड किए जाएं।

```python
last_state = loader.last_state  # store safely

incremental_loader = AirbyteTypeformLoader(
    config=config, record_handler=handle_record, stream_name="forms", state=last_state
)

new_docs = incremental_loader.load()
```
