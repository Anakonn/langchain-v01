---
sidebar_position: 1.5
translated: true
---

# स्ट्रीमिंग

सभी ChatModels रनेबल इंटरफ़ेस को लागू करते हैं, जिसमें सभी विधियों के डिफ़ॉल्ट कार्यान्वयन होते हैं, यानी ainvoke, batch, abatch, stream, astream। इससे सभी ChatModels को स्ट्रीमिंग के लिए मूलभूत समर्थन मिलता है।

स्ट्रीमिंग समर्थन डिफ़ॉल्ट रूप से एक इटरेटर (या async स्ट्रीमिंग के मामले में AsyncIterator) को वापस देता है, जो अंतिम परिणाम है जो अंतर्निहित ChatModel प्रदाता द्वारा वापस किया जाता है। यह स्पष्ट रूप से आपको टोकन-दर-टोकन स्ट्रीमिंग नहीं देता है, जो ChatModel प्रदाता से नेटिव समर्थन की आवश्यकता होती है, लेकिन यह सुनिश्चित करता है कि टोकन के इटरेटर की उम्मीद करने वाला आपका कोड हमारे किसी भी ChatModel एकीकरण के लिए काम करेगा।

यहां देखें कि कौन से [एकीकरण टोकन-दर-टोकन स्ट्रीमिंग का समर्थन करते हैं](/docs/integrations/chat/)।

```python
from langchain_community.chat_models import ChatAnthropic
```

```python
chat = ChatAnthropic(model="claude-2")
for chunk in chat.stream("Write me a song about goldfish on the moon"):
    print(chunk.content, end="", flush=True)
```

```output
 Here's a song I just improvised about goldfish on the moon:

Floating in space, looking for a place
To call their home, all alone
Swimming through stars, these goldfish from Mars
Left their fishbowl behind, a new life to find
On the moon, where the craters loom
Searching for food, maybe some lunar food
Out of their depth, close to death
How they wish, for just one small fish
To join them up here, their future unclear
On the moon, where the Earth looms
Dreaming of home, filled with foam
Their bodies adapt, continuing to last
On the moon, where they learn to swoon
Over cheese that astronauts tease
As they stare back at Earth, the planet of birth
These goldfish out of water, swim on and on
Lunar pioneers, conquering their fears
On the moon, where they happily swoon
```
