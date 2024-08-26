---
translated: true
---

# AssemblyAI オーディオ トランスクリプト

`AssemblyAIAudioTranscriptLoader` は、[AssemblyAI API](https://www.assemblyai.com) を使ってオーディオファイルをトランスクライブし、トランスクライブされたテキストをドキュメントにロードできます。

これを使うには、`assemblyai` Python パッケージがインストールされており、環境変数 `ASSEMBLYAI_API_KEY` にAPIキーが設定されている必要があります。または、APIキーを引数として渡すこともできます。

AssemblyAIについてのその他の情報:

- [ウェブサイト](https://www.assemblyai.com/)
- [無料のAPIキーを取得する](https://www.assemblyai.com/dashboard/signup)
- [AssemblyAI API ドキュメント](https://www.assemblyai.com/docs)

## インストール

まず、`assemblyai` Python パッケージをインストールする必要があります。

[assemblyai-python-sdk GitHub リポジトリ](https://github.com/AssemblyAI/assemblyai-python-sdk)の中にそれについての詳細情報があります。

```python
%pip install --upgrade --quiet  assemblyai
```

## 例

`AssemblyAIAudioTranscriptLoader` には少なくとも `file_path` 引数が必要です。オーディオファイルはURLまたはローカルファイルパスで指定できます。

```python
from langchain_community.document_loaders import AssemblyAIAudioTranscriptLoader

audio_file = "https://storage.googleapis.com/aai-docs-samples/nbc.mp3"
# or a local file path: audio_file = "./nbc.mp3"

loader = AssemblyAIAudioTranscriptLoader(file_path=audio_file)

docs = loader.load()
```

注意: `loader.load()` を呼び出すと、トランスクリプションが完了するまでブロックされます。

トランスクライブされたテキストは `page_content` で利用できます:

```python
docs[0].page_content
```

```output
"Load time, a new president and new congressional makeup. Same old ..."
```

`metadata` には、より多くのメタ情報を含む完全なJSONレスポンスが含まれています:

```python
docs[0].metadata
```

```output
{'language_code': <LanguageCode.en_us: 'en_us'>,
 'audio_url': 'https://storage.googleapis.com/aai-docs-samples/nbc.mp3',
 'punctuate': True,
 'format_text': True,
  ...
}
```

## トランスクリプトフォーマット

`transcript_format` 引数を指定して、さまざまなフォーマットを指定できます。

フォーマットによって、1つ以上のドキュメントが返されます。利用可能な `TranscriptFormat` オプションは以下の通りです:

- `TEXT`: トランスクリプションテキストを1つのドキュメントにする
- `SENTENCES`: トランスクリプションを文ごとに分割した複数のドキュメント
- `PARAGRAPHS`: トランスクリプションを段落ごとに分割した複数のドキュメント
- `SUBTITLES_SRT`: SRT字幕形式でエクスポートされたトランスクリプションを1つのドキュメントにする
- `SUBTITLES_VTT`: VTT字幕形式でエクスポートされたトランスクリプションを1つのドキュメントにする

```python
from langchain_community.document_loaders.assemblyai import TranscriptFormat

loader = AssemblyAIAudioTranscriptLoader(
    file_path="./your_file.mp3",
    transcript_format=TranscriptFormat.SENTENCES,
)

docs = loader.load()
```

## トランスクリプション設定

`config` 引数を指定して、さまざまなオーディオインテリジェンスモデルを使うこともできます。

利用可能なすべてのモデルの概要については、[AssemblyAI API ドキュメント](https://www.assemblyai.com/docs)を参照してください。

```python
import assemblyai as aai

config = aai.TranscriptionConfig(
    speaker_labels=True, auto_chapters=True, entity_detection=True
)

loader = AssemblyAIAudioTranscriptLoader(file_path="./your_file.mp3", config=config)
```

## 引数としてAPIキーを渡す

APIキーを環境変数 `ASSEMBLYAI_API_KEY` として設定する代わりに、引数として渡すこともできます。

```python
loader = AssemblyAIAudioTranscriptLoader(
    file_path="./your_file.mp3", api_key="YOUR_KEY"
)
```
