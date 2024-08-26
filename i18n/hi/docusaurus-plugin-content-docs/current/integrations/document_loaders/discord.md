---
translated: true
---

# डिस्कॉर्ड

>[डिस्कॉर्ड](https://discord.com/) एक VoIP और तत्काल संदेशन सामाजिक मंच है। उपयोगकर्ताओं के पास आवाज कॉल, वीडियो कॉल, पाठ संदेशन, मीडिया और निजी चैट या "सर्वर" कहे जाने वाली समुदायों के हिस्से के रूप में फ़ाइलों के साथ संवाद करने की क्षमता है। एक सर्वर आमंत्रण लिंक के माध्यम से पहुंचा जा सकने वाला स्थायी चैट कमरों और आवाज चैनलों का संग्रह है।

अपना `डिस्कॉर्ड` डेटा डाउनलोड करने के लिए इन चरणों का पालन करें:

1. अपने **उपयोगकर्ता सेटिंग्स** पर जाएं
2. फिर **गोपनीयता और सुरक्षा** पर जाएं
3. **मेरा सारा डेटा अनुरोध करें** पर जाएं और **डेटा अनुरोध करें** बटन पर क्लिक करें

आपको अपना डेटा प्राप्त करने में 30 दिन तक का समय लग सकता है। आपको उस ईमेल पर एक ईमेल मिलेगा जो डिस्कॉर्ड के साथ पंजीकृत है। उस ईमेल में एक डाउनलोड बटन होगा जिसका उपयोग करके आप अपना व्यक्तिगत डिस्कॉर्ड डेटा डाउनलोड कर सकते हैं।

```python
import os

import pandas as pd
```

```python
path = input('Please enter the path to the contents of the Discord "messages" folder: ')
li = []
for f in os.listdir(path):
    expected_csv_path = os.path.join(path, f, "messages.csv")
    csv_exists = os.path.isfile(expected_csv_path)
    if csv_exists:
        df = pd.read_csv(expected_csv_path, index_col=None, header=0)
        li.append(df)

df = pd.concat(li, axis=0, ignore_index=True, sort=False)
```

```python
from langchain_community.document_loaders.discord import DiscordChatLoader
```

```python
loader = DiscordChatLoader(df, user_id_col="ID")
print(loader.load())
```
