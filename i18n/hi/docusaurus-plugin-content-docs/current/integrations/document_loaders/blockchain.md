---
translated: true
---

# ब्लॉकचेन

## अवलोकन

इस नोटबुक का उद्देश्य लैंगचेन डॉक्यूमेंट लोडर के लिए ब्लॉकचेन में कार्यक्षमता का परीक्षण करने का एक तरीका प्रदान करना है।

शुरू में यह लोडर निम्नलिखित को समर्थन देता है:

*   एनएफटी स्मार्ट कॉन्ट्रैक्ट (ईआरसी721 और ईआरसी1155) से एनएफटी को डॉक्यूमेंट के रूप में लोड करना
*   ईथेरियम मेननेट, ईथेरियम टेस्टनेट, पॉलिगॉन मेननेट, पॉलिगॉन टेस्टनेट (डिफ़ॉल्ट eth-mainnet है)
*   एल्केमी का getNFTsForCollection API

यदि समुदाय इस लोडर में मूल्य पाता है, तो इसे विस्तारित किया जा सकता है। विशेष रूप से:

*   अतिरिक्त एपीआई जोड़े जा सकते हैं (जैसे लेनदेन से संबंधित एपीआई)

इस डॉक्यूमेंट लोडर के लिए आवश्यक है:

*   एक मुफ्त [एल्केमी एपीआई कुंजी](https://www.alchemy.com/)

आउटपुट निम्नलिखित प्रारूप में होता है:

- pageContent= व्यक्तिगत एनएफटी
- metadata={'source': '0x1a92f7381b9f03921564a437210bb9396471050c', 'blockchain': 'eth-mainnet', 'tokenId': '0x15'})

## डॉक्यूमेंट लोडर में एनएफटी लोड करें

```python
# get ALCHEMY_API_KEY from https://www.alchemy.com/

alchemyApiKey = "..."
```

### विकल्प 1: ईथेरियम मेननेट (डिफ़ॉल्ट BlockchainType)

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

### विकल्प 2: पॉलिगॉन मेननेट

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
