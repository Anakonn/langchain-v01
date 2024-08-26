---
translated: true
---

# HTML हेडर द्वारा विभाजित

## वर्णन और प्रेरणा

<a href="https://python.langchain.com/docs/modules/data_connection/document_transformers/text_splitters/markdown_header_metadata">`MarkdownHeaderTextSplitter`</a> के अवधारणा के समान, `HTMLHeaderTextSplitter` एक "संरचना-जागरूक" चंकर है जो पाठ को तत्व स्तर पर विभाजित करता है और किसी भी दिए गए चंक से संबंधित प्रत्येक हेडर के लिए मेटाडेटा जोड़ता है। यह तत्व-दर-तत्व चंक या समान मेटाडेटा वाले तत्वों को संयुक्त कर सकता है, जिसके उद्देश्य हैं (क) संबंधित पाठ को (अधिक या कम) अर्थपूर्ण रूप से एक साथ रखना और (ख) दस्तावेज संरचनाओं में एन्कोड की गई संदर्भ-समृद्ध जानकारी को बरकरार रखना। इसका उपयोग अन्य पाठ विभाजकों के साथ चंकिंग पाइपलाइन के एक हिस्से के रूप में किया जा सकता है।

## उपयोग के उदाहरण

#### 1) एक HTML स्ट्रिंग के साथ:

```python
%pip install -qU langchain-text-splitters
```

```python
from langchain_text_splitters import HTMLHeaderTextSplitter

html_string = """
<!DOCTYPE html>
<html>
<body>
    <div>
        <h1>Foo</h1>
        <p>Some intro text about Foo.</p>
        <div>
            <h2>Bar main section</h2>
            <p>Some intro text about Bar.</p>
            <h3>Bar subsection 1</h3>
            <p>Some text about the first subtopic of Bar.</p>
            <h3>Bar subsection 2</h3>
            <p>Some text about the second subtopic of Bar.</p>
        </div>
        <div>
            <h2>Baz</h2>
            <p>Some text about Baz</p>
        </div>
        <br>
        <p>Some concluding text about Foo</p>
    </div>
</body>
</html>
"""

headers_to_split_on = [
    ("h1", "Header 1"),
    ("h2", "Header 2"),
    ("h3", "Header 3"),
]

html_splitter = HTMLHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
html_header_splits = html_splitter.split_text(html_string)
html_header_splits
```

```output
[Document(page_content='Foo'),
 Document(page_content='Some intro text about Foo.  \nBar main section Bar subsection 1 Bar subsection 2', metadata={'Header 1': 'Foo'}),
 Document(page_content='Some intro text about Bar.', metadata={'Header 1': 'Foo', 'Header 2': 'Bar main section'}),
 Document(page_content='Some text about the first subtopic of Bar.', metadata={'Header 1': 'Foo', 'Header 2': 'Bar main section', 'Header 3': 'Bar subsection 1'}),
 Document(page_content='Some text about the second subtopic of Bar.', metadata={'Header 1': 'Foo', 'Header 2': 'Bar main section', 'Header 3': 'Bar subsection 2'}),
 Document(page_content='Baz', metadata={'Header 1': 'Foo'}),
 Document(page_content='Some text about Baz', metadata={'Header 1': 'Foo', 'Header 2': 'Baz'}),
 Document(page_content='Some concluding text about Foo', metadata={'Header 1': 'Foo'})]
```

#### 2) किसी वेब URL से लोड किए गए HTML के साथ, किसी अन्य विभाजक के साथ पाइपलाइन:

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

url = "https://plato.stanford.edu/entries/goedel/"

headers_to_split_on = [
    ("h1", "Header 1"),
    ("h2", "Header 2"),
    ("h3", "Header 3"),
    ("h4", "Header 4"),
]

html_splitter = HTMLHeaderTextSplitter(headers_to_split_on=headers_to_split_on)

# for local file use html_splitter.split_text_from_file(<path_to_file>)
html_header_splits = html_splitter.split_text_from_url(url)

chunk_size = 500
chunk_overlap = 30
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size, chunk_overlap=chunk_overlap
)

# Split
splits = text_splitter.split_documents(html_header_splits)
splits[80:85]
```

```output
[Document(page_content='We see that Gödel first tried to reduce the consistency problem for analysis to that of arithmetic. This seemed to require a truth definition for arithmetic, which in turn led to paradoxes, such as the Liar paradox (“This sentence is false”) and Berry’s paradox (“The least number not defined by an expression consisting of just fourteen English words”). Gödel then noticed that such paradoxes would not necessarily arise if truth were replaced by provability. But this means that arithmetic truth', metadata={'Header 1': 'Kurt Gödel', 'Header 2': '2. Gödel’s Mathematical Work', 'Header 3': '2.2 The Incompleteness Theorems', 'Header 4': '2.2.1 The First Incompleteness Theorem'}),
 Document(page_content='means that arithmetic truth and arithmetic provability are not co-extensive — whence the First Incompleteness Theorem.', metadata={'Header 1': 'Kurt Gödel', 'Header 2': '2. Gödel’s Mathematical Work', 'Header 3': '2.2 The Incompleteness Theorems', 'Header 4': '2.2.1 The First Incompleteness Theorem'}),
 Document(page_content='This account of Gödel’s discovery was told to Hao Wang very much after the fact; but in Gödel’s contemporary correspondence with Bernays and Zermelo, essentially the same description of his path to the theorems is given. (See Gödel 2003a and Gödel 2003b respectively.) From those accounts we see that the undefinability of truth in arithmetic, a result credited to Tarski, was likely obtained in some form by Gödel by 1931. But he neither publicized nor published the result; the biases logicians', metadata={'Header 1': 'Kurt Gödel', 'Header 2': '2. Gödel’s Mathematical Work', 'Header 3': '2.2 The Incompleteness Theorems', 'Header 4': '2.2.1 The First Incompleteness Theorem'}),
 Document(page_content='result; the biases logicians had expressed at the time concerning the notion of truth, biases which came vehemently to the fore when Tarski announced his results on the undefinability of truth in formal systems 1935, may have served as a deterrent to Gödel’s publication of that theorem.', metadata={'Header 1': 'Kurt Gödel', 'Header 2': '2. Gödel’s Mathematical Work', 'Header 3': '2.2 The Incompleteness Theorems', 'Header 4': '2.2.1 The First Incompleteness Theorem'}),
 Document(page_content='We now describe the proof of the two theorems, formulating Gödel’s results in Peano arithmetic. Gödel himself used a system related to that defined in Principia Mathematica, but containing Peano arithmetic. In our presentation of the First and Second Incompleteness Theorems we refer to Peano arithmetic as P, following Gödel’s notation.', metadata={'Header 1': 'Kurt Gödel', 'Header 2': '2. Gödel’s Mathematical Work', 'Header 3': '2.2 The Incompleteness Theorems', 'Header 4': '2.2.2 The proof of the First Incompleteness Theorem'})]
```

## सीमाएं

एक HTML दस्तावेज से दूसरे में संरचनात्मक विविधता काफी हो सकती है, और जबकि `HTMLHeaderTextSplitter` किसी भी दिए गए चंक से संबंधित सभी "प्रासंगिक" हेडर संलग्न करने का प्रयास करेगा, यह कुछ हेडर छूट सकता है। उदाहरण के लिए, एल्गोरिदम यह मान लेता है कि सूचनात्मक हिरारकी में हेडर हमेशा "ऊपर" संबंधित पाठ वाले नोड होते हैं, यानी पूर्व सहोदर, पूर्वज और इनका संयोजन। इस समाचार लेख में (इस दस्तावेज के लिखने के समय के अनुसार), दस्तावेज इस तरह से संरचित है कि शीर्ष-स्तर के शीर्षक का पाठ, हालांकि "h1" टैग किया गया है, एक अलग उप-वृक्ष में है जिसके "ऊपर" होने की उम्मीद की जाती है - इसलिए हम देख सकते हैं कि "h1" तत्व और उसका संबंधित पाठ चंक मेटाडेटा में नहीं दिखाई देता है (लेकिन, जहां लागू हो, हम "h2" और उसका संबंधित पाठ देखते हैं):

```python
url = "https://www.cnn.com/2023/09/25/weather/el-nino-winter-us-climate/index.html"

headers_to_split_on = [
    ("h1", "Header 1"),
    ("h2", "Header 2"),
]

html_splitter = HTMLHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
html_header_splits = html_splitter.split_text_from_url(url)
print(html_header_splits[1].page_content[:500])
```

```output
No two El NiÃ±o winters are the same, but many have temperature and precipitation trends in common.
Average conditions during an El NiÃ±o winter across the continental US.
One of the major reasons is the position of the jet stream, which often shifts south during an El NiÃ±o winter. This shift typically brings wetter and cooler weather to the South while the North becomes drier and warmer, according to NOAA.
Because the jet stream is essentially a river of air that storms flow through, the
```
