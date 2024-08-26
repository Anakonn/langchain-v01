---
translated: true
---

# CoNLL-U

>[CoNLL-U](https://universaldependencies.org/format.html) एक CoNLL-X प्रारूप का संशोधित संस्करण है। एनोटेशन को सादे पाठ फ़ाइलों (UTF-8, NFC के अनुसार सामान्यीकृत, केवल LF वर्ण के साथ लाइन ब्रेक का उपयोग करते हुए, फ़ाइल के अंत में एक LF वर्ण शामिल) में एनकोड किया जाता है, जिनमें तीन प्रकार की पंक्तियाँ होती हैं:
>- शब्द पंक्तियाँ जो एक शब्द/टोकन के एनोटेशन को 10 फ़ील्डों में अलग-अलग टैब वर्णों द्वारा अलग-अलग करती हैं; नीचे देखें।
>- खाली पंक्तियाँ जो वाक्य सीमाओं को चिह्नित करती हैं।
>- हैश (#) से शुरू होने वाली टिप्पणी पंक्तियाँ।

यह [CoNLL-U](https://universaldependencies.org/format.html) प्रारूप में एक फ़ाइल को लोड करने का एक उदाहरण है। पूरी फ़ाइल को एक दस्तावेज़ के रूप में माना जाता है। उदाहरण डेटा (`conllu.conllu`) मानक UD/CoNLL-U उदाहरणों में से एक पर आधारित है।

```python
from langchain_community.document_loaders import CoNLLULoader
```

```python
loader = CoNLLULoader("example_data/conllu.conllu")
```

```python
document = loader.load()
```

```python
document
```

```output
[Document(page_content='They buy and sell books.', metadata={'source': 'example_data/conllu.conllu'})]
```
