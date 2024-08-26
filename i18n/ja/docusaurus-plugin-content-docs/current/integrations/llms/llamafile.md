---
translated: true
---

# Llamaファイル

[Llamafile](https://github.com/Mozilla-Ocho/llamafile)を使うと、単一のファイルでLLMを配布して実行できます。

Llamafileは[llama.cpp](https://github.com/ggerganov/llama.cpp)と[Cosmopolitan Libc](https://github.com/jart/cosmopolitan)を組み合わせることで、LLMの複雑さを単一のファイル実行可能形式(「Llamaファイル」と呼ばれる)にまとめ上げ、ほとんどのコンピューターで手軽に実行できるようにしています。

## セットアップ

1. 使用したいモデルのLlamaファイルをダウンロードします。[HuggingFace](https://huggingface.co/models?other=llamafile)にはたくさんのモデルがLlamaファイル形式で用意されています。このガイドでは小さめのモデル`TinyLlama-1.1B-Chat-v1.0.Q5_K_M`をダウンロードします。注意: `wget`がない場合は、この[リンク](https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile?download=true)からモデルをダウンロードできます。

```bash
wget https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile
```

2. Llamaファイルを実行可能にします。まず、ターミナルを開きます。**MacOS、Linux、BSDをお使いの場合**は、`chmod`コマンドでファイルの実行権限を付与する必要があります(下記参照)。**Windowsをお使いの場合**は、ファイル名に".exe"を追加してください(モデルファイルは`TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile.exe`となります)。

```bash
chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile  # run if you're on MacOS, Linux, or BSD
```

3. Llamaファイルを「サーバーモード」で実行します:

```bash
./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser
```

これで、LlamaファイルのREST APIを呼び出せるようになりました。デフォルトでは、Llamaファイルのサーバーはhttp://localhost:8080でリッスンしています。サーバーのドキュメントは[こちら](https://github.com/Mozilla-Ocho/llamafile/blob/main/llama.cpp/server/README.md#api-endpoints)にあります。REST APIから直接Llamaファイルと対話することもできますが、ここではLangChainを使う方法を紹介します。

## 使用方法

```python
from langchain_community.llms.llamafile import Llamafile

llm = Llamafile()

llm.invoke("Tell me a joke")
```

```output
'? \nI\'ve got a thing for pink, but you know that.\n"Can we not talk about work anymore?" - What did she say?\nI don\'t want to be a burden on you.\nIt\'s hard to keep a good thing going.\nYou can\'t tell me what I want, I have a life too!'
```

トークンをストリーミングするには、`.stream(...)`メソッドを使います:

```python
query = "Tell me a joke"

for chunks in llm.stream(query):
    print(chunks, end="")

print()
```

```output
.
- She said, "I’m tired of my life. What should I do?"
- The man replied, "I hear you. But don’t worry. Life is just like a joke. It has its funny parts too."
- The woman looked at him, amazed and happy to hear his wise words. - "Thank you for your wisdom," she said, smiling. - He replied, "Any time. But it doesn't come easy. You have to laugh and keep moving forward in life."
- She nodded, thanking him again. - The man smiled wryly. "Life can be tough. Sometimes it seems like you’re never going to get out of your situation."
- He said, "I know that. But the key is not giving up. Life has many ups and downs, but in the end, it will turn out okay."
- The woman's eyes softened. "Thank you for your advice. It's so important to keep moving forward in life," she said. - He nodded once again. "You’re welcome. I hope your journey is filled with laughter and joy."
- They both smiled and left the bar, ready to embark on their respective adventures.
```

LangChain Expressive Languageの詳細と、LLMで利用可能なメソッドについては、[LCELインターフェイス](/docs/expression_language/interface)をご覧ください。
