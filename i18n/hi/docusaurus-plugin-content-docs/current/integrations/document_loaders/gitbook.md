---
translated: true
---

# गिटबुक

>[गिटबुक](https://docs.gitbook.com/) एक आधुनिक प्रलेखन मंच है जहां टीमें उत्पादों से लेकर आंतरिक ज्ञान आधार और एपीआई तक सब कुछ प्रलेखित कर सकती हैं।

यह नोटबुक किसी भी `गिटबुक` से पृष्ठ डेटा को कैसे प्राप्त करना है दिखाता है।

```python
from langchain_community.document_loaders import GitbookLoader
```

### किसी एक गिटबुक पृष्ठ से लोड करना

```python
loader = GitbookLoader("https://docs.gitbook.com")
```

```python
page_data = loader.load()
```

```python
page_data
```

```output
[Document(page_content='Introduction to GitBook\nGitBook is a modern documentation platform where teams can document everything from products to internal knowledge bases and APIs.\nWe want to help \nteams to work more efficiently\n by creating a simple yet powerful platform for them to \nshare their knowledge\n.\nOur mission is to make a \nuser-friendly\n and \ncollaborative\n product for everyone to create, edit and share knowledge through documentation.\nPublish your documentation in 5 easy steps\nImport\n\nMove your existing content to GitBook with ease.\nGit Sync\n\nBenefit from our bi-directional synchronisation with GitHub and GitLab.\nOrganise your content\n\nCreate pages and spaces and organize them into collections\nCollaborate\n\nInvite other users and collaborate asynchronously with ease.\nPublish your docs\n\nShare your documentation with selected users or with everyone.\nNext\n - Getting started\nOverview\nLast modified \n3mo ago', lookup_str='', metadata={'source': 'https://docs.gitbook.com', 'title': 'Introduction to GitBook'}, lookup_index=0)]
```

### किसी दिए गए गिटबुक में सभी पथों से लोड करना

इसके लिए, गिटबुकलोडर को रूट पथ (`https://docs.gitbook.com` इस उदाहरण में) के साथ प्रारंभ किया जाना चाहिए और `load_all_paths` को `True` पर सेट किया जाना चाहिए।

```python
loader = GitbookLoader("https://docs.gitbook.com", load_all_paths=True)
all_pages_data = loader.load()
```

```output
Fetching text from https://docs.gitbook.com/
Fetching text from https://docs.gitbook.com/getting-started/overview
Fetching text from https://docs.gitbook.com/getting-started/import
Fetching text from https://docs.gitbook.com/getting-started/git-sync
Fetching text from https://docs.gitbook.com/getting-started/content-structure
Fetching text from https://docs.gitbook.com/getting-started/collaboration
Fetching text from https://docs.gitbook.com/getting-started/publishing
Fetching text from https://docs.gitbook.com/tour/quick-find
Fetching text from https://docs.gitbook.com/tour/editor
Fetching text from https://docs.gitbook.com/tour/customization
Fetching text from https://docs.gitbook.com/tour/member-management
Fetching text from https://docs.gitbook.com/tour/pdf-export
Fetching text from https://docs.gitbook.com/tour/activity-history
Fetching text from https://docs.gitbook.com/tour/insights
Fetching text from https://docs.gitbook.com/tour/notifications
Fetching text from https://docs.gitbook.com/tour/internationalization
Fetching text from https://docs.gitbook.com/tour/keyboard-shortcuts
Fetching text from https://docs.gitbook.com/tour/seo
Fetching text from https://docs.gitbook.com/advanced-guides/custom-domain
Fetching text from https://docs.gitbook.com/advanced-guides/advanced-sharing-and-security
Fetching text from https://docs.gitbook.com/advanced-guides/integrations
Fetching text from https://docs.gitbook.com/billing-and-admin/account-settings
Fetching text from https://docs.gitbook.com/billing-and-admin/plans
Fetching text from https://docs.gitbook.com/troubleshooting/faqs
Fetching text from https://docs.gitbook.com/troubleshooting/hard-refresh
Fetching text from https://docs.gitbook.com/troubleshooting/report-bugs
Fetching text from https://docs.gitbook.com/troubleshooting/connectivity-issues
Fetching text from https://docs.gitbook.com/troubleshooting/support
```

```python
print(f"fetched {len(all_pages_data)} documents.")
# show second document
all_pages_data[2]
```

```output
fetched 28 documents.
```

```output
Document(page_content="Import\nFind out how to easily migrate your existing documentation and which formats are supported.\nThe import function allows you to migrate and unify existing documentation in GitBook. You can choose to import single or multiple pages although limits apply. \nPermissions\nAll members with editor permission or above can use the import feature.\nSupported formats\nGitBook supports imports from websites or files that are:\nMarkdown (.md or .markdown)\nHTML (.html)\nMicrosoft Word (.docx).\nWe also support import from:\nConfluence\nNotion\nGitHub Wiki\nQuip\nDropbox Paper\nGoogle Docs\nYou can also upload a ZIP\n \ncontaining HTML or Markdown files when \nimporting multiple pages.\nNote: this feature is in beta.\nFeel free to suggest import sources we don't support yet and \nlet us know\n if you have any issues.\nImport panel\nWhen you create a new space, you'll have the option to import content straight away:\nThe new page menu\nImport a page or subpage by selecting \nImport Page\n from the New Page menu, or \nImport Subpage\n in the page action menu, found in the table of contents:\nImport from the page action menu\nWhen you choose your input source, instructions will explain how to proceed.\nAlthough GitBook supports importing content from different kinds of sources, the end result might be different from your source due to differences in product features and document format.\nLimits\nGitBook currently has the following limits for imported content:\nThe maximum number of pages that can be uploaded in a single import is \n20.\nThe maximum number of files (images etc.) that can be uploaded in a single import is \n20.\nGetting started - \nPrevious\nOverview\nNext\n - Getting started\nGit Sync\nLast modified \n4mo ago", lookup_str='', metadata={'source': 'https://docs.gitbook.com/getting-started/import', 'title': 'Import'}, lookup_index=0)
```
