---
translated: true
---

# 近くのブロックチェーン

## 概要

このノートブックの目的は、Langchain Document Loaderの Near Blockchainの機能をテストする手段を提供することです。

最初はこのローダーが以下をサポートしています:

*   NEP-171およびNEP-177のNFTスマートコントラクトからのNFTのドキュメントの読み込み
*   Near Mainnet、Near Testnet(デフォルトはメインネット)
*   Mintbaseのグラフ API

コミュニティがこのローダーに価値を見出せば、拡張することができます。具体的には:

*   追加のAPIを追加できます(例:トランザクション関連のAPI)

このドキュメントローダーには以下が必要です:

*   無料の[Mintbase APIキー](https://docs.mintbase.xyz/dev/mintbase-graph/)

出力は以下の形式になります:

- pageContent= 個別のNFT
- metadata={'source': 'nft.yearofchef.near', 'blockchain': 'mainnet', 'tokenId': '1846'}

## ドキュメントローダーにNFTを読み込む

```python
# get MINTBASE_API_KEY from https://docs.mintbase.xyz/dev/mintbase-graph/

mintbaseApiKey = "..."
```

### オプション1: Ethereum メインネット(デフォルトのBlockchainType)

```python
from MintbaseLoader import MintbaseDocumentLoader

contractAddress = "nft.yearofchef.near"  # Year of chef contract address


blockchainLoader = MintbaseDocumentLoader(
    contract_address=contractAddress, blockchain_type="mainnet", api_key="omni-site"
)

nfts = blockchainLoader.load()

print(nfts[:1])

for doc in blockchainLoader.lazy_load():
    print()
    print(type(doc))
    print(doc)
```
