---
translated: true
---

# Blockchain Near

## Resumen

La intención de este cuaderno es proporcionar un medio para probar la funcionalidad del Langchain Document Loader para la Blockchain Near.

Inicialmente, este Cargador admite:

*   Carga de NFT como Documentos desde Contratos Inteligentes de NFT (NEP-171 y NEP-177)
*   Near Mainnnet, Near Testnet (el valor predeterminado es mainnet)
*   API de Graph de Mintbase

Se puede ampliar si la comunidad encuentra valor en este cargador. Específicamente:

*   Se pueden agregar APIs adicionales (por ejemplo, APIs relacionadas con Transacciones)

Este Cargador de Documentos Requiere:

*   Una [Clave API de Mintbase](https://docs.mintbase.xyz/dev/mintbase-graph/) gratuita

El resultado tiene el siguiente formato:

- pageContent= NFT individual
- metadata={'source': 'nft.yearofchef.near', 'blockchain': 'mainnet', 'tokenId': '1846'}

## Cargar NFT en el Cargador de Documentos

```python
# get MINTBASE_API_KEY from https://docs.mintbase.xyz/dev/mintbase-graph/

mintbaseApiKey = "..."
```

### Opción 1: Ethereum Mainnet (BlockchainType predeterminado)

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
