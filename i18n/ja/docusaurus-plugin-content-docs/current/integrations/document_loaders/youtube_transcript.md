---
translated: true
---

# YouTubeトランスクリプト

>[YouTube](https://www.youtube.com/)は、Googleが作成したオンラインビデオ共有およびソーシャルメディアプラットフォームです。

このノートブックでは、`YouTubeトランスクリプト`からドキュメントをロードする方法について説明します。

```python
from langchain_community.document_loaders import YoutubeLoader
```

```python
%pip install --upgrade --quiet  youtube-transcript-api
```

```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg", add_video_info=False
)
```

```python
loader.load()
```

### ビデオ情報の追加

```python
%pip install --upgrade --quiet  pytube
```

```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg", add_video_info=True
)
loader.load()
```

### 言語設定の追加

Language param : 降順の言語コードのリストで、デフォルトは`en`です。

translation param : 翻訳の設定で、利用可能なトランスクリプトを希望の言語に翻訳できます。

```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg",
    add_video_info=True,
    language=["en", "id"],
    translation="en",
)
loader.load()
```

## Google Cloudからのユーチューブローダー

### 前提条件

1. Google Cloudプロジェクトを作成するか、既存のプロジェクトを使用する
1. [YouTube Api](https://console.cloud.google.com/apis/enableflow?apiid=youtube.googleapis.com&project=sixth-grammar-344520)を有効にする
1. [デスクトップアプリの認証資格情報](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)を取得する
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib youtube-transcript-api`

### 🧑 Google Docsデータの取り込み手順

デフォルトでは、`GoogleDriveLoader`は`~/.credentials/credentials.json`ファイルを期待しますが、`credentials_file`キーワード引数を使用して設定できます。`token.json`についても同様です。`token.json`は、ローダーを初めて使用するときに自動的に作成されます。

`GoogleApiYoutubeLoader`は、Google Docsのドキュメントidのリストまたはフォルダidからロードできます。フォルダやドキュメントのidはURLから取得できます。
セットアップによっては、`service_account_path`を設定する必要があります。詳細は[こちら](https://developers.google.com/drive/api/v3/quickstart/python)をご覧ください。

```python
# Init the GoogleApiClient
from pathlib import Path

from langchain_community.document_loaders import GoogleApiClient, GoogleApiYoutubeLoader

google_api_client = GoogleApiClient(credentials_path=Path("your_path_creds.json"))


# Use a Channel
youtube_loader_channel = GoogleApiYoutubeLoader(
    google_api_client=google_api_client,
    channel_name="Reducible",
    captions_language="en",
)

# Use Youtube Ids

youtube_loader_ids = GoogleApiYoutubeLoader(
    google_api_client=google_api_client, video_ids=["TrdevFK_am4"], add_video_info=True
)

# returns a list of Documents
youtube_loader_channel.load()
```
