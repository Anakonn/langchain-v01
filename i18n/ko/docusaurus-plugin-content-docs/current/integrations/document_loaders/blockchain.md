---
translated: true
---

# 블록체인

## 개요

이 노트북의 목적은 블록체인 문서 로더의 기능을 테스트할 수 있는 방법을 제공하는 것입니다.
초기에 이 로더는 다음을 지원합니다:

*   NFT 스마트 계약(ERC721 및 ERC1155)에서 NFT를 문서로 로드하기
*   이더리움 메인넷, 이더리움 테스트넷, 폴리곤 메인넷, 폴리곤 테스트넷(기본값은 eth-mainnet)
*   Alchemy의 getNFTsForCollection API
커뮤니티에서 이 로더의 가치를 발견하면 확장될 수 있습니다. 구체적으로:
*   추가 API(예: 트랜잭션 관련 API)를 추가할 수 있습니다.

이 문서 로더에는 다음이 필요합니다:

*   무료 [Alchemy API 키](https://www.alchemy.com/)
출력은 다음과 같은 형식을 취합니다:
- pageContent= 개별 NFT
- metadata={'source': '0x1a92f7381b9f03921564a437210bb9396471050c', 'blockchain': 'eth-mainnet', 'tokenId': '0x15'})

## NFT 문서 로더에 로드하기


```python
# get ALCHEMY_API_KEY from https://www.alchemy.com/

alchemyApiKey = "..."
```

이 문장에는 "NFTs"라는 용어가 포함되어 있습니다. "NFT"는 "Non-Fungible Token"의 약어로, 이는 암호화폐 분야에서 사용되는 용어입니다. 이 용어의 정확한 의미를 확실히 하기 위해 원문 용어를 포함하여 번역하였습니다.

### 옵션 1: Ethereum Mainnet (기본 BlockchainType)

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

### 옵션 2: Polygon Mainnet

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

옵션 2는 Polygon Mainnet입니다. Polygon은 이더리움 기반의 확장성 있는 블록체인 플랫폼입니다. 이 옵션을 선택하면 Polygon 네트워크에서 작업할 수 있습니다.

