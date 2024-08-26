---
translated: true
---

# Blockchain

## Vue d'ensemble

L'intention de ce cahier est de fournir un moyen de tester la fonctionnalité dans le Langchain Document Loader pour Blockchain.

Initialement, ce chargeur prend en charge :

*   Chargement de NFTs en tant que documents à partir de contrats intelligents NFT (ERC721 et ERC1155)
*   Ethereum Mainnet, Ethereum Testnet, Polygon Mainnet, Polygon Testnet (par défaut, c'est eth-mainnet)
*   API getNFTsForCollection d'Alchemy

Il peut être étendu si la communauté trouve de la valeur dans ce chargeur. Plus précisément :

*   Des APIs supplémentaires peuvent être ajoutées (par exemple, des APIs liées aux transactions)

Ce chargeur de documents nécessite :

*   Une [clé API Alchemy](https://www.alchemy.com/) gratuite

La sortie prend le format suivant :

- pageContent= NFT individuel
- metadata={'source': '0x1a92f7381b9f03921564a437210bb9396471050c', 'blockchain': 'eth-mainnet', 'tokenId': '0x15'})

## Charger des NFTs dans Document Loader

```python
# get ALCHEMY_API_KEY from https://www.alchemy.com/

alchemyApiKey = "..."
```

### Option 1 : Ethereum Mainnet (BlockchainType par défaut)

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

### Option 2 : Polygon Mainnet

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
