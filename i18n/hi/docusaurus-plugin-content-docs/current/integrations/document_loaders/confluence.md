---
translated: true
---

# कॉन्फ़्लुएंस

>[कॉन्फ़्लुएंस](https://www.atlassian.com/software/confluence) एक विकि सहयोग प्लेटफ़ॉर्म है जो सभी परियोजना-संबंधित सामग्री को सहेजता और संगठित करता है। `कॉन्फ़्लुएंस` एक नॉलेज बेस है जो मुख्य रूप से सामग्री प्रबंधन गतिविधियों को संभालता है।

`कॉन्फ़्लुएंस` पृष्ठों के लिए एक लोडर।

यह वर्तमान में `username/api_key`, `Oauth2 login` का समर्थन करता है। इसके अलावा, ऑन-प्रेम इंस्टॉलेशन `token` प्रमाणीकरण का भी समर्थन करते हैं।

`page_id`-s और/या `space_key` की एक सूची निर्दिष्ट करें ताकि संबंधित पृष्ठों को डॉक्यूमेंट ऑब्जेक्ट्स में लोड किया जा सके, यदि दोनों निर्दिष्ट किए गए हैं तो दोनों सेटों का संयुक्त होगा।

आप एक बूलियन `include_attachments` भी निर्दिष्ट कर सकते हैं ताकि अनुलग्नक शामिल किए जा सकें, यह डिफ़ॉल्ट रूप से False पर सेट है, यदि True पर सेट किया जाता है तो सभी अनुलग्नक डाउनलोड किए जाएंगे और ConfluenceReader टेक्स्ट को अनुलग्नकों से निकालकर डॉक्यूमेंट ऑब्जेक्ट में जोड़ देगा। वर्तमान में समर्थित अनुलग्नक प्रकार हैं: `PDF`, `PNG`, `JPEG/JPG`, `SVG`, `Word` और `Excel`।

संकेत: `space_key` और `page_id` दोनों कॉन्फ़्लुएंस में एक पृष्ठ के URL में पाए जा सकते हैं - https://yoursite.atlassian.com/wiki/spaces/<space_key>/pages/<page_id>

ConfluenceLoader का उपयोग करने से पहले सुनिश्चित करें कि आपके पास atlassian-python-api पैकेज का नवीनतम संस्करण स्थापित है:

```python
%pip install --upgrade --quiet  atlassian-python-api
```

## उदाहरण

### उपयोगकर्ता नाम और पासवर्ड या उपयोगकर्ता नाम और API टोकन (केवल एटलासियन क्लाउड)

यह उदाहरण या तो उपयोगकर्ता नाम और पासवर्ड का उपयोग करके प्रमाणीकरण करता है, या यदि आप कॉन्फ़्लुएंस के एटलासियन क्लाउड होस्ट किए गए संस्करण से कनेक्ट कर रहे हैं, तो उपयोगकर्ता नाम और एक API टोकन का उपयोग करता है।
आप https://id.atlassian.com/manage-profile/security/api-tokens पर जाकर एक API टोकन जनरेट कर सकते हैं।

`limit` पैरामीटर बताता है कि एक कॉल में कितने दस्तावेज़ पुनर्प्राप्त किए जाएंगे, न कि कुल कितने दस्तावेज़ पुनर्प्राप्त किए जाएंगे।
डिफ़ॉल्ट रूप से कोड 50 दस्तावेज़ बैचों में 1000 दस्तावेज़ तक वापस देगा। कुल दस्तावेज़ संख्या को नियंत्रित करने के लिए `max_pages` पैरामीटर का उपयोग करें।
कृपया ध्यान दें कि atlassian-python-api पैकेज में `limit` पैरामीटर के लिए अधिकतम मान वर्तमान में 100 है।

```python
from langchain_community.document_loaders import ConfluenceLoader

loader = ConfluenceLoader(
    url="https://yoursite.atlassian.com/wiki", username="me", api_key="12345"
)
documents = loader.load(space_key="SPACE", include_attachments=True, limit=50)
```

### व्यक्तिगत एक्सेस टोकन (केवल सर्वर/ऑन-प्रेम)

यह विधि केवल डेटा सेंटर/सर्वर ऑन-प्रेम संस्करण के लिए वैध है।
व्यक्तिगत एक्सेस टोकन (PAT) कैसे जनरेट करें, इस बारे में अधिक जानकारी के लिए कृपया आधिकारिक कॉन्फ़्लुएंस दस्तावेज़ीकरण देखें: https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html।
PAT का उपयोग करते समय, आप केवल टोकन मान प्रदान करते हैं, आप उपयोगकर्ता नाम प्रदान नहीं कर सकते।
कृपया ध्यान दें कि ConfluenceLoader उस उपयोगकर्ता के अनुमतियों के तहत चलेगा जिसने PAT जनरेट किया था और केवल उन दस्तावेज़ों को लोड कर पाएगा जिनके लिए उक्त उपयोगकर्ता का पहुंच है।

```python
from langchain_community.document_loaders import ConfluenceLoader

loader = ConfluenceLoader(url="https://yoursite.atlassian.com/wiki", token="12345")
documents = loader.load(
    space_key="SPACE", include_attachments=True, limit=50, max_pages=50
)
```
