---
translated: true
---

# उपशीर्षक

>[SubRip फ़ाइल प्रारूप](https://en.wikipedia.org/wiki/SubRip#SubRip_file_format) को `Matroska` मल्टीमीडिया कंटेनर प्रारूप वेबसाइट पर "शायद सभी सबटाइटल प्रारूपों में सबसे मूलभूत" के रूप में वर्णित किया गया है। `SubRip (SubRip Text)` फ़ाइलों को `.srt` एक्सटेंशन के साथ नामित किया जाता है, और उनमें सादे पाठ के प्रारूपित लाइनों के समूह होते हैं जो एक खाली लाइन से अलग किए जाते हैं। सबटाइटल क्रमिक रूप से संख्यांकित होते हैं, 1 से शुरू होते हैं। इस्तेमाल किया जाने वाला समय कोड प्रारूप घंटे:मिनट:सेकंड,मिलीसेकंड है, जहां समय इकाइयों को दो शून्य-पैड किए गए अंकों और अंशों को तीन शून्य-पैड किए गए अंकों में स्थिर किया गया है (00:00:00,000)। इस्तेमाल किया जाने वाला अंशक अलगाव कॉमा है, क्योंकि यह कार्यक्रम फ्रांस में लिखा गया था।

सबटाइटल (`.srt`) फ़ाइलों से डेटा कैसे लोड करें

कृपया, [यहाँ से उदाहरण .srt फ़ाइल डाउनलोड करें](https://www.opensubtitles.org/en/subtitles/5575150/star-wars-the-clone-wars-crisis-at-the-heart-en)।

```python
%pip install --upgrade --quiet  pysrt
```

```python
from langchain_community.document_loaders import SRTLoader
```

```python
loader = SRTLoader(
    "example_data/Star_Wars_The_Clone_Wars_S06E07_Crisis_at_the_Heart.srt"
)
```

```python
docs = loader.load()
```

```python
docs[0].page_content[:100]
```

```output
'<i>Corruption discovered\nat the core of the Banking Clan!</i> <i>Reunited, Rush Clovis\nand Senator A'
```
