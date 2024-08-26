---
translated: true
---

# Trello

>[Trello](https://www.atlassian.com/software/trello)は、個人やチームがタスクやプロジェクトを整理し追跡できるウェブベースのプロジェクト管理およびコラボレーションツールです。ユーザーがタスクや活動を表すリストやカードを作成できる「ボード」と呼ばれるビジュアルインターフェイスを提供しています。

TrelloLoaderは[py-trello](https://pypi.org/project/py-trello/)の上に実装されており、Trelloボードからカードをロードできます。

現在、`api_key/token`のみをサポートしています。

1. 資格情報の生成: https://trello.com/power-ups/admin/

2. 手動トークン生成リンクをクリックしてトークンを取得します。

API キーとトークンを指定するには、環境変数 ``TRELLO_API_KEY`` と ``TRELLO_TOKEN`` を設定するか、`from_credentials`コンビニエンスコンストラクターメソッドに直接 ``api_key`` と ``token`` を渡すことができます。

このローダーでは、対応するカードをDocument オブジェクトにロードするためのボード名を指定できます。

ボードの「名前」は公式ドキュメントでは「タイトル」とも呼ばれていることに注意してください:

https://support.atlassian.com/trello/docs/changing-a-boards-title-and-description/

また、ドキュメントのpage_content プロパティとメタデータから含める/除外するさまざまなロードパラメーターを指定することもできます。

## 機能

- Trelloボードからカードをロードする。
- カードのステータス(オープンまたはクローズ)に基づいてフィルタリングする。
- カード名、コメント、チェックリストをロードされたドキュメントに含める。
- ドキュメントに含めるメタデータフィールドをカスタマイズする。

デフォルトでは、すべてのカードフィールドがpage_contentの完全なテキストとメタデータに含まれます。

```python
%pip install --upgrade --quiet  py-trello beautifulsoup4 lxml
```

```python
# If you have already set the API key and token using environment variables,
# you can skip this cell and comment out the `api_key` and `token` named arguments
# in the initialization steps below.
from getpass import getpass

API_KEY = getpass()
TOKEN = getpass()
```

```output
········
········
```

```python
from langchain_community.document_loaders import TrelloLoader

# Get the open cards from "Awesome Board"
loader = TrelloLoader.from_credentials(
    "Awesome Board",
    api_key=API_KEY,
    token=TOKEN,
    card_filter="open",
)
documents = loader.load()

print(documents[0].page_content)
print(documents[0].metadata)
```

```output
Review Tech partner pages
Comments:
{'title': 'Review Tech partner pages', 'id': '6475357890dc8d17f73f2dcc', 'url': 'https://trello.com/c/b0OTZwkZ/1-review-tech-partner-pages', 'labels': ['Demand Marketing'], 'list': 'Done', 'closed': False, 'due_date': ''}
```

```python
# Get all the cards from "Awesome Board" but only include the
# card list(column) as extra metadata.
loader = TrelloLoader.from_credentials(
    "Awesome Board",
    api_key=API_KEY,
    token=TOKEN,
    extra_metadata=("list"),
)
documents = loader.load()

print(documents[0].page_content)
print(documents[0].metadata)
```

```output
Review Tech partner pages
Comments:
{'title': 'Review Tech partner pages', 'id': '6475357890dc8d17f73f2dcc', 'url': 'https://trello.com/c/b0OTZwkZ/1-review-tech-partner-pages', 'list': 'Done'}
```

```python
# Get the cards from "Another Board" and exclude the card name,
# checklist and comments from the Document page_content text.
loader = TrelloLoader.from_credentials(
    "test",
    api_key=API_KEY,
    token=TOKEN,
    include_card_name=False,
    include_checklist=False,
    include_comments=False,
)
documents = loader.load()

print("Document: " + documents[0].page_content)
print(documents[0].metadata)
```
