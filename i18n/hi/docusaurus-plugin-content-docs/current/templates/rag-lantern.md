---
translated: true
---

# rag_lantern

यह टेम्पलेट Lantern के साथ RAG का प्रदर्शन करता है।

[Lantern](https://lantern.dev) एक ओपन-सोर्स वेक्टर डेटाबेस है जो [PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL) पर बनाया गया है। यह आपके डेटाबेस के भीतर वेक्टर खोज और एम्बेडिंग जनरेशन को सक्षम करता है।

## वातावरण सेटअप

OpenAI मॉडल्स तक पहुंच प्राप्त करने के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

अपना `OPENAI_API_KEY` प्राप्त करने के लिए, अपने OpenAI खाते पर [API कुंजियां](https://platform.openai.com/account/api-keys) पर जाएं और एक नया गोपनीय कुंजी बनाएं।

अपना `LANTERN_URL` और `LANTERN_SERVICE_KEY` प्राप्त करने के लिए, अपने Lantern प्रोजेक्ट के [API सेटिंग्स](https://lantern.dev/dashboard/project/_/settings/api) पर जाएं।

- `LANTERN_URL` प्रोजेक्ट URL से संबंधित है
- `LANTERN_SERVICE_KEY` `service_role` API कुंजी से संबंधित है

```shell
export LANTERN_URL=
export LANTERN_SERVICE_KEY=
export OPENAI_API_KEY=
```

## Lantern डेटाबेस सेटअप

अगर आप पहले से ही अपना Lantern डेटाबेस सेट नहीं कर चुके हैं, तो इन चरणों का उपयोग करें।

1. अपना Lantern डेटाबेस बनाने के लिए [https://lantern.dev](https://lantern.dev) पर जाएं।
2. अपने पसंदीदा SQL क्लाइंट में, SQL एडिटर पर जाएं और अपने डेटाबेस को वेक्टर स्टोर के रूप में सेट करने के लिए निम्नलिखित स्क्रिप्ट चलाएं:

   ```sql
   -- आपके दस्तावेजों को संग्रहित करने के लिए एक तालिका बनाएं
   create table
     documents (
       id uuid primary key,
       content text, -- Document.pageContent से संबंधित
       metadata jsonb, -- Document.metadata से संबंधित
       embedding REAL[1536] -- OpenAI एम्बेडिंग्स के लिए 1536 काम करता है, आवश्यकतानुसार बदलें
     );

   -- दस्तावेजों को खोजने के लिए एक फ़ंक्शन बनाएं
   create function match_documents (
     query_embedding REAL[1536],
     filter jsonb default '{}'
   ) returns table (
     id uuid,
     content text,
     metadata jsonb,
     similarity float
   ) language plpgsql as $$
   #variable_conflict use_column
   begin
     return query
     select
       id,
       content,
       metadata,
       1 - (documents.embedding <=> query_embedding) as similarity
     from documents
     where metadata @> filter
     order by documents.embedding <=> query_embedding;
   end;
   $$;
   ```

## वातावरण चर सेटअप

हम [`Lantern`](https://python.langchain.com/docs/integrations/vectorstores/lantern) और [`OpenAIEmbeddings`](https://python.langchain.com/docs/integrations/text_embedding/openai) का उपयोग कर रहे हैं, इसलिए हमें उनके API कुंजियों को लोड करना होगा।

## उपयोग

पहले, LangChain CLI स्थापित करें:

```shell
pip install -U langchain-cli
```

नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-lantern
```

और अगर आप किसी मौजूदा प्रोजेक्ट में इसे जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add rag-lantern
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_lantern.chain import chain as rag_lantern_chain

add_routes(app, rag_lantern_chain, path="/rag-lantern")
```

(वैकल्पिक) अब LangSmith को कॉन्फ़िगर करते हैं।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) से LangSmith के लिए साइन अप कर सकते हैं।
अगर आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

अगर आप इस निर्देशिका के भीतर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहा होगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-lantern/playground](http://127.0.0.1:8000/rag-lantern/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-lantern")
```
