---
translated: true
---

# नियर ब्लॉकचेन

## अवलोकन

इस नोटबुक का उद्देश्य लैंगचेन डॉक्यूमेंट लोडर के लिए नियर ब्लॉकचेन में कार्यक्षमता का परीक्षण करने का एक तरीका प्रदान करना है।

शुरू में यह लोडर निम्नलिखित को समर्थन करता है:

*   एनएफटी स्मार्ट कॉन्ट्रैक्ट (एनईपी-171 और एनईपी-177) से एनएफटी को दस्तावेज के रूप में लोड करना
*   नियर मेनलैंड, नियर टेस्टनेट (डिफ़ॉल्ट मेनलैंड है)
*   मिंटबेस के ग्राफ एपीआई

यदि समुदाय इस लोडर में मूल्य पाता है, तो इसे विस्तारित किया जा सकता है। विशेष रूप से:

*   अतिरिक्त एपीआई जोड़े जा सकते हैं (जैसे लेनदेन से संबंधित एपीआई)

इस दस्तावेज़ लोडर के लिए आवश्यक है:

*   एक मुफ्त [मिंटबेस एपीआई कुंजी](https://docs.mintbase.xyz/dev/mintbase-graph/)

आउटपुट निम्नलिखित प्रारूप में होता है:

- pageContent= व्यक्तिगत एनएफटी
- metadata={'source': 'nft.yearofchef.near', 'blockchain': 'mainnet', 'tokenId': '1846'}

## दस्तावेज़ लोडर में एनएफटी लोड करें

```python
# get MINTBASE_API_KEY from https://docs.mintbase.xyz/dev/mintbase-graph/

mintbaseApiKey = "..."
```

### विकल्प 1: ईथेरियम मेनलैंड (डिफ़ॉल्ट BlockchainType)

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
