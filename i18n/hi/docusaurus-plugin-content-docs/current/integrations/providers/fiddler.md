---
translated: true
---

# फिडलर

>[फिडलर](https://www.fiddler.ai/) एक एकीकृत मंच प्रदान करता है जो एक उद्यम स्तर पर एमएल तैनाती की निगरानी, व्याख्या, विश्लेषण और सुधार करता है।

## स्थापना और सेटअप

फिडलर के साथ अपना मॉडल [सेट करें](https://demo.fiddler.ai):

* आप फिडलर से कनेक्ट करने के लिए उपयोग कर रहे यूआरएल
* आपका संगठन आईडी
* आपका प्राधिकरण टोकन

पायथन पैकेज स्थापित करें:

```bash
pip install fiddler-client
```

## कॉलबैक

```python
<!--IMPORTS:[{"imported": "FiddlerCallbackHandler", "source": "langchain_community.callbacks.fiddler_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.fiddler_callback.FiddlerCallbackHandler.html", "title": "Fiddler"}]-->
from langchain_community.callbacks.fiddler_callback import FiddlerCallbackHandler
```

[उदाहरण](/docs/integrations/callbacks/fiddler) देखें।
