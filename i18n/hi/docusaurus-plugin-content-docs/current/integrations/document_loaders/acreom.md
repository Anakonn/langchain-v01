---
translated: true
---

# एक्रियोम

[एक्रियोम](https://acreom.com) एक डेव-फर्स्ट नॉलेज बेस है जिसमें स्थानीय मार्कडाउन फ़ाइलों पर कार्य चल रहे हैं।

नीचे दिया गया एक उदाहरण है कि लैंगचेन में स्थानीय एक्रियोम वॉल्ट कैसे लोड किया जाए। क्योंकि एक्रियोम में स्थानीय वॉल्ट एक फ़ोल्डर है जिसमें सादी पाठ .md फ़ाइलें हैं, लोडर को निर्देशिका का पथ आवश्यक है।

वॉल्ट फ़ाइलों में कुछ मेटाडेटा हो सकता है जो YAML हेडर के रूप में संग्रहीत होता है। यदि `collect_metadata` को सच माना जाता है, तो ये मान दस्तावेज़ के मेटाडेटा में जोड़ दिए जाएंगे।

```python
from langchain_community.document_loaders import AcreomLoader
```

```python
loader = AcreomLoader("<path-to-acreom-vault>", collect_metadata=False)
```

```python
docs = loader.load()
```
