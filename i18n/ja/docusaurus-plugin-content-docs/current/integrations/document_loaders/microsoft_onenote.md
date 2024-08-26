---
translated: true
---

# Microsoft OneNote

このノートブックでは、`OneNote`からドキュメントをロードする方法を説明します。

## 前提条件

1. [Microsoft identity platform](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)の手順に従って、アプリケーションを登録します。
2. 登録が完了すると、Azure ポータルにアプリ登録の概要ページが表示されます。アプリケーション(クライアント) ID が表示されます。これは`クライアントID`とも呼ばれ、Microsoft identity platformであなたのアプリケーションを一意に識別する値です。
3. **項目1**の手順に従う際、リダイレクト URI を `http://localhost:8000/callback` に設定できます。
4. **項目1**の手順に従う際、アプリケーション シークレットのセクションで新しいパスワード(`client_secret`)を生成します。
5. この[ドキュメント](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope)の手順に従って、アプリケーションに`SCOPES`(`Notes.Read`)を追加します。
6. `pip install msal`と`pip install beautifulsoup4`のコマンドを使って、msal and bs4パッケージをインストールする必要があります。
7. 手順の最後には、以下の値を持っている必要があります:
- `CLIENT_ID`
- `CLIENT_SECRET`

## 🧑 OneNoteからドキュメントを取り込むための手順

### 🔑 認証

デフォルトでは、`OneNoteLoader`は`MS_GRAPH_CLIENT_ID`と`MS_GRAPH_CLIENT_SECRET`という名前の環境変数に`CLIENT_ID`と`CLIENT_SECRET`の値が格納されていることを想定しています。これらの環境変数は、アプリケーションのルートにある`.env`ファイルを介して渡すことができます。または、スクリプトで以下のコマンドを使用することもできます。

```python
os.environ['MS_GRAPH_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['MS_GRAPH_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

このローダーは[*ユーザーに代わって*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0)と呼ばれる認証を使用します。これは2段階の認証でユーザーの同意が必要です。ローダーをインスタンス化すると、ユーザーが必要な許可を与えるためにアクセスしなければならないURLが表示されます。ユーザーはこのURLにアクセスし、アプリケーションに同意を与える必要があります。その後、ユーザーは結果のページURLをコピーし、コンソールに貼り付ける必要があります。メソッドは、ログイン試行が成功した場合にTrueを返します。

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(notebook_name="NOTEBOOK NAME", section_name="SECTION NAME", page_title="PAGE TITLE")
```

認証が完了すると、ローダーは`~/.credentials/`フォルダーに`onenote_graph_token.txt`というトークンを保存します。このトークンを使用して、コピー/貼り付けの手順なしで後で認証することができます。このトークンを使用して認証するには、ローダーのインスタンス化時に`auth_with_token`パラメーターをTrueに変更する必要があります。

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(notebook_name="NOTEBOOK NAME", section_name="SECTION NAME", page_title="PAGE TITLE", auth_with_token=True)
```

また、トークンをローダーに直接渡すこともできます。これは、別のアプリケーションで生成されたトークンを使用して認証する場合に便利です。例えば、[Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)を使ってトークンを生成し、それをローダーに渡すことができます。

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(notebook_name="NOTEBOOK NAME", section_name="SECTION NAME", page_title="PAGE TITLE", access_token="TOKEN")
```

### 🗂️ ドキュメントローダー

#### 📑 OneNoteノートブックからページをロードする

`OneNoteLoader`は、OneDriveに保存されているOneNoteノートブックからページをロードできます。`notebook_name`、`section_name`、`page_title`のいずれかを指定して、特定のノートブック、特定のセクション、または特定のタイトルのページをフィルタリングできます。例えば、OneDriveの任意のノートブック内の`Recipes`セクションにあるすべてのページをロードしたい場合は、次のように指定します。

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(section_name="Recipes", auth_with_token=True)
documents = loader.load()
```

#### 📑 ページIDのリストからページをロードする

もう一つの方法は、ロードしたいページの`object_ids`のリストを提供することです。そのためには、[Microsoft Graph API](https://developer.microsoft.com/en-us/graph/graph-explorer)を使ってすべてのドキュメントIDを検索する必要があります。この[リンク](https://learn.microsoft.com/en-us/graph/onenote-get-content#page-collection)には、ドキュメントIDを取得するのに役立つエンドポイントの一覧が掲載されています。

例えば、ノートブックに保存されているすべてのページ情報を取得するには、`https://graph.microsoft.com/v1.0/me/onenote/pages`にリクエストを送る必要があります。関心のあるIDのリストが得られたら、次のパラメーターでローダーをインスタンス化できます。

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```
