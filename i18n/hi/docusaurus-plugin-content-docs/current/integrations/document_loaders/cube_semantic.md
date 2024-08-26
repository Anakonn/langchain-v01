---
translated: true
---

# क्यूब सेमेंटिक लेयर

यह नोटबुक क्यूब के डेटा मॉडल मेटाडेटा को एलएलएम के रूप में पारित करने के लिए उपयुक्त प्रारूप में पुनर्प्राप्त करने की प्रक्रिया को दर्शाता है, जिससे संदर्भात्मक जानकारी बढ़ जाती है।

### क्यूब के बारे में

[क्यूब](https://cube.dev/) डेटा ऐप्स बनाने के लिए सेमेंटिक लेयर है। यह डेटा इंजीनियरों और एप्लिकेशन डेवलपर्स को आधुनिक डेटा स्टोर से डेटा तक पहुंचने, इसे सुसंगत परिभाषाओं में संगठित करने और हर एप्लिकेशन तक पहुंचाने में मदद करता है।

क्यूब का डेटा मॉडल एलएलएम को डेटा को समझने और सही क्वेरी जनरेट करने के लिए संदर्भ के रूप में उपयोग किए जाने वाले संरचना और परिभाषाएं प्रदान करता है। एलएलएम को जटिल जोड़ और मीट्रिक्स गणना नेविगेट करने की आवश्यकता नहीं है क्योंकि क्यूब उन्हें अमूर्त करता है और व्यावसायिक स्तर की शब्दावली पर काम करने वाले सरल इंटरफ़ेस प्रदान करता है, न कि SQL टेबल और कॉलम नाम। यह सरलीकरण एलएलएम को कम त्रुटि-प्रवण और हैलुसिनेशन से बचाने में मदद करता है।

### उदाहरण

**इनपुट तर्क (अनिवार्य)**

`क्यूब सेमेंटिक लोडर` को 2 तर्क की आवश्यकता होती है:

- `cube_api_url`: आपके क्यूब के तैनाती REST API का URL। कृपया आधार पथ कॉन्फ़िगर करने के बारे में अधिक जानकारी के लिए [क्यूब दस्तावेज़](https://cube.dev/docs/http-api/rest#configuration-base-path) देखें।

- `cube_api_token`: आपके क्यूब के API गुप्त कुंजी के आधार पर जनरेट किया गया प्रमाणीकरण टोकन। JSON वेब टोकन (JWT) जनरेट करने के लिए [क्यूब दस्तावेज़](https://cube.dev/docs/security#generating-json-web-tokens-jwt) देखें।

**इनपुट तर्क (वैकल्पिक)**

- `load_dimension_values`: क्या प्रत्येक स्ट्रिंग आयाम के लिए आयाम मूल्य लोड करना है या नहीं।

- `dimension_values_limit`: आयाम मूल्य लोड करने के लिए अधिकतम संख्या।

- `dimension_values_max_retries`: आयाम मूल्य लोड करने के लिए अधिकतम पुनः प्रयास।

- `dimension_values_retry_delay`: आयाम मूल्य लोड करने के लिए पुनः प्रयास के बीच विलंब।

```python
import jwt
from langchain_community.document_loaders import CubeSemanticLoader

api_url = "https://api-example.gcp-us-central1.cubecloudapp.dev/cubejs-api/v1/meta"
cubejs_api_secret = "api-secret-here"
security_context = {}
# Read more about security context here: https://cube.dev/docs/security
api_token = jwt.encode(security_context, cubejs_api_secret, algorithm="HS256")

loader = CubeSemanticLoader(api_url, api_token)

documents = loader.load()
```

निम्नलिखित विशेषताओं के साथ दस्तावेजों की एक सूची वापस करता है:

- `page_content`
- `metadata`
  - `table_name`
  - `column_name`
  - `column_data_type`
  - `column_title`
  - `column_description`
  - `column_values`
  - `cube_data_obj_type`

```python
# Given string containing page content
page_content = "Users View City, None"

# Given dictionary containing metadata
metadata = {
    "table_name": "users_view",
    "column_name": "users_view.city",
    "column_data_type": "string",
    "column_title": "Users View City",
    "column_description": "None",
    "column_member_type": "dimension",
    "column_values": [
        "Austin",
        "Chicago",
        "Los Angeles",
        "Mountain View",
        "New York",
        "Palo Alto",
        "San Francisco",
        "Seattle",
    ],
    "cube_data_obj_type": "view",
}
```
