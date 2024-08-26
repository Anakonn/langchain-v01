---
translated: true
---

# SingleStoreDB

>[SingleStoreDB](https://singlestore.com/) एक मजबूत, उच्च-प्रदर्शन वितरित SQL डेटाबेस समाधान है जिसे [क्लाउड](https://www.singlestore.com/cloud/) और ऑन-प्रिमाइसेस दोनों वातावरणों में उत्कृष्टता प्राप्त करने के लिए डिज़ाइन किया गया है। एक बहुमुखी विशेषता सेट के साथ, यह अद्वितीय प्रदर्शन प्रदान करते हुए सहज परिनियोजन विकल्प प्रदान करता है।

SingleStoreDB की एक प्रमुख विशेषता इसका उन्नत वेक्टर स्टोरेज और संचालन के लिए समर्थन है, जो इसे जटिल AI क्षमताओं जैसे कि टेक्स्ट समानता मिलान की आवश्यकता वाले अनुप्रयोगों के लिए एक आदर्श विकल्प बनाता है। [dot_product](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/dot_product.html) और [euclidean_distance](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/euclidean_distance.html) जैसी बिल्ट-इन वेक्टर फंक्शंस के साथ, SingleStoreDB डेवलपर्स को जटिल एल्गोरिदम को कुशलता से लागू करने की शक्ति देता है।

वेक्टर डेटा को SingleStoreDB में उपयोग करने के इच्छुक डेवलपर्स के लिए, एक व्यापक ट्यूटोरियल उपलब्ध है, जो [वेक्टर डेटा के साथ काम करने](https://docs.singlestore.com/managed-service/en/developer-resources/functional-extensions/working-with-vector-data.html) की जटिलताओं के माध्यम से मार्गदर्शन करता है। यह ट्यूटोरियल SingleStoreDB के भीतर वेक्टर स्टोर में गहराई से जाता है, यह दर्शाता है कि यह वेक्टर समानता पर आधारित खोजों को कैसे सुविधाजनक बनाता है। वेक्टर इंडेक्स का लाभ उठाते हुए, क्वेरीज़ को अद्भुत गति के साथ निष्पादित किया जा सकता है, जिससे प्रासंगिक डेटा की त्वरित पुनर्प्राप्ति हो सकती है।

इसके अलावा, SingleStoreDB का वेक्टर स्टोर [Lucene आधारित फुल-टेक्स्ट इंडेक्सिंग](https://docs.singlestore.com/cloud/developer-resources/functional-extensions/working-with-full-text-search/) के साथ सहजता से एकीकृत होता है, जिससे शक्तिशाली टेक्स्ट समानता खोजें सक्षम होती हैं। उपयोगकर्ता डॉक्यूमेंट मेटाडेटा ऑब्जेक्ट्स के चयनित फ़ील्ड्स के आधार पर खोज परिणामों को फ़िल्टर कर सकते हैं, जिससे क्वेरी की सटीकता बढ़ जाती है।

SingleStoreDB को जो अलग बनाता है वह वेक्टर और फुल-टेक्स्ट खोजों को विभिन्न तरीकों से संयोजित करने की क्षमता है, जो लचीलापन और बहुमुखी प्रतिभा प्रदान करती है। चाहे टेक्स्ट या वेक्टर समानता के आधार पर पूर्व-फ़िल्टरिंग करके सबसे प्रासंगिक डेटा का चयन करना हो, या अंतिम समानता स्कोर की गणना करने के लिए वेटेड सम दृष्टिकोण का उपयोग करना हो, डेवलपर्स के पास कई विकल्प होते हैं।

मूल रूप से, SingleStoreDB वेक्टर डेटा के प्रबंधन और क्वेरी के लिए एक व्यापक समाधान प्रदान करता है, AI-चालित अनुप्रयोगों के लिए अद्वितीय प्रदर्शन और लचीलापन प्रदान करता है।

```python
# Establishing a connection to the database is facilitated through the singlestoredb Python connector.
# Please ensure that this connector is installed in your working environment.
%pip install --upgrade --quiet  singlestoredb
```

```python
import getpass
import os

# We want to use OpenAIEmbeddings so we have to get the OpenAI API Key.
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.vectorstores import SingleStoreDB
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
```

```python
# loading docs
# we will use some artificial data for this example
docs = [
    Document(
        page_content="""In the parched desert, a sudden rainstorm brought relief,
            as the droplets danced upon the thirsty earth, rejuvenating the landscape
            with the sweet scent of petrichor.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""Amidst the bustling cityscape, the rain fell relentlessly,
            creating a symphony of pitter-patter on the pavement, while umbrellas
            bloomed like colorful flowers in a sea of gray.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""High in the mountains, the rain transformed into a delicate
            mist, enveloping the peaks in a mystical veil, where each droplet seemed to
            whisper secrets to the ancient rocks below.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""Blanketing the countryside in a soft, pristine layer, the
            snowfall painted a serene tableau, muffling the world in a tranquil hush
            as delicate flakes settled upon the branches of trees like nature's own
            lacework.""",
        metadata={"category": "snow"},
    ),
    Document(
        page_content="""In the urban landscape, snow descended, transforming
            bustling streets into a winter wonderland, where the laughter of
            children echoed amidst the flurry of snowballs and the twinkle of
            holiday lights.""",
        metadata={"category": "snow"},
    ),
    Document(
        page_content="""Atop the rugged peaks, snow fell with an unyielding
            intensity, sculpting the landscape into a pristine alpine paradise,
            where the frozen crystals shimmered under the moonlight, casting a
            spell of enchantment over the wilderness below.""",
        metadata={"category": "snow"},
    ),
]

embeddings = OpenAIEmbeddings()
```

डेटाबेस से [कनेक्शन](https://singlestoredb-python.labs.singlestore.com/generated/singlestoredb.connect.html) स्थापित करने के कई तरीके हैं। आप या तो पर्यावरणीय वेरिएबल्स सेट कर सकते हैं या `SingleStoreDB कंस्ट्रक्टर` को नामित पैरामीटर पास कर सकते हैं। वैकल्पिक रूप से, आप इन पैरामीटरों को `from_documents` और `from_texts` विधियों को प्रदान कर सकते हैं।

```python
# Setup connection url as environment variable
os.environ["SINGLESTOREDB_URL"] = "root:pass@localhost:3306/db"

# Load documents to the store
docsearch = SingleStoreDB.from_documents(
    docs,
    embeddings,
    table_name="notebook",  # use table with a custom name
)
```

```python
query = "trees in the snow"
docs = docsearch.similarity_search(query)  # Find documents that correspond to the query
print(docs[0].page_content)
```

SingleStoreDB खोज क्षमताओं को उन्नत करता है जिससे उपयोगकर्ता मेटाडेटा फ़ील्ड्स के आधार पर पूर्व-फ़िल्टरिंग के माध्यम से खोज परिणामों को बढ़ा और परिष्कृत कर सकते हैं। यह कार्यक्षमता डेवलपर्स और डेटा विश्लेषकों को क्वेरी को ठीक करने की शक्ति देती है, यह सुनिश्चित करते हुए कि खोज परिणाम उनकी आवश्यकताओं के अनुसार सटीक रूप से अनुकूलित हों। विशिष्ट मेटाडेटा विशेषताओं का उपयोग करके खोज परिणामों को फ़िल्टर करके, उपयोगकर्ता अपनी क्वेरी की सीमा को संकीर्ण कर सकते हैं, केवल प्रासंगिक डेटा उपसमूह पर ध्यान केंद्रित कर सकते हैं।

```python
query = "trees branches"
docs = docsearch.similarity_search(
    query, filter={"category": "snow"}
)  # Find documents that correspond to the query and has category "snow"
print(docs[0].page_content)
```

SingleStore DB वर्शन 8.5 या उससे ऊपर में [ANN वेक्टर इंडेक्स](https://docs.singlestore.com/cloud/reference/sql-reference/vector-functions/vector-indexing/) का लाभ उठाकर अपनी खोज दक्षता बढ़ाएं। वेक्टर स्टोर ऑब्जेक्ट निर्माण के दौरान `use_vector_index=True` सेट करके, आप इस सुविधा को सक्रिय कर सकते हैं। इसके अतिरिक्त, यदि आपके वेक्टरों का आकार डिफ़ॉल्ट OpenAI एम्बेडिंग आकार 1536 से भिन्न है, तो `vector_size` पैरामीटर को तदनुसार निर्दिष्ट करना सुनिश्चित करें।

SingleStoreDB विभिन्न प्रकार की खोज रणनीतियों प्रस्तुत करता है, प्रत्येक को विशिष्ट उपयोग मामलों और उपयोगकर्ता प्राथमिकताओं को पूरा करने के लिए सावधानीपूर्वक तैयार किया गया है। डिफ़ॉल्ट `VECTOR_ONLY` रणनीति वेक्टर संचालन जैसे `dot_product` या `euclidean_distance` का उपयोग करके वेक्टरों के बीच सीधे समानता स्कोर की गणना करती है, जबकि `TEXT_ONLY` Lucene-आधारित फुल-टेक्स्ट खोज का उपयोग करती है, जो विशेष रूप से टेक्स्ट-केंद्रित अनुप्रयोगों के लिए लाभकारी होती है। संतुलित दृष्टिकोण की तलाश करने वाले उपयोगकर्ताओं के लिए, `FILTER_BY_TEXT` पहले टेक्स्ट समानता के आधार पर परिणामों को परिष्कृत करता है, फिर वेक्टर तुलना करता है, जबकि `FILTER_BY_VECTOR` वेक्टर समानता को प्राथमिकता देता है, टेक्स्ट समानता का मूल्यांकन करने से पहले परिणामों को फ़िल्टर करता है ताकि इष्टतम मिलान हो सके। उल्लेखनीय है कि `FILTER_BY_TEXT` और `FILTER_BY_VECTOR` दोनों के संचालन के लिए एक फुल-टेक्स्ट इंडेक्स की आवश्यकता होती है। इसके अतिरिक्त, `WEIGHTED_SUM` एक परिष्कृत रणनीति के रूप में उभरता है, जो वेक्टर और टेक्स्ट समानता को वेटिंग करके अंतिम समानता स्कोर की गणना करता है, हालांकि विशेष रूप से dot_product दूरी गणनाओं का उपयोग करता है और एक फुल-टेक्स्ट इंडेक्स की भी आवश्यकता होती है। ये बहुमुखी रणनीतियाँ उपयोगकर्ताओं को उनकी विशिष्ट आवश्यकताओं के अनुसार खोजों को ठीक करने की शक्ति देती हैं, जिससे कुशल और सटीक डेटा पुनर्प्राप्ति और विश्लेषण की सुविधा मिलती है। इसके अलावा, SingleStoreDB की हाइब्रिड दृष्टिकोण, `FILTER_BY_TEXT`, `FILTER_BY_VECTOR`, और `WEIGHTED_SUM` रणनीतियों द्वारा उदाहरणित, दक्षता और सटीकता को अधिकतम करने के लिए वेक्टर और टेक्स्ट-आधारित खोजों को सहजता से मिश्रित करती हैं, यह सुनिश्चित करते हुए कि उपयोगकर्ता प्लेटफॉर्म की क्षमताओं का पूरी तरह से लाभ उठा सकते हैं व्यापक अनुप्रयोगों के लिए।

```python
docsearch = SingleStoreDB.from_documents(
    docs,
    embeddings,
    distance_strategy=DistanceStrategy.DOT_PRODUCT,  # Use dot product for similarity search
    use_vector_index=True,  # Use vector index for faster search
    use_full_text_search=True,  # Use full text index
)

vectorResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.VECTOR_ONLY,
    filter={"category": "rain"},
)
print(vectorResults[0].page_content)

textResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.TEXT_ONLY,
)
print(textResults[0].page_content)

filteredByTextResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.FILTER_BY_TEXT,
    filter_threshold=0.1,
)
print(filteredByTextResults[0].page_content)

filteredByVectorResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.FILTER_BY_VECTOR,
    filter_threshold=0.1,
)
print(filteredByVectorResults[0].page_content)

weightedSumResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.WEIGHTED_SUM,
    text_weight=0.2,
    vector_weight=0.8,
)
print(weightedSumResults[0].page_content)
```

## मल्टी-मॉडल उदाहरण: CLIP और OpenClip एम्बेडिंग का लाभ उठाना

मल्टी-मॉडल डेटा विश्लेषण के क्षेत्र में, छवियों और टेक्स्ट जैसी विविध सूचना प्रकारों का एकीकरण तेजी से महत्वपूर्ण हो गया है। एक शक्तिशाली उपकरण जो ऐसे एकीकरण को सक्षम बनाता है वह है [CLIP](https://openai.com/research/clip), एक अत्याधुनिक मॉडल जो छवियों और टेक्स्ट दोनों को एक साझा सिमेंटिक स्पेस में एम्बेड करने में सक्षम है। ऐसा करके, CLIP विभिन्न मोडालिटी के बीच समानता खोज के माध्यम से प्रासंगिक सामग्री की पुनर्प्राप्ति को सक्षम बनाता है।

समझाने के लिए, आइए एक अनुप्रयोग परिदृश्य पर विचार करें जहां हम मल्टी-मॉडल डेटा का प्रभावी ढंग से विश्लेषण करना चाहते हैं। इस उदाहरण में, हम [OpenClip मल्टीमॉडल एम्बेडिंग](/docs/integrations/text_embedding/open_clip) की क्षमताओं का लाभ उठाते हैं, जो CLIP के ढांचे का लाभ उठाते हैं। OpenClip के साथ, हम संबंधित छवियों के साथ पाठ्य विवरणों को सहजता से एम्बेड कर सकते हैं, जिससे व्यापक विश्लेषण और पुनर्प्राप्ति कार्य सक्षम होते हैं। चाहे वह टेक्स्ट क्वेरी के आधार पर दृश्य रूप से समान छवियों की पहचान करना हो या विशिष्ट दृश्य सामग्री से जुड़े प्रासंगिक टेक्स्ट अंशों को खोजना हो, OpenClip उपयोगकर्ताओं को उल्लेखनीय दक्षता और सटीकता के साथ मल्टी-मॉडल डेटा का पता लगाने और अंतर्दृष्टि निकालने की शक्ति देता है।

```python
%pip install -U langchain openai singlestoredb langchain-experimental # (newest versions required for multi-modal)
```

```python
import os

from langchain_community.vectorstores import SingleStoreDB
from langchain_experimental.open_clip import OpenCLIPEmbeddings

os.environ["SINGLESTOREDB_URL"] = "root:pass@localhost:3306/db"

TEST_IMAGES_DIR = "../../modules/images"

docsearch = SingleStoreDB(OpenCLIPEmbeddings())

image_uris = sorted(
    [
        os.path.join(TEST_IMAGES_DIR, image_name)
        for image_name in os.listdir(TEST_IMAGES_DIR)
        if image_name.endswith(".jpg")
    ]
)

# Add images
docsearch.add_images(uris=image_uris)
```
