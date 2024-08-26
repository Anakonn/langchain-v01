---
translated: true
---

यह नोटबुक दिखाता है कि Langchain पाइपलाइन में RSpace इलेक्ट्रॉनिक लैब नोटबुक से अनुसंधान नोट्स और दस्तावेज़ों को कैसे आयात किया जाए।

शुरू करने के लिए आपको एक RSpace खाता और एक API कुंजी की आवश्यकता होगी।

आप [https://community.researchspace.com](https://community.researchspace.com) पर एक मुफ्त खाता सेट कर सकते हैं या अपने संस्थागत RSpace का उपयोग कर सकते हैं।

आप अपने खाते के प्रोफ़ाइल पृष्ठ से एक RSpace API टोकन प्राप्त कर सकते हैं।

```python
%pip install --upgrade --quiet  rspace_client
```

आपके RSpace API कुंजी को एक पर्यावरण चर के रूप में संग्रहीत करना सबसे अच्छा है।

    RSPACE_API_KEY=<YOUR_KEY>

आपको अपने RSpace संस्थापन का URL भी सेट करना होगा जैसे

    RSPACE_URL=https://community.researchspace.com

यदि आप इन सटीक पर्यावरण चर नामों का उपयोग करते हैं, तो वे स्वचालित रूप से पता लगाए जाएंगे।

```python
from langchain_community.document_loaders.rspace import RSpaceLoader
```

आप RSpace से विभिन्न वस्तुओं को आयात कर सकते हैं:

* एक एकल RSpace संरचित या मूल दस्तावेज़। यह 1-1 के अनुपात में Langchain दस्तावेज़ में मैप होगा।
* एक फोल्डर या नोटबुक। नोटबुक या फोल्डर के अंदर के सभी दस्तावेज़ Langchain दस्तावेज़ के रूप में आयात किए जाते हैं।
* यदि आपके पास RSpace गैलरी में PDF फ़ाइलें हैं, तो इन्हें व्यक्तिगत रूप से भी आयात किया जा सकता है। नीचे की ओर, Langchain के PDF लोडर का उपयोग किया जाएगा और यह प्रत्येक PDF पृष्ठ के लिए एक Langchain दस्तावेज़ बनाता है।

```python
## replace these ids with some from your own research notes.
## Make sure to use  global ids (with the 2 character prefix). This helps the loader know which API calls to make
## to RSpace API.

rspace_ids = ["NB1932027", "FL1921314", "SD1932029", "GL1932384"]
for rs_id in rspace_ids:
    loader = RSpaceLoader(global_id=rs_id)
    docs = loader.load()
    for doc in docs:
        ## the name and ID are added to the 'source' metadata property.
        print(doc.metadata)
        print(doc.page_content[:500])
```

यदि आप ऊपर दिए गए पर्यावरण चरों का उपयोग नहीं करना चाहते हैं, तो आप इन्हें RSpaceLoader में पास कर सकते हैं।

```python
loader = RSpaceLoader(
    global_id=rs_id, api_key="MY_API_KEY", url="https://my.researchspace.com"
)
```
