---
translated: true
---

# HTML अनुभाग द्वारा विभाजित

## वर्णन और प्रेरणा

[HTMLHeaderTextSplitter](/docs/modules/data_connection/document_transformers/HTML_header_metadata) के अवधारणा के समान, `HTMLSectionSplitter` एक "संरचना-जागरूक" चंकर है जो पाठ को तत्व स्तर पर विभाजित करता है और प्रत्येक हेडर "प्रासंगिक" किसी भी दिए गए टुकड़े के लिए मेटाडेटा जोड़ता है। यह तत्व-दर-तत्व टुकड़े या समान मेटाडेटा वाले तत्वों को संयुक्त कर सकता है, जिसके उद्देश्य हैं (क) संबंधित पाठ को (अधिक या कम) अर्थपूर्ण रूप से एक साथ रखना और (ख) दस्तावेज संरचनाओं में एन्कोड किए गए संदर्भ-समृद्ध जानकारी को बरकरार रखना। इसका उपयोग अन्य पाठ विभाजकों के साथ एक चंकिंग पाइपलाइन के हिस्से के रूप में किया जा सकता है। आंतरिक रूप से, यह `RecursiveCharacterTextSplitter` का उपयोग करता है जब अनुभाग आकार चंक आकार से बड़ा होता है। यह पाठ के फ़ॉन्ट आकार पर भी विचार करता है ताकि यह निर्धारित फ़ॉन्ट आकार सीमा के आधार पर यह निर्धारित कर सके कि क्या यह एक अनुभाग है या नहीं। `xslt_path` का उपयोग HTML को परिवर्तित करने के लिए एक निर्दिष्ट पथ प्रदान करने के लिए करें ताकि यह प्रदान किए गए टैग के आधार पर अनुभाग का पता लगा सके। डिफ़ॉल्ट `converting_to_header.xslt` फ़ाइल का उपयोग `data_connection/document_transformers` निर्देशिका में करता है। यह HTML को एक ऐसे प्रारूप/लेआउट में परिवर्तित करने के लिए है जिसमें अनुभाग का पता लगाना आसान हो। उदाहरण के लिए, फ़ॉन्ट आकार के आधार पर `span` को हेडर टैग में परिवर्तित किया जा सकता है ताकि इसे एक अनुभाग के रूप में पहचाना जा सके।

## उपयोग के उदाहरण

#### 1) एक HTML स्ट्रिंग के साथ:

```python
from langchain_text_splitters import HTMLSectionSplitter

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

headers_to_split_on = [("h1", "Header 1"), ("h2", "Header 2")]

html_splitter = HTMLSectionSplitter(headers_to_split_on=headers_to_split_on)
html_header_splits = html_splitter.split_text(html_string)
html_header_splits
```

#### 2) किसी अन्य विभाजक के साथ पाइपलाइन, HTML को HTML स्ट्रिंग सामग्री से लोड किया गया:

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

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
    ("h4", "Header 4"),
]

html_splitter = HTMLSectionSplitter(headers_to_split_on=headers_to_split_on)

html_header_splits = html_splitter.split_text(html_string)

chunk_size = 500
chunk_overlap = 30
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size, chunk_overlap=chunk_overlap
)

# Split
splits = text_splitter.split_documents(html_header_splits)
splits
```
