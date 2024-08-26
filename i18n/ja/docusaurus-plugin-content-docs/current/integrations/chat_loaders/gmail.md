---
translated: true
---

# GMail

このローダーは、GMail からデータを読み込む方法について説明しています。GMail からデータを読み込む方法は多数あります。このローダーは、その方法について非常に具体的に説明しています。ローダーの動作は以下の通りです。

まず、ユーザーが送信したメッセージをすべて検索します。次に、ユーザーが以前のメールに返信しているメッセージを検索します。そして、その以前のメールを取得し、そのメールとユーザーの返信メールを1つの学習例として作成します。

ここには明確な制限があることに注意してください。例えば、作成された学習例はすべて、前のメールのみを文脈として使用しています。

使用方法:

- Google Developer アカウントを設定する: Google Developer コンソールにアクセスし、プロジェクトを作成し、そのプロジェクトで Gmail API を有効にします。これにより、後で必要となる `credentials.json` ファイルが生成されます。

- Google クライアントライブラリをインストールする: 以下のコマンドを実行して Google クライアントライブラリをインストールします:

```python
%pip install --upgrade --quiet  google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

```python
import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


creds = None
# The file token.json stores the user's access and refresh tokens, and is
# created automatically when the authorization flow completes for the first
# time.
if os.path.exists("email_token.json"):
    creds = Credentials.from_authorized_user_file("email_token.json", SCOPES)
# If there are no (valid) credentials available, let the user log in.
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            # your creds file here. Please create json file as here https://cloud.google.com/docs/authentication/getting-started
            "creds.json",
            SCOPES,
        )
        creds = flow.run_local_server(port=0)
    # Save the credentials for the next run
    with open("email_token.json", "w") as token:
        token.write(creds.to_json())
```

```python
from langchain_community.chat_loaders.gmail import GMailLoader
```

```python
loader = GMailLoader(creds=creds, n=3)
```

```python
data = loader.load()
```

```python
# Sometimes there can be errors which we silently ignore
len(data)
```

```output
2
```

```python
from langchain_community.chat_loaders.utils import (
    map_ai_messages,
)
```

```python
# This makes messages sent by hchase@langchain.com the AI Messages
# This means you will train an LLM to predict as if it's responding as hchase
training_data = list(
    map_ai_messages(data, sender="Harrison Chase <hchase@langchain.com>")
)
```
