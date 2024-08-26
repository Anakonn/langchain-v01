---
sidebar_label: Kinetica
translated: true
---

# Kinetica Vectorstore API

>[Kinetica](https://www.kinetica.com/) एक ऐसा डेटाबेस है जिसमें वेक्टर समानता खोज के लिए एकीकृत समर्थन है

यह समर्थन करता है:
- सटीक और लगभग निकटतम पड़ोसी खोज
- L2 दूरी, आंतरिक उत्पाद और कोसाइन दूरी

यह नोटबुक `Kinetica` वेक्टर स्टोर का उपयोग करने का तरीका दिखाता है।

इसके लिए Kinetica का एक उदाहरण होना चाहिए जिसे यहाँ दिए गए निर्देशों का उपयोग करके आसानी से सेट अप किया जा सकता है - [स्थापना निर्देश](https://www.kinetica.com/developer-edition/)।

```python
# Pip install necessary package
%pip install --upgrade --quiet  langchain-openai
%pip install gpudb==7.2.0.1
%pip install --upgrade --quiet  tiktoken
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m24.0[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
Requirement already satisfied: gpudb==7.2.0.0b in /home/anindyam/kinetica/kinetica-github/langchain/libs/langchain/.venv/lib/python3.8/site-packages (7.2.0.0b0)
Requirement already satisfied: future in /home/anindyam/kinetica/kinetica-github/langchain/libs/langchain/.venv/lib/python3.8/site-packages (from gpudb==7.2.0.0b) (0.18.3)
Requirement already satisfied: pyzmq in /home/anindyam/kinetica/kinetica-github/langchain/libs/langchain/.venv/lib/python3.8/site-packages (from gpudb==7.2.0.0b) (25.1.2)

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m24.0[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m24.0[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```

हम `OpenAIEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
## Loading Environment Variables
from dotenv import load_dotenv

load_dotenv()
```

```output
False
```

```python
from langchain_community.docstore.document import Document
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import (
    DistanceStrategy,
    Kinetica,
    KineticaSettings,
)
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
# Kinetica needs the connection to the database.
# This is how to set it up.
HOST = os.getenv("KINETICA_HOST", "http://127.0.0.1:9191")
USERNAME = os.getenv("KINETICA_USERNAME", "")
PASSWORD = os.getenv("KINETICA_PASSWORD", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


def create_config() -> KineticaSettings:
    return KineticaSettings(host=HOST, username=USERNAME, password=PASSWORD)
```

## यूक्लिडियन दूरी (डिफ़ॉल्ट) के साथ समानता खोज

```python
# The Kinetica Module will try to create a table with the name of the collection.
# So, make sure that the collection name is unique and the user has the permission to create a table.

COLLECTION_NAME = "state_of_the_union_test"
connection = create_config()

db = Kinetica.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=COLLECTION_NAME,
    config=connection,
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db.similarity_search_with_score(query)
```

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.6077010035514832
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.6077010035514832
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.6596046090126038
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.6597143411636353
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
```

## अधिकतम सीमांत प्रासंगिकता खोज (MMR)

अधिकतम सीमांत प्रासंगिकता क्वेरी के समानता और चयनित दस्तावेजों के बीच विविधता के लिए अनुकूलित करता है।

```python
docs_with_score = db.max_marginal_relevance_search_with_score(query)
```

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.6077010035514832
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.6852865219116211
It is going to transform America and put us on a path to win the economic competition of the 21st Century that we face with the rest of the world—particularly with China.

As I’ve told Xi Jinping, it is never a good bet to bet against the American people.

We’ll create good jobs for millions of Americans, modernizing roads, airports, ports, and waterways all across America.

And we’ll do it all to withstand the devastating effects of the climate crisis and promote environmental justice.

We’ll build a national network of 500,000 electric vehicle charging stations, begin to replace poisonous lead pipes—so every child—and every American—has clean water to drink at home and at school, provide affordable high-speed internet for every American—urban, suburban, rural, and tribal communities.

4,000 projects have already been announced.

And tonight, I’m announcing that this year we will start fixing over 65,000 miles of highway and 1,500 bridges in disrepair.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.6866700053215027
We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together.

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera.

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.6936529278755188
But cancer from prolonged exposure to burn pits ravaged Heath’s lungs and body.

Danielle says Heath was a fighter to the very end.

He didn’t know how to stop fighting, and neither did she.

Through her pain she found purpose to demand we do better.

Tonight, Danielle—we are.

The VA is pioneering new ways of linking toxic exposures to diseases, already helping more veterans get benefits.

And tonight, I’m announcing we’re expanding eligibility to veterans suffering from nine respiratory cancers.

I’m also calling on Congress: pass a law to make sure veterans devastated by toxic exposures in Iraq and Afghanistan finally get the benefits and comprehensive health care they deserve.

And fourth, let’s end cancer as we know it.

This is personal to me and Jill, to Kamala, and to so many of you.

Cancer is the #2 cause of death in America–second only to heart disease.
--------------------------------------------------------------------------------
```

## वेक्टर स्टोर के साथ काम करना

ऊपर, हमने स्क्रैच से एक वेक्टर स्टोर बनाया। हालांकि, अक्सर हम मौजूदा वेक्टर स्टोर के साथ काम करना चाहते हैं।
ऐसा करने के लिए, हम इसे सीधे प्रारंभ कर सकते हैं।

```python
store = Kinetica(
    collection_name=COLLECTION_NAME,
    config=connection,
    embedding_function=embeddings,
)
```

### दस्तावेज़ जोड़ना

हम मौजूदा वेक्टर स्टोर में दस्तावेज़ जोड़ सकते हैं।

```python
store.add_documents([Document(page_content="foo")])
```

```output
['b94dc67c-ce7e-11ee-b8cb-b940b0e45762']
```

```python
docs_with_score = db.similarity_search_with_score("foo")
```

```python
docs_with_score[0]
```

```output
(Document(page_content='foo'), 0.0)
```

```python
docs_with_score[1]
```

```output
(Document(page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. \n\nWe can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  \n\nWe’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  \n\nWe’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. \n\nWe’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.', metadata={'source': '../../modules/state_of_the_union.txt'}),
 0.6946534514427185)
```

### एक वेक्टर स्टोर को अधिलेखित करना

यदि आपके पास मौजूदा संग्रह है, तो आप `from_documents` करके और `pre_delete_collection` = True सेट करके इसे अधिलेखित कर सकते हैं।

```python
db = Kinetica.from_documents(
    documents=docs,
    embedding=embeddings,
    collection_name=COLLECTION_NAME,
    config=connection,
    pre_delete_collection=True,
)
```

```python
docs_with_score = db.similarity_search_with_score("foo")
```

```python
docs_with_score[0]
```

```output
(Document(page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system. \n\nWe can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.  \n\nWe’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.  \n\nWe’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster. \n\nWe’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.', metadata={'source': '../../modules/state_of_the_union.txt'}),
 0.6946534514427185)
```

### एक Retriever के रूप में VectorStore का उपयोग करना

```python
retriever = store.as_retriever()
```

```python
print(retriever)
```

```output
tags=['Kinetica', 'OpenAIEmbeddings'] vectorstore=<langchain_community.vectorstores.kinetica.Kinetica object at 0x7f1644375e20>
```
