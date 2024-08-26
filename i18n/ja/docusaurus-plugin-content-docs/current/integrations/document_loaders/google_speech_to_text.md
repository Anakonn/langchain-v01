---
translated: true
---

# Google Speech-to-Text オーディオ トランスクリプト

`GoogleSpeechToTextLoader` を使用すると、[Google Cloud Speech-to-Text API](https://cloud.google.com/speech-to-text) でオーディオファイルをトランスクライブし、トランスクライブされたテキストをドキュメントにロードできます。

これを使用するには、`google-cloud-speech` Python パッケージがインストールされており、[Speech-to-Text API が有効](https://cloud.google.com/speech-to-text/v2/docs/transcribe-client-libraries#before_you_begin)になっている Google Cloud プロジェクトが必要です。

- [大規模モデルの力を Google Cloud の Speech API に取り入れる](https://cloud.google.com/blog/products/ai-machine-learning/bringing-power-large-models-google-clouds-speech-api)

## インストールとセットアップ

まず、`google-cloud-speech` Python パッケージをインストールする必要があります。

[Speech-to-Text クライアントライブラリ](https://cloud.google.com/speech-to-text/v2/docs/libraries)ページでより詳しい情報を見つけることができます。

Google Cloud ドキュメントの[クイックスタートガイド](https://cloud.google.com/speech-to-text/v2/docs/sync-recognize)に従って、プロジェクトを作成し、API を有効にしてください。

```python
%pip install --upgrade --quiet langchain-google-community[speech]
```

## 例

`GoogleSpeechToTextLoader` には `project_id` と `file_path` の引数が必要です。オーディオファイルは Google Cloud Storage URI (`gs://...`) または ローカルファイルパスで指定できます。

ローダーでは同期リクエストのみがサポートされており、1 つのオーディオファイルあたり [60 秒または 10MB](https://cloud.google.com/speech-to-text/v2/docs/sync-recognize#:~:text=60%20seconds%20and/or%2010%20MB) の制限があります。

```python
from langchain_google_community import GoogleSpeechToTextLoader

project_id = "<PROJECT_ID>"
file_path = "gs://cloud-samples-data/speech/audio.flac"
# or a local file path: file_path = "./audio.wav"

loader = GoogleSpeechToTextLoader(project_id=project_id, file_path=file_path)

docs = loader.load()
```

注意: `loader.load()` を呼び出すと、トランスクリプションが完了するまでブロックされます。

トランスクライブされたテキストは `page_content` で利用できます:

```python
docs[0].page_content
```

```output
"How old is the Brooklyn Bridge?"
```

`metadata` には、より多くのメタ情報を含む完全な JSON レスポンスが含まれています:

```python
docs[0].metadata
```

```json
{
  'language_code': 'en-US',
  'result_end_offset': datetime.timedelta(seconds=1)
}
```

## 認識設定

`config` 引数を指定して、異なる音声認識モデルを使用したり、特定の機能を有効にしたりすることができます。

[Speech-to-Text 認識器のドキュメント](https://cloud.google.com/speech-to-text/v2/docs/recognizers)と [`RecognizeRequest`](https://cloud.google.com/python/docs/reference/speech/latest/google.cloud.speech_v2.types.RecognizeRequest) API リファレンスを参照して、カスタム設定の方法を確認してください。

`config` を指定しない場合は、以下のオプションが自動的に選択されます:

- モデル: [Chirp Universal Speech Model](https://cloud.google.com/speech-to-text/v2/docs/chirp-model)
- 言語: `en-US`
- オーディオエンコーディング: 自動検出
- 自動句読点: 有効

```python
from google.cloud.speech_v2 import (
    AutoDetectDecodingConfig,
    RecognitionConfig,
    RecognitionFeatures,
)
from langchain_google_community import GoogleSpeechToTextLoader

project_id = "<PROJECT_ID>"
location = "global"
recognizer_id = "<RECOGNIZER_ID>"
file_path = "./audio.wav"

config = RecognitionConfig(
    auto_decoding_config=AutoDetectDecodingConfig(),
    language_codes=["en-US"],
    model="long",
    features=RecognitionFeatures(
        enable_automatic_punctuation=False,
        profanity_filter=True,
        enable_spoken_punctuation=True,
        enable_spoken_emojis=True,
    ),
)

loader = GoogleSpeechToTextLoader(
    project_id=project_id,
    location=location,
    recognizer_id=recognizer_id,
    file_path=file_path,
    config=config,
)
```
