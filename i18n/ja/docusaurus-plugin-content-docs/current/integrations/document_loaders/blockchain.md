---
translated: true
---

# ブロックチェーン

## 概要

このノートブックの目的は、ブロックチェーンのLangChain Document Loaderの機能をテストする手段を提供することです。

このローダーは当初以下をサポートしています:

*   ERC721およびERC1155のNFTスマートコントラクトからのNFTのロード
*   Ethereumメインネット、Ethereumテストネット、Polygonメインネット、Polygonテストネット(デフォルトはeth-mainnet)
*   Alchemyの`getNFTsForCollection` API

コミュニティがこのローダーに価値を見出せば、さらに拡張できます。具体的には:

*   追加のAPIを追加できます(例: トランザクション関連のAPI)

このドキュメントローダーには以下が必要です:

*   無料の[Alchemy APIキー](https://www.alchemy.com/)

出力は以下の形式になります:

- pageContent= 個々のNFT
- metadata={'source': '0x1a92f7381b9f03921564a437210bb9396471050c', 'blockchain': 'eth-mainnet', 'tokenId': '0x15'})

## ドキュメントローダーにNFTをロードする

```python
# get ALCHEMY_API_KEY from https://www.alchemy.com/

alchemyApiKey = "..."
```

### オプション1: Ethereumメインネット(デフォルトのBlockchainType)

```python
from langchain_community.document_loaders.blockchain import (
    BlockchainDocumentLoader,
    BlockchainType,
)

contractAddress = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"  # Bored Ape Yacht Club contract address

blockchainType = BlockchainType.ETH_MAINNET  # default value, optional parameter

blockchainLoader = BlockchainDocumentLoader(
    contract_address=contractAddress, api_key=alchemyApiKey
)

nfts = blockchainLoader.load()

nfts[:2]
```

### オプション2: Polygonメインネット

```python
contractAddress = (
    "0x448676ffCd0aDf2D85C1f0565e8dde6924A9A7D9"  # Polygon Mainnet contract address
)

blockchainType = BlockchainType.POLYGON_MAINNET

blockchainLoader = BlockchainDocumentLoader(
    contract_address=contractAddress,
    blockchainType=blockchainType,
    api_key=alchemyApiKey,
)

nfts = blockchainLoader.load()

nfts[:2]
```
