---
translated: true
---

# Clarifai

>[Clarifai](https://www.clarifai.com/)は、データ探索、データラベリング、モデルトレーニング、評価、推論など、AIライフサイクル全体を提供するAIプラットフォームです。Clarifaiアプリケーションは、入力をアップロードした後、ベクトルデータベースとして使用できます。

このノートブックでは、`Clarifai`ベクトルデータベースに関連する機能の使用方法を示します。テキストのセマンティック検索機能を示す例が示されています。Clarifaiは、画像、ビデオフレーム、ローカライズされた検索(参照[Rank](https://docs.clarifai.com/api-guide/search/rank)))、属性検索(参照[Filter](https://docs.clarifai.com/api-guide/search/filter)))でのセマンティック検索もサポートしています。

Clarifaiを使用するには、アカウントと個人アクセストークン(PAT)キーが必要です。
[ここ](https://clarifai.com/settings/security)でPATを取得または作成してください。

# 依存関係

```python
# Install required dependencies
%pip install --upgrade --quiet  clarifai
```

# インポート

ここでは、個人アクセストークンを設定します。PATはプラットフォームの設定/セキュリティの下にあります。

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

# セットアップ

テキストデータをアップロードするユーザーIDとアプリIDを設定します。注意:そのアプリケーションを作成する際は、テキストドキュメントのインデックス作成に適したベースワークフロー(Language-Understandingワークフローなど)を選択してください。

[Clarifai](https://clarifai.com/login)にアカウントを作成し、アプリケーションを作成する必要があります。

```python
USER_ID = "USERNAME_ID"
APP_ID = "APPLICATION_ID"
NUMBER_OF_DOCS = 2
```

## テキストから

テキストのリストからClarifaiベクトルストアを作成します。このセクションでは、それぞれのメタデータとともに各テキストをClarifaiアプリケーションにアップロードします。Clarifaiアプリケーションは、関連するテキストを検索するためのセマンティック検索に使用できます。

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

また、カスタムの入力IDを入力することもできます。

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

データをClarifaiアプリにアップロードします。

```python
# upload with metadata and custom input ids.
response = clarifai_vector_db.add_texts(texts=texts, ids=idlist, metadatas=metadatas)

# upload without metadata (Not recommended)- Since you will not be able to perform Search operation with respect to metadata.
# custom input_id (optional)
response = clarifai_vector_db.add_texts(texts=texts)
```

Clarifaiベクトルデータベースを作成し、すべての入力をアプリに直接取り込むこともできます。

```python
clarifai_vector_db = Clarifai.from_texts(
    user_id=USER_ID,
    app_id=APP_ID,
    texts=texts,
    metadatas=metadatas,
)
```

類似性検索機能を使用して、類似したテキストを検索します。

```python
docs = clarifai_vector_db.similarity_search("I would like to see you")
docs
```

```output
[Document(page_content='I really enjoy spending time with you', metadata={'text': 'I really enjoy spending time with you', 'id': 'text1', 'source': 'book 1', 'category': ['books', 'modern']})]
```

さらに、メタデータによって検索結果をフィルタリングできます。

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

## ドキュメントから

ドキュメントのリストからClarifaiベクトルストアを作成します。このセクションでは、それぞれのメタデータとともに各ドキュメントをClarifaiアプリケーションにアップロードします。Clarifaiアプリケーションは、関連するドキュメントを検索するためのセマンティック検索に使用できます。

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

Clarifaiベクトルデータベースクラスを作成し、すべてのドキュメントをClarifaiアプリに取り込みます。

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

## 既存のアプリから

Clarifaiでは、APIやUIを通じてアプリケーション(プロジェクトと呼ばれる)にデータを追加するための優れたツールがあります。ほとんどのユーザーはLangChainと対話する前にそれを行っているため、この例では既存のアプリのデータを使用して検索を行います。[APIドキュメント](https://docs.clarifai.com/api-guide/data/create-get-update-delete)と[UIドキュメント](https://docs.clarifai.com/portal-guide/data)をご覧ください。Clarifaiアプリケーションは、関連するドキュメントを検索するためのセマンティック検索に使用できます。

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
