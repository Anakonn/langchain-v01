---
translated: true
---

# वेस्पा

>[वेस्पा](https://vespa.ai/) एक पूर्ण रूप से सुसज्जित खोज इंजन और वेक्टर डेटाबेस है। यह वेक्टर खोज (एएनएन), लेक्सिकल खोज और संरचित डेटा में खोज, सभी को एक ही क्वेरी में समर्थन करता है।

यह नोटबुक `Vespa.ai` का उपयोग करके LangChain रिट्रीवर का उपयोग करने का प्रदर्शन करता है।

रिट्रीवर बनाने के लिए, हम [pyvespa](https://pyvespa.readthedocs.io/en/latest/index.html) का उपयोग करते हैं
`Vespa` सेवा से कनेक्शन बनाने के लिए।

```python
%pip install --upgrade --quiet  pyvespa
```

```python
from vespa.application import Vespa

vespa_app = Vespa(url="https://doc-search.vespa.oath.cloud")
```

यह `Vespa` सेवा से कनेक्शन बनाता है, यहां Vespa प्रलेखन खोज सेवा।
`pyvespa` पैकेज का उपयोग करके, आप [Vespa क्लाउड इंस्टेंस](https://pyvespa.readthedocs.io/en/latest/deploy-vespa-cloud.html)
या स्थानीय [Docker इंस्टेंस](https://pyvespa.readthedocs.io/en/latest/deploy-docker.html) से भी कनेक्ट कर सकते हैं।

सेवा से कनेक्ट होने के बाद, आप रिट्रीवर को सेट अप कर सकते हैं:

```python
from langchain_community.retrievers import VespaRetriever

vespa_query_body = {
    "yql": "select content from paragraph where userQuery()",
    "hits": 5,
    "ranking": "documentation",
    "locale": "en-us",
}
vespa_content_field = "content"
retriever = VespaRetriever(vespa_app, vespa_query_body, vespa_content_field)
```

यह LangChain रिट्रीवर को सेट अप करता है जो `पैराग्राफ` दस्तावेज़ प्रकार में `सामग्री` फ़ील्ड से दस्तावेज़ प्राप्त करता है,
`प्रलेखन` को रैंकिंग विधि के रूप में उपयोग करता है। `userQuery()` को LangChain से पारित वास्तविक क्वेरी से बदल दिया जाता है।

अधिक जानकारी के लिए कृपया [pyvespa प्रलेखन](https://pyvespa.readthedocs.io/en/latest/getting-started-pyvespa.html#Query) देखें।

अब आप परिणामों को वापस कर सकते हैं और LangChain में परिणामों का उपयोग जारी रख सकते हैं।

```python
retriever.invoke("what is vespa?")
```
