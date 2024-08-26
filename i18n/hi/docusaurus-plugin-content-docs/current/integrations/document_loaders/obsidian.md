---
translated: true
---

# Obsidian

>[Obsidian](https://obsidian.md/) एक शक्तिशाली और विस्तारयोग्य ज्ञान आधार है
जो आपके स्थानीय फोल्डर के साधारण पाठ फ़ाइलों पर काम करता है।

यह नोटबुक `Obsidian` डेटाबेस से दस्तावेज़ लोड करने के बारे में बताता है।

चूंकि `Obsidian` डिस्क पर केवल एक फोल्डर के रूप में संग्रहीत है, लोडर केवल इस निर्देशिका का पथ लेता है।

`Obsidian` फ़ाइलों में कभी-कभी [मेटाडेटा](https://help.obsidian.md/Editing+and+formatting/Metadata) होता है जो फ़ाइल के शीर्ष पर एक YAML ब्लॉक होता है। ये मान दस्तावेज़ के मेटाडेटा में जोड़े जाएंगे। (`ObsidianLoader` को `collect_metadata=False` तर्क भी पारित किया जा सकता है ताकि यह व्यवहार अक्षम हो जाए।)

```python
from langchain_community.document_loaders import ObsidianLoader
```

```python
loader = ObsidianLoader("<path-to-obsidian>")
```

```python
docs = loader.load()
```
