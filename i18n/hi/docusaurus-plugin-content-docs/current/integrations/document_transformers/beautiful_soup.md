---
translated: true
---

# सुंदर सूप

>[सुंदर सूप](https://www.crummy.com/software/BeautifulSoup/) एक पायथन पैकेज है जो HTML और XML दस्तावेजों (गलत चिह्नित मार्कअप, यानी गैर-बंद टैग वाले) को पार्स करने के लिए उपयोग किया जाता है, जिसे टैग सूप के नाम से जाना जाता है।
> यह पार्स किए गए पृष्ठों के लिए एक पार्स ट्री बनाता है जिसका उपयोग HTML से डेटा निकालने के लिए किया जा सकता है,[3] जो वेब स्क्रैपिंग के लिए उपयोगी है।

`सुंदर सूप` HTML सामग्री पर अत्यधिक नियंत्रण प्रदान करता है, जिससे विशिष्ट टैग निकालना, हटाना और सामग्री को साफ करना संभव होता है।

यह उन मामलों के लिए उपयुक्त है जहां आप विशिष्ट जानकारी निकालना और HTML सामग्री को अपनी जरूरतों के अनुसार साफ करना चाहते हैं।

उदाहरण के लिए, हम HTML सामग्री से `<p>, <li>, <div>, और <a>` टैगों के भीतर पाठ सामग्री को स्क्रैप कर सकते हैं:

* `<p>`: पैराग्राफ टैग। यह HTML में एक पैराग्राफ को परिभाषित करता है और संबंधित वाक्यों और/या वाक्यांशों को एक साथ रखने के लिए उपयोग किया जाता है।

* `<li>`: सूची आइटम टैग। यह क्रमित (`<ol>`) और अक्रमित (`<ul>`) सूचियों के भीतर व्यक्तिगत आइटमों को परिभाषित करने के लिए उपयोग किया जाता है।

* `<div>`: विभाजन टैग। यह एक ब्लॉक-स्तर तत्व है जो अन्य इनलाइन या ब्लॉक-स्तर तत्वों को समूहित करने के लिए उपयोग किया जाता है।

* `<a>`: एंकर टैग। यह हाइपरलिंक को परिभाषित करने के लिए उपयोग किया जाता है।

```python
from langchain_community.document_loaders import AsyncChromiumLoader
from langchain_community.document_transformers import BeautifulSoupTransformer

# Load HTML
loader = AsyncChromiumLoader(["https://www.wsj.com"])
html = loader.load()
```

```python
# Transform
bs_transformer = BeautifulSoupTransformer()
docs_transformed = bs_transformer.transform_documents(
    html, tags_to_extract=["p", "li", "div", "a"]
)
```

```python
docs_transformed[0].page_content[0:500]
```

```output
'Conservative legal activists are challenging Amazon, Comcast and others using many of the same tools that helped kill affirmative-action programs in colleges.1,2099 min read U.S. stock indexes fell and government-bond prices climbed, after Moody’s lowered credit ratings for 10 smaller U.S. banks and said it was reviewing ratings for six larger ones. The Dow industrials dropped more than 150 points.3 min read Penn Entertainment’s Barstool Sportsbook app will be rebranded as ESPN Bet this fall as '
```
