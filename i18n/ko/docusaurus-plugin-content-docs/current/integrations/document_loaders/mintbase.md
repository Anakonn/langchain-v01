---
translated: true
---

# 근접 블록체인

## 개요

이 노트북의 목적은 Near Blockchain용 Langchain Document Loader의 기능을 테스트할 수 있는 방법을 제공하는 것입니다.

초기에 이 로더는 다음을 지원합니다:

*   NFT 스마트 계약(NEP-171 및 NEP-177)에서 NFT를 문서로 로드
*   Near Mainnet, Near Testnet (기본값은 mainnet)
*   Mintbase의 Graph API

이 로더는 커뮤니티에서 가치를 발견하는 경우 확장될 수 있습니다. 구체적으로:

*   추가 API를 추가할 수 있습니다(예: 트랜잭션 관련 API)

이 문서 로더에는 다음이 필요합니다:

*   무료 [Mintbase API 키](https://docs.mintbase.xyz/dev/mintbase-graph/)

출력은 다음과 같은 형식을 취합니다:

- pageContent= 개별 NFT
- metadata={'source': 'nft.yearofchef.near', 'blockchain': 'mainnet', 'tokenId': '1846'}

## 문서 로더에 NFT 로드

```python
# get MINTBASE_API_KEY from https://docs.mintbase.xyz/dev/mintbase-graph/

mintbaseApiKey = "..."
```

### 옵션 1: 이더리움 메인넷(기본 BlockchainType)

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
