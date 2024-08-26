---
sidebar_label: मंच पर आगे बढ़ना
translated: true
---

# मंच पर आगे बढ़ना ग्राउंडेडनेस जांच

यह नोटबुक मंच पर आगे बढ़ना ग्राउंडेडनेस जांच मॉडल्स शुरू करने के बारे में कवर करता है।

## इंस्टॉलेशन

`langchain-upstage` पैकेज इंस्टॉल करें।

```bash
pip install -U langchain-upstage
```

## पर्यावरण सेटअप

निम्नलिखित पर्यावरण चर सेट करना सुनिश्चित करें:

- `UPSTAGE_API_KEY`: [Upstage developers document](https://developers.upstage.ai/docs/getting-started/quick-start) से आपका Upstage API कुंजी।

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

## उपयोग

`UpstageGroundednessCheck` क्लास को इनिशियलाइज़ करें।

```python
from langchain_upstage import UpstageGroundednessCheck

groundedness_check = UpstageGroundednessCheck()
```

इनपुट टेक्स्ट की ग्राउंडेडनेस जांच करने के लिए `run` मेथड का उपयोग करें।

```python
request_input = {
    "context": "Mauna Kea is an inactive volcano on the island of Hawai'i. Its peak is 4,207.3 m above sea level, making it the highest point in Hawaii and second-highest peak of an island on Earth.",
    "answer": "Mauna Kea is 5,207.3 meters tall.",
}

response = groundedness_check.invoke(request_input)
print(response)
```
