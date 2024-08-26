---
translated: true
---

# क्लेरिफाई

>[क्लेरिफाई](https://www.clarifai.com/) एक एआई प्लेटफॉर्म है जो डेटा एक्सप्लोरेशन, डेटा लेबलिंग, मॉडल ट्रेनिंग, मूल्यांकन और अनुमान के पूरे एआई लाइफसाइकिल को प्रदान करता है। इनपुट अपलोड करने के बाद क्लेरिफाई एप्लिकेशन को एक वेक्टर डेटाबेस के रूप में उपयोग किया जा सकता है।

यह नोटबुक `क्लेरिफाई` वेक्टर डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है। उदाहरण दिखाए गए हैं जो पाठ सेमेंटिक खोज क्षमताओं को प्रदर्शित करते हैं। क्लेरिफाई छवियों, वीडियो फ्रेमों और स्थानीय खोज (देखें [रैंक](https://docs.clarifai.com/api-guide/search/rank))) और विशेषता खोज (देखें [फ़िल्टर](https://docs.clarifai.com/api-guide/search/filter))) के साथ भी सेमेंटिक खोज का समर्थन करता है।

क्लेरिफाई का उपयोग करने के लिए, आपके पास एक खाता और एक व्यक्तिगत एक्सेस टोकन (PAT) कुंजी होनी चाहिए।
[यहां जाएं](https://clarifai.com/settings/security) PAT प्राप्त करने या बनाने के लिए।

# निर्भरताएं

```python
# Install required dependencies
%pip install --upgrade --quiet  clarifai
```

# आयात

यहां हम व्यक्तिगत एक्सेस टोकन सेट करेंगे। आप अपना PAT प्लेटफॉर्म पर सेटिंग्स/सुरक्षा के तहत पा सकते हैं।

```python
# Please login and get your API key from  https://clarifai.com/settings/security
from getpass import getpass

CLARIFAI_PAT = getpass()
```

```output
 ········
```

```python
# Import the required modules
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Clarifai
from langchain_text_splitters import CharacterTextSplitter
```

# सेटअप

उपयोगकर्ता आईडी और ऐप आईडी सेट करें जहां पाठ डेटा अपलोड किया जाएगा। ध्यान दें: जब आप उस एप्लिकेशन बना रहे हों, तो कृपया पाठ दस्तावेजों को इंडेक्स करने के लिए एक उचित आधारभूत कार्यप्रवाह का चयन करें, जैसे कि भाषा-समझ कार्यप्रवाह।

आपको पहले [क्लेरिफाई](https://clarifai.com/login) पर एक खाता बनाना होगा और फिर एक एप्लिकेशन बनाना होगा।

```python
USER_ID = "USERNAME_ID"
APP_ID = "APPLICATION_ID"
NUMBER_OF_DOCS = 2
```

## पाठों से

पाठों की एक सूची से क्लेरिफाई वेक्टर स्टोर बनाएं। यह खंड प्रत्येक पाठ को उसके संबंधित मेटाडेटा के साथ क्लेरिफाई एप्लिकेशन में अपलोड करेगा। क्लेरिफाई एप्लिकेशन का उपयोग प्रासंगिक पाठों को खोजने के लिए सेमेंटिक खोज के लिए किया जा सकता है।

```python
texts = [
    "I really enjoy spending time with you",
    "I hate spending time with my dog",
    "I want to go for a run",
    "I went to the movies yesterday",
    "I love playing soccer with my friends",
]

metadatas = [
    {"id": i, "text": text, "source": "book 1", "category": ["books", "modern"]}
    for i, text in enumerate(texts)
]
```

वैकल्पिक रूप से, आप इनपुट आईडी को कस्टम इनपुट आईडी देने का विकल्प भी रख सकते हैं।

```python
idlist = ["text1", "text2", "text3", "text4", "text5"]
metadatas = [
    {"id": idlist[i], "text": text, "source": "book 1", "category": ["books", "modern"]}
    for i, text in enumerate(texts)
]
```

```python
# There is an option to initialize clarifai vector store with pat as argument!
clarifai_vector_db = Clarifai(
    user_id=USER_ID,
    app_id=APP_ID,
    number_of_docs=NUMBER_OF_DOCS,
)
```

क्लेरिफाई ऐप में डेटा अपलोड करें।

```python
# upload with metadata and custom input ids.
response = clarifai_vector_db.add_texts(texts=texts, ids=idlist, metadatas=metadatas)

# upload without metadata (Not recommended)- Since you will not be able to perform Search operation with respect to metadata.
# custom input_id (optional)
response = clarifai_vector_db.add_texts(texts=texts)
```

आप एक क्लेरिफाई वेक्टर डीबी स्टोर बना सकते हैं और सभी इनपुट को सीधे अपने ऐप में अंतर्भुक्त कर सकते हैं।

```python
clarifai_vector_db = Clarifai.from_texts(
    user_id=USER_ID,
    app_id=APP_ID,
    texts=texts,
    metadatas=metadatas,
)
```

समानता खोज कार्य का उपयोग करके समान पाठों की खोज करें।

```python
docs = clarifai_vector_db.similarity_search("I would like to see you")
docs
```

```output
[Document(page_content='I really enjoy spending time with you', metadata={'text': 'I really enjoy spending time with you', 'id': 'text1', 'source': 'book 1', 'category': ['books', 'modern']})]
```

आगे आप मेटाडेटा द्वारा अपने खोज परिणामों को फ़िल्टर कर सकते हैं।

```python
# There is lots powerful filtering you can do within an app by leveraging metadata filters.
# This one will limit the similarity query to only the texts that have key of "source" matching value of "book 1"
book1_similar_docs = clarifai_vector_db.similarity_search(
    "I would love to see you", filter={"source": "book 1"}
)

# you can also use lists in the input's metadata and then select things that match an item in the list. This is useful for categories like below:
book_category_similar_docs = clarifai_vector_db.similarity_search(
    "I would love to see you", filter={"category": ["books"]}
)
```

## दस्तावेजों से

दस्तावेजों की एक सूची से क्लेरिफाई वेक्टर स्टोर बनाएं। यह खंड प्रत्येक दस्तावेज को उसके संबंधित मेटाडेटा के साथ क्लेरिफाई एप्लिकेशन में अपलोड करेगा। क्लेरिफाई एप्लिकेशन का उपयोग प्रासंगिक दस्तावेजों को खोजने के लिए सेमेंटिक खोज के लिए किया जा सकता है।

```python
loader = TextLoader("your_local_file_path.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
USER_ID = "USERNAME_ID"
APP_ID = "APPLICATION_ID"
NUMBER_OF_DOCS = 4
```

एक क्लेरिफाई वेक्टर डीबी क्लास बनाएं और अपने सभी दस्तावेजों को क्लेरिफाई ऐप में अंतर्भुक्त करें।

```python
clarifai_vector_db = Clarifai.from_documents(
    user_id=USER_ID,
    app_id=APP_ID,
    documents=docs,
    number_of_docs=NUMBER_OF_DOCS,
)
```

```python
docs = clarifai_vector_db.similarity_search("Texts related to population")
docs
```

## मौजूदा ऐप से

क्लेरिफाई में हमारे पास एप्लिकेशन (बुनियादी रूप से परियोजनाओं) में डेटा जोड़ने के लिए API या UI के माध्यम से बहुत अच्छे उपकरण हैं। अधिकांश उपयोगकर्ता पहले से ही LangChain के साथ इंटरैक्ट करने से पहले ऐसा कर चुके होंगे, इसलिए यह उदाहरण मौजूदा ऐप में मौजूद डेटा का उपयोग करके खोज करेगा। हमारे [API दस्तावेज](https://docs.clarifai.com/api-guide/data/create-get-update-delete) और [UI दस्तावेज](https://docs.clarifai.com/portal-guide/data) देखें। क्लेरिफाई एप्लिकेशन का उपयोग प्रासंगिक दस्तावेजों को खोजने के लिए सेमेंटिक खोज के लिए किया जा सकता है।

```python
USER_ID = "USERNAME_ID"
APP_ID = "APPLICATION_ID"
NUMBER_OF_DOCS = 4
```

```python
clarifai_vector_db = Clarifai(
    user_id=USER_ID,
    app_id=APP_ID,
    number_of_docs=NUMBER_OF_DOCS,
)
```

```python
docs = clarifai_vector_db.similarity_search(
    "Texts related to ammuniction and president wilson"
)
```

```python
docs[0].page_content
```

```output
"President Wilson, generally acclaimed as the leader of the world's democracies,\nphrased for civilization the arguments against autocracy in the great peace conference\nafter the war. The President headed the American delegation to that conclave of world\nre-construction. With him as delegates to the conference were Robert Lansing, Secretary\nof State; Henry White, former Ambassador to France and Italy; Edward M. House and\nGeneral Tasker H. Bliss.\nRepresenting American Labor at the International Labor conference held in Paris\nsimultaneously with the Peace Conference were Samuel Gompers, president of the\nAmerican Federation of Labor; William Green, secretary-treasurer of the United Mine\nWorkers of America; John R. Alpine, president of the Plumbers' Union; James Duncan,\npresident of the International Association of Granite Cutters; Frank Duffy, president of\nthe United Brotherhood of Carpenters and Joiners, and Frank Morrison, secretary of the\nAmerican Federation of Labor.\nEstimating the share of each Allied nation in the great victory, mankind will\nconclude that the heaviest cost in proportion to prewar population and treasure was paid\nby the nations that first felt the shock of war, Belgium, Serbia, Poland and France. All\nfour were the battle-grounds of huge armies, oscillating in a bloody frenzy over once\nfertile fields and once prosperous towns.\nBelgium, with a population of 8,000,000, had a casualty list of more than 350,000;\nFrance, with its casualties of 4,000,000 out of a population (including its colonies) of\n90,000,000, is really the martyr nation of the world. Her gallant poilus showed the world\nhow cheerfully men may die in defense of home and liberty. Huge Russia, including\nhapless Poland, had a casualty list of 7,000,000 out of its entire population of\n180,000,000. The United States out of a population of 110,000,000 had a casualty list of\n236,117 for nineteen months of war; of these 53,169 were killed or died of disease;\n179,625 were wounded; and 3,323 prisoners or missing."
```
