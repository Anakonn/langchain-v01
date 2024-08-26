---
translated: true
---

# स्टैकएक्सचेंज

>[स्टैक एक्सचेंज](https://stackexchange.com/) एक प्रश्न-और-उत्तर (Q&A) वेबसाइटों का नेटवर्क है जो विविध क्षेत्रों में विषयों पर केंद्रित है, प्रत्येक साइट एक विशिष्ट विषय को कवर करती है, जहां प्रश्न, उत्तर और उपयोगकर्ता प्रतिष्ठा पुरस्कार प्रक्रिया के अधीन हैं। प्रतिष्ठा प्रणाली साइटों को स्वयं-मॉडरेट होने में सक्षम बनाती है।

``StackExchange`` घटक स्टैक एक्सचेंज API को LangChain में एकीकृत करता है, जिससे स्टैक एक्सचेंज नेटवर्क के [स्टैक ओवरफ़्लो](https://stackoverflow.com/) साइट तक पहुंच मिलती है। स्टैक ओवरफ़्लो कंप्यूटर प्रोग्रामिंग पर केंद्रित है।

यह नोटबुक ``StackExchange`` घटक का उपयोग करने के बारे में बताता है।

हमें पहले स्टैक एक्सचेंज API को कार्यान्वित करने वाले पायथन पैकेज stackapi को इंस्टॉल करना होगा।

```python
pip install --upgrade stackapi
```

```python
from langchain_community.utilities import StackExchangeAPIWrapper

stackexchange = StackExchangeAPIWrapper()

stackexchange.run("zsh: command not found: python")
```
