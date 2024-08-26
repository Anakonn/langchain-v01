---
translated: true
---

# LASER भाषा-निरपेक्ष SEntence प्रतिनिधित्व एम्बेडिंग्स मेटा AI द्वारा

>[LASER](https://github.com/facebookresearch/LASER/) एक Python लाइब्रेरी है जिसे मेटा AI रिसर्च टीम द्वारा विकसित किया गया है और 2/25/2024 तक 147 से अधिक भाषाओं के लिए बहुभाषीय वाक्य एम्बेडिंग्स बनाने के लिए उपयोग किया जाता है।
>- समर्थित भाषाओं की सूची https://github.com/facebookresearch/flores/blob/main/flores200/README.md#languages-in-flores-200 पर उपलब्ध है।

## निर्भरताएं

LaserEmbed का LangChain के साथ उपयोग करने के लिए, `laser_encoders` Python पैकेज इंस्टॉल करें।

```python
%pip install laser_encoders
```

## आयात

```python
from langchain_community.embeddings.laser import LaserEmbeddings
```

## लेज़र इंस्टैंटिएट करना

### पैरामीटर

- `lang: Optional[str]`
    >यदि खाली है तो एक बहुभाषीय LASER एन्कोडर मॉडल ("laser2" कहलाता है) का उपयोग करने के लिए डिफ़ॉल्ट होगा।
    समर्थित भाषाओं और lang_codes की सूची [यहाँ](https://github.com/facebookresearch/flores/blob/main/flores200/README.md#languages-in-flores-200) और [यहाँ](https://github.com/facebookresearch/LASER/blob/main/laser_encoders/language_list.py) पाई जा सकती है।

```python
# Ex Instantiationz
embeddings = LaserEmbeddings(lang="eng_Latn")
```

## उपयोग

### दस्तावेज़ एम्बेडिंग्स उत्पन्न करना

```python
document_embeddings = embeddings.embed_documents(
    ["This is a sentence", "This is some other sentence"]
)
```

### क्वेरी एम्बेडिंग्स उत्पन्न करना

```python
query_embeddings = embeddings.embed_query("This is a query")
```
