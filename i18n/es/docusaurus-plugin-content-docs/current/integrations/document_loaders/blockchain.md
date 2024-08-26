---
translated: true
---

# Blockchain

## Resumen

La intención de este cuaderno es proporcionar un medio para probar la funcionalidad del Langchain Document Loader para Blockchain.

Inicialmente, este Cargador admite:

*   Cargar NFTs como Documentos desde Contratos Inteligentes NFT (ERC721 y ERC1155)
*   Ethereum Mainnnet, Ethereum Testnet, Polygon Mainnet, Polygon Testnet (el valor predeterminado es eth-mainnet)
*   API getNFTsForCollection de Alchemy

Se puede ampliar si la comunidad encuentra valor en este cargador. Específicamente:

*   Se pueden agregar APIs adicionales (por ejemplo, APIs relacionadas con transacciones)

Este Cargador de Documentos Requiere:

*   Una [Clave API de Alchemy](https://www.alchemy.com/) gratuita

La salida tiene el siguiente formato:

- pageContent= NFT individual
- metadata={'source': '0x1a92f7381b9f03921564a437210bb9396471050c', 'blockchain': 'eth-mainnet', 'tokenId': '0x15'})

## Cargar NFTs en el Cargador de Documentos

```python
# get ALCHEMY_API_KEY from https://www.alchemy.com/

alchemyApiKey = "..."
```

### Opción 1: Ethereum Mainnet (BlockchainType predeterminado)

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

### Opción 2: Polygon Mainnet

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
