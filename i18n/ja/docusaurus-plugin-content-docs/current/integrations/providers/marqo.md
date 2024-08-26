---
translated: true
---

# Marqo

このページでは、LangChainでMarqoエコシステムを使用する方法について説明します。

### **Marqoとは?**

Marqoは、メモリ内のHNSWインデックスに格納されたエンベディングを使用して、最先端の検索速度を実現するテンサー検索エンジンです。Marqoは、水平方向のインデックスシャーディングを使用して、数百万件のドキュメントインデックスにスケーリングすることができ、非同期およびノンブロッキングのデータアップロードと検索を可能にします。Marqoは、PyTorch、Hugging Face、OpenAIなどの最新のマシンラーニングモデルを使用しています。事前設定されたモデルから始めることも、独自のモデルを使用することもできます。組み込みのONNXサポートと変換により、CPUおよびGPUでの高速推論と高スループットが可能になります。

Marqoには独自の推論機能があるため、ドキュメントにテキストと画像を組み合わせることができ、エンベディングの互換性を気にすることなく、Marqoインデックスをlangchainエコシステムに取り入れることができます。

Marqoの展開は柔軟で、自分でdockerイメージを使ってすぐに始めることができますし、[managed cloud offering](https://www.marqo.ai/pricing)についてお問い合わせることもできます。

Marqoをローカルで実行するには、[getting started](https://docs.marqo.ai/latest/)をご覧ください。

## インストールとセットアップ

- `pip install marqo`でPythonSDKをインストールします

## ラッパー

### VectorStore

Marqoインデックスをラップするラッパーが用意されており、ベクトルストアフレームワーク内で使用できます。Marqoでは、エンベディングを生成するためのモデルを選択したり、前処理の設定を公開したりすることができます。

Marqoベクトルストアは、ドキュメントに画像とテキストが混在するマルチモーダルなインデックスとも連携できます。詳細については[our documentation](https://docs.marqo.ai/latest/#multi-modal-and-cross-modal-search)をご覧ください。既存のマルチモーダルインデックスでMarqoベクトルストアをインスタンス化すると、langchainベクトルストアの`add_texts`メソッドを使ってドキュメントを追加することはできなくなります。

このベクトルストアをインポートするには:

```python
<!--IMPORTS:[{"imported": "Marqo", "source": "langchain_community.vectorstores", "docs": "https://api.python.langchain.com/en/latest/vectorstores/langchain_community.vectorstores.marqo.Marqo.html", "title": "Marqo"}]-->
from langchain_community.vectorstores import Marqo
```

Marqoラッパーとその特徴的な機能の詳細な解説は、[this notebook](/docs/integrations/vectorstores/marqo)をご覧ください。
