---
translated: true
---

डेटाब्रिक्स
==========

[डेटाब्रिक्स](https://www.databricks.com/) लेकहाउस प्लेटफॉर्म डेटा, विश्लेषण और AI को एक मंच पर एकीकृत करता है।

डेटाब्रिक्स विभिन्न तरीकों से LangChain पारिस्थितिकी तंत्र को अपनाता है:

1. SQLDatabase श्रृंखला के लिए डेटाब्रिक्स कनेक्टर: SQLDatabase.from_databricks() LangChain के माध्यम से आपके डेटाब्रिक्स पर डेटा को क्वेरी करने का एक आसान तरीका प्रदान करता है।
2. डेटाब्रिक्स MLflow LangChain के साथ एकीकृत है: कम कदमों के साथ LangChain अनुप्रयोगों को ट्रैक और सर्व करना
3. एक LLM प्रदाता के रूप में डेटाब्रिक्स: अपने फाइन-ट्यून किए गए LLM को डेटाब्रिक्स पर सर्विंग एंडपॉइंट या क्लस्टर ड्राइवर प्रॉक्सी ऐप के माध्यम से तैनात करें, और इसे langchain.llms.Databricks के रूप में क्वेरी करें।
4. डेटाब्रिक्स डॉली: डेटाब्रिक्स ने डॉली को ओपन-सोर्स किया है जो वाणिज्यिक उपयोग की अनुमति देता है, और इसे Hugging Face Hub के माध्यम से एक्सेस किया जा सकता है।

SQLDatabase श्रृंखला के लिए डेटाब्रिक्स कनेक्टर
----------------------------------------------
आप [डेटाब्रिक्स रनटाइम](https://docs.databricks.com/runtime/index.html) और [डेटाब्रिक्स SQL](https://www.databricks.com/product/databricks-sql) से LangChain के SQLDatabase रैपर का उपयोग करके कनेक्ट कर सकते हैं।

डेटाब्रिक्स MLflow LangChain के साथ एकीकृत है
-------------------------------------------

MLflow एक ओपन-सोर्स प्लेटफॉर्म है जो ML लाइफसाइकिल का प्रबंधन करता है, जिसमें प्रयोग, पुनरुत्पादन, तैनाती और एक केंद्रीय मॉडल रजिस्ट्री शामिल हैं। [MLflow कॉलबैक हैंडलर](/docs/integrations/providers/mlflow_tracking) नोटबुक में MLflow के LangChain के साथ एकीकरण के बारे में विवरण देखें।

डेटाब्रिक्स एंटरप्राइज सुरक्षा सुविधाओं, उच्च उपलब्धता और अन्य डेटाब्रिक्स वर्कस्पेस सुविधाओं जैसे प्रयोग और रन प्रबंधन और नोटबुक संशोधन कैप्चर के साथ एकीकृत एक पूरी तरह से प्रबंधित और होस्ट किया गया MLflow का एक संस्करण प्रदान करता है। डेटाब्रिक्स पर MLflow का उपयोग मशीन लर्निंग मॉडल प्रशिक्षण रन और मशीन लर्निंग परियोजनाओं को ट्रैक और सुरक्षित करने के लिए एकीकृत अनुभव प्रदान करता है। [MLflow गाइड](https://docs.databricks.com/mlflow/index.html) में अधिक जानकारी देखें।

डेटाब्रिक्स MLflow LangChain अनुप्रयोगों को डेटाब्रिक्स पर विकसित करना अधिक सुविधाजनक बनाता है। MLflow ट्रैकिंग के लिए, आपको ट्रैकिंग यूआरआई सेट करने की आवश्यकता नहीं है। MLflow मॉडल सर्विंग के लिए, आप LangChain श्रृंखलाओं को MLflow langchain स्वाद में सहेज सकते हैं, और फिर कुछ क्लिक के साथ डेटाब्रिक्स पर श्रृंखला को पंजीकृत और सर्व कर सकते हैं, जहां क्रेडेंशियल MLflow मॉडल सर्विंग द्वारा सुरक्षित रूप से प्रबंधित किए जाते हैं।

डेटाब्रिक्स बाहरी मॉडल
--------------------------

[डेटाब्रिक्स बाहरी मॉडल](https://docs.databricks.com/generative-ai/external-models/index.html) एक सेवा है जो विभिन्न बड़े भाषा मॉडल (LLM) प्रदाताओं, जैसे OpenAI और Anthropic, का उपयोग और प्रबंधन को संगठन के भीतर आसान बनाने के लिए डिज़ाइन किया गया है। यह एक उच्च-स्तरीय इंटरफ़ेस प्रदान करता है जो इन सेवाओं के साथ बातचीत को सरल बनाता है, क्योंकि यह विशिष्ट LLM संबंधित अनुरोधों को संभालने के लिए एक एकीकृत एंडपॉइंट प्रदान करता है। निम्नलिखित उदाहरण OpenAI के GPT-4 मॉडल को सर्व करने वाला एक एंडपॉइंट बनाता है और इससे एक चैट प्रतिक्रिया उत्पन्न करता है:

```python
<!--IMPORTS:[{"imported": "ChatDatabricks", "source": "langchain_community.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.databricks.ChatDatabricks.html", "title": "-> content='Hello! How can I assist you today?'"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "-> content='Hello! How can I assist you today?'"}]-->
from langchain_community.chat_models import ChatDatabricks
from langchain_core.messages import HumanMessage
from mlflow.deployments import get_deploy_client


client = get_deploy_client("databricks")
name = f"chat"
client.create_endpoint(
    name=name,
    config={
        "served_entities": [
            {
                "name": "test",
                "external_model": {
                    "name": "gpt-4",
                    "provider": "openai",
                    "task": "llm/v1/chat",
                    "openai_config": {
                        "openai_api_key": "{{secrets/<scope>/<key>}}",
                    },
                },
            }
        ],
    },
)
chat = ChatDatabricks(endpoint=name, temperature=0.1)
print(chat([HumanMessage(content="hello")]))
# -> content='Hello! How can I assist you today?'
```

डेटाब्रिक्स फाउंडेशन मॉडल एपीआई
--------------------------------

[डेटाब्रिक्स फाउंडेशन मॉडल एपीआई](https://docs.databricks.com/machine-learning/foundation-models/index.html) आपको समर्पित सर्विंग एंडपॉइंट से उच्च गुणवत्ता वाले ओपन सोर्स मॉडल तक पहुंच और उन्हें क्वेरी करने की अनुमति देते हैं। फाउंडेशन मॉडल एपीआई के साथ, डेवलपर्स अपने खुद के मॉडल तैनाती को बनाए रखे बिना जेनरेटिव AI मॉडल का उपयोग करने वाले अनुप्रयोग बनाने में तेजी से और आसानी से कर सकते हैं। निम्नलिखित उदाहरण `databricks-bge-large-en` एंडपॉइंट का उपयोग करके पाठ से एम्बेडिंग उत्पन्न करता है:

```python
<!--IMPORTS:[{"imported": "DatabricksEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.databricks.DatabricksEmbeddings.html", "title": "-> content='Hello! How can I assist you today?'"}]-->
from langchain_community.embeddings import DatabricksEmbeddings


embeddings = DatabricksEmbeddings(endpoint="databricks-bge-large-en")
print(embeddings.embed_query("hello")[:3])
# -> [0.051055908203125, 0.007221221923828125, 0.003879547119140625, ...]
```

डेटाब्रिक्स एक LLM प्रदाता के रूप में
-----------------------------

[डेटाब्रिक्स एंडपॉइंट को LLM के रूप में लपेटना](/docs/integrations/llms/databricks#wrapping-a-serving-endpoint-custom-model) नोटबुक MLflow द्वारा पंजीकृत एक कस्टम मॉडल को डेटाब्रिक्स एंडपॉइंट के रूप में कैसे सर्व करना है, दिखाता है।
यह दो प्रकार के एंडपॉइंट का समर्थन करता है: सर्विंग एंडपॉइंट, जो उत्पादन और विकास दोनों के लिए अनुशंसित है, और क्लस्टर ड्राइवर प्रॉक्सी ऐप, जो इंटरैक्टिव विकास के लिए अनुशंसित है।

डेटाब्रिक्स वेक्टर खोज
------------------------

डेटाब्रिक्स वेक्टर खोज एक सर्वरलेस समानता खोज इंजन है जो आपके डेटा का एक वेक्टर प्रतिनिधित्व, मेटाडेटा सहित, किसी वेक्टर डेटाबेस में संग्रहीत करने की अनुमति देता है। वेक्टर खोज के साथ, आप यूनिटी कैटलॉग द्वारा प्रबंधित डेल्टा तेबलों से स्वचालित अपडेट होने वाले वेक्टर खोज इंडेक्स बना सकते हैं और सबसे समान वेक्टरों को वापस लौटाने के लिए एक सरल एपीआई का उपयोग कर सकते हैं। [डेटाब्रिक्स वेक्टर खोज](/docs/integrations/vectorstores/databricks_vector_search) नोटबुक में LangChain के साथ इसका उपयोग करने के लिए निर्देश देखें।
