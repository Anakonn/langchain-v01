---
translated: true
---

# क्विप

>[क्विप](https://quip.com) एक सहयोगी उत्पादकता सॉफ्टवेयर सूट है जो मोबाइल और वेब के लिए है। यह समूहों को दस्तावेज और स्प्रेडशीट को एक समूह के रूप में बनाने और संपादित करने की अनुमति देता है, आमतौर पर व्यावसायिक उद्देश्यों के लिए।

`क्विप` दस्तावेजों के लिए एक लोडर।

कृपया [यहां](https://quip.com/dev/automation/documentation/current#section/Authentication/Get-Access-to-Quip's-APIs) देखें कि व्यक्तिगत एक्सेस टोकन कैसे प्राप्त करें।

`folder_ids` और/या `thread_ids` की एक सूची निर्दिष्ट करें ताकि संबंधित दस्तावेज़ डॉक्यूमेंट ऑब्जेक्ट्स में लोड किए जा सकें, यदि दोनों निर्दिष्ट किए गए हैं, तो लोडर `folder_ids` पर आधारित सभी `thread_ids` प्राप्त करेगा, `thread_ids` के साथ संयुक्त करेगा, और दोनों सेटों का संयुक्त परिणाम लौटाएगा।

* `folder_id` कैसे जानें?
  क्विप फोल्डर पर जाएं, फोल्डर पर राइट क्लिक करें और लिंक कॉपी करें, लिंक से उपसर्ग निकालें जो `folder_id` होगा। संकेत: `https://example.quip.com/<folder_id>`
* `thread_id` कैसे जानें?
  `thread_id` दस्तावेज़ आईडी है। क्विप दस्तावेज़ पर जाएं, दस्तावेज़ पर राइट क्लिक करें और लिंक कॉपी करें, लिंक से उपसर्ग निकालें जो `thread_id` होगा। संकेत: `https://exmaple.quip.com/<thread_id>`

आप `include_all_folders` को `True` के रूप में भी सेट कर सकते हैं, जो `group_folder_ids` को प्राप्त करेगा।
आप एक बूलियन `include_attachments` भी निर्दिष्ट कर सकते हैं ताकि संलग्नक शामिल हों, यह डिफ़ॉल्ट रूप से `False` पर सेट है, यदि `True` पर सेट किया जाता है, तो सभी संलग्नक डाउनलोड किए जाएंगे और `QuipLoader` टेक्स्ट को संलग्नक से निकालकर `Document` ऑब्जेक्ट में जोड़ देगा। वर्तमान में समर्थित संलग्नक प्रकार हैं: `PDF`, `PNG`, `JPEG/JPG`, `SVG`, `Word` और `Excel`। आप एक बूलियन `include_comments` भी निर्दिष्ट कर सकते हैं ताकि दस्तावेज़ में टिप्पणियां शामिल हों, यह डिफ़ॉल्ट रूप से `False` पर सेट है, यदि `True` पर सेट किया जाता है, तो दस्तावेज़ में सभी टिप्पणियां प्राप्त की जाएंगी और `QuipLoader` उन्हें `Document` ऑब्जेक्ट में जोड़ देगा।

`QuipLoader` का उपयोग करने से पहले सुनिश्चित करें कि आपके पास `quip-api` पैकेज का नवीनतम संस्करण स्थापित है:

```python
%pip install --upgrade --quiet  quip-api
```

## उदाहरण

### व्यक्तिगत एक्सेस टोकन

```python
from langchain_community.document_loaders.quip import QuipLoader

loader = QuipLoader(
    api_url="https://platform.quip.com", access_token="change_me", request_timeout=60
)
documents = loader.load(
    folder_ids={"123", "456"},
    thread_ids={"abc", "efg"},
    include_attachments=False,
    include_comments=False,
)
```
