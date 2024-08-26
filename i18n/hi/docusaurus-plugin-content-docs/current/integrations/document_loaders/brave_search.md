---
translated: true
---

# ब्रेव सर्च

>[Brave Search](https://en.wikipedia.org/wiki/Brave_Search) ब्रेव सॉफ्टवेयर द्वारा विकसित एक सर्च इंजन है।
> - `Brave Search` अपने वेब इंडेक्स का उपयोग करता है। मई 2022 तक, इसमें 10 बिलियन से अधिक पृष्ठ शामिल थे और इसे 92% 
> सर्च परिणामों को किसी भी तीसरे पक्ष पर निर्भर किए बिना सेवा देने के लिए उपयोग किया गया था, शेष बिंग एपीआई से 
> सर्वर-साइड या (ऑप्ट-इन आधार पर) गूगल से क्लाइंट-साइड से प्राप्त किया गया था। 
> ब्रेव के अनुसार, इंडेक्स को "जानबूझकर गूगल या बिंग की तुलना में छोटा रखा गया था" ताकि स्पैम और अन्य निम्न-गुणवत्ता वाली सामग्री से बचने में मदद मिल सके, 
> जिसके नुकसान के साथ कि "ब्रेव सर्च अभी तक लंबी-पूंछ क्वेरीज को पुनः प्राप्त करने में गूगल जितना अच्छा नहीं है।"
> - `Brave Search Premium`: अप्रैल 2023 तक ब्रेव सर्च एक विज्ञापन-मुक्त वेबसाइट है, लेकिन यह अंततः एक नए मॉडल में बदल जाएगा जिसमें विज्ञापन शामिल होंगे और प्रीमियम उपयोगकर्ताओं को विज्ञापन-मुक्त अनुभव मिलेगा।
> उपयोगकर्ता डेटा सहित आईपी पते डिफ़ॉल्ट रूप से उसके उपयोगकर्ताओं से एकत्र नहीं किए जाएंगे। ऑप्ट-इन डेटा-संग्रह के लिए एक प्रीमियम खाता आवश्यक होगा।

## स्थापना और सेटअप

ब्रेव सर्च एपीआई तक पहुंच प्राप्त करने के लिए, आपको [एक खाता बनाना होगा और एपीआई कुंजी प्राप्त करनी होगी](https://api.search.brave.com/app/dashboard)।

```python
api_key = "..."
```

```python
from langchain_community.document_loaders import BraveSearchLoader
```

## उदाहरण

```python
loader = BraveSearchLoader(
    query="obama middle name", api_key=api_key, search_kwargs={"count": 3}
)
docs = loader.load()
len(docs)
```

```output
3
```

```python
[doc.metadata for doc in docs]
```

```output
[{'title': "Obama's Middle Name -- My Last Name -- is 'Hussein.' So?",
  'link': 'https://www.cair.com/cair_in_the_news/obamas-middle-name-my-last-name-is-hussein-so/'},
 {'title': "What's up with Obama's middle name? - Quora",
  'link': 'https://www.quora.com/Whats-up-with-Obamas-middle-name'},
 {'title': 'Barack Obama | Biography, Parents, Education, Presidency, Books, ...',
  'link': 'https://www.britannica.com/biography/Barack-Obama'}]
```

```python
[doc.page_content for doc in docs]
```

```output
['I wasn’t sure whether to laugh or cry a few days back listening to radio talk show host Bill Cunningham repeatedly scream Barack <strong>Obama</strong>’<strong>s</strong> <strong>middle</strong> <strong>name</strong> — my last <strong>name</strong> — as if he had anti-Muslim Tourette’s. “Hussein,” Cunningham hissed like he was beckoning Satan when shouting the ...',
 'Answer (1 of 15): A better question would be, “What’s up with <strong>Obama</strong>’s first <strong>name</strong>?” President Barack Hussein <strong>Obama</strong>’s father’s <strong>name</strong> was Barack Hussein <strong>Obama</strong>. He was <strong>named</strong> after his father. Hussein, <strong>Obama</strong>’<strong>s</strong> <strong>middle</strong> <strong>name</strong>, is a very common Arabic <strong>name</strong>, meaning &quot;good,&quot; &quot;handsome,&quot; or ...',
 'Barack <strong>Obama</strong>, in full Barack Hussein <strong>Obama</strong> II, (born August 4, 1961, Honolulu, Hawaii, U.S.), 44th president of the United States (2009–17) and the first African American to hold the office. Before winning the presidency, <strong>Obama</strong> represented Illinois in the U.S.']
```
