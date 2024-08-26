---
translated: true
---

# MongoDB

[MongoDB](https://www.mongodb.com/) एक NoSQL, दस्तावेज़-उन्मुख डेटाबेस है जो JSON-जैसे दस्तावेज़ों का समर्थन करता है और एक गतिशील स्कीमा है।

## अवलोकन

MongoDB Document Loader एक MongoDB डेटाबेस से Langchain दस्तावेज़ों की एक सूची लौटाता है।

लोडर को निम्नलिखित पैरामीटर की आवश्यकता होती है:

*   MongoDB कनेक्शन स्ट्रिंग
*   MongoDB डेटाबेस नाम
*   MongoDB संग्रह नाम
*   (वैकल्पिक) सामग्री फ़िल्टर डिक्शनरी
*   (वैकल्पिक) आउटपुट में शामिल किए जाने वाले फ़ील्ड नामों की सूची

आउटपुट निम्नलिखित प्रारूप में होता है:

- pageContent= Mongo Document
- metadata={'database': '[database_name]', 'collection': '[collection_name]'}

## Document Loader लोड करें

```python
# add this import for running in jupyter notebook
import nest_asyncio

nest_asyncio.apply()
```

```python
from langchain_community.document_loaders.mongodb import MongodbLoader
```

```python
loader = MongodbLoader(
    connection_string="mongodb://localhost:27017/",
    db_name="sample_restaurants",
    collection_name="restaurants",
    filter_criteria={"borough": "Bronx", "cuisine": "Bakery"},
    field_names=["name", "address"],
)
```

```python
docs = loader.load()

len(docs)
```

```output
71
```

```python
docs[0]
```

```output
Document(page_content="Morris Park Bake Shop {'building': '1007', 'coord': [-73.856077, 40.848447], 'street': 'Morris Park Ave', 'zipcode': '10462'}", metadata={'database': 'sample_restaurants', 'collection': 'restaurants'})
```
