---
translated: true
---

# Blockchain Near

## Aperçu

L'intention de ce cahier est de fournir un moyen de tester la fonctionnalité du chargeur de documents Langchain pour la blockchain Near.

Initialement, ce chargeur prend en charge :

*   Chargement de NFT en tant que documents à partir de contrats intelligents NFT (NEP-171 et NEP-177)
*   Near Mainnnet, Near Testnet (par défaut est le mainnet)
*   L'API Graph de Mintbase

Il peut être étendu si la communauté trouve de la valeur dans ce chargeur. Spécifiquement :

*   Des API supplémentaires peuvent être ajoutées (par exemple, les API liées aux transactions)

Ce chargeur de documents nécessite :

*   Une [clé API Mintbase](https://docs.mintbase.xyz/dev/mintbase-graph/) gratuite

La sortie prend le format suivant :

- pageContent= NFT individuel
- metadata={'source': 'nft.yearofchef.near', 'blockchain': 'mainnet', 'tokenId': '1846'}

## Charger des NFT dans le chargeur de documents

```python
# get MINTBASE_API_KEY from https://docs.mintbase.xyz/dev/mintbase-graph/

mintbaseApiKey = "..."
```

### Option 1 : Ethereum Mainnet (BlockchainType par défaut)

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
