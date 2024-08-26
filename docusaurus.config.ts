import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { ProvidePlugin } from "webpack";

const config: Config = {
	title: "🦜️🔗 LangChain Translation Project",
	tagline: "LangChain Python Docs",
	favicon: "img/brand/favicon.png",

	// Set the production url of your site here
	url: "https://ankk.app",
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: "/langchain/v0.1/",

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	// organizationName: 'facebook', // Usually your GitHub org/user name.
	// projectName: 'docusaurus', // Usually your repo name.

	onBrokenLinks: "warn",
	onBrokenMarkdownLinks: "warn",

	themes: ["@docusaurus/theme-mermaid"],
	markdown: {
		mermaid: true,
		format: "detect",
	},
	// scripts: [
	// 	{
	// 		src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2130210715518535",
	// 		async: true,
	// 		crossorigin: "anonymous",
	// 	},
	// ],

	plugins: [
		() => ({
			name: "custom-webpack-config",
			configureWebpack: () => ({
				plugins: [
					new ProvidePlugin({
						process: require.resolve("process/browser"),
					}),
				],
				resolve: {
					fallback: {
						path: false,
						url: false,
					},
				},
				module: {
					rules: [
						{
							test: /\.m?js/,
							resolve: {
								fullySpecified: false,
							},
						},
						{
							test: /\.py$/,
							loader: "raw-loader",
							resolve: {
								fullySpecified: false,
							},
						},
						{
							test: /\.ya?ml$/,
							use: "yaml-loader",
						},
						{
							test: /\.ipynb$/,
							loader: "raw-loader",
							resolve: {
								fullySpecified: false,
							},
						},
					],
				},
			}),
		}),
	],

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: "en",
		locales: ["en", "ko", "es", "fr", "hi", "ja"],
	},

	presets: [
		[
			"classic",
			{
				docs: {
					sidebarPath: "./sidebars.ts",
					// remarkPlugins: [
					//   [require("@docusaurus/remark-plugin-npm2yarn"), { sync: true }],
					// ],
				},
				// pages: {
				//   remarkPlugins: [require("@docusaurus/remark-plugin-npm2yarn")],
				// },
				theme: {
					customCss: "./src/css/custom.css",
				},
			} satisfies Preset.Options,
		],
	],

	themeConfig: {
		docs: {
			sidebar: {
				hideable: true,
				autoCollapseCategories: true,
			},
		},
		image: "img/brand/theme-image.png",
		navbar: {
			title: "LangChain Docs",
			// logo: { src: 'img/brand/wordmark.png', srcDark: 'img/brand/wordmark-dark.png' },
			items: [
				{
					type: "localeDropdown",
					position: "right",
				},
				{
					to: "/docs/get_started/introduction",
					label: "Get started",
					position: "left",
				},
				{
					to: "/docs/modules",
					label: "Components",
					position: "left",
				},
				{
					type: "docSidebar",
					position: "left",
					sidebarId: "integrations",
					label: "Integrations",
				},
				{
					to: "/docs/guides",
					label: "Guides",
					position: "left",
				},
				{
					href: "https://api.python.langchain.com",
					label: "API Reference",
					position: "left",
				},
				{
					type: "dropdown",
					label: "More",
					position: "left",
					items: [
						{
							to: "/docs/people/",
							label: "People",
						},
						{
							to: "/docs/packages",
							label: "Versioning",
						},
						{
							to: "/docs/contributing",
							label: "Contributing",
						},
						{
							type: "docSidebar",
							sidebarId: "templates",
							label: "Templates",
						},
						{
							label: "Cookbooks",
							href: "https://github.com/langchain-ai/langchain/blob/master/cookbook/README.md",
						},
						{
							to: "/docs/additional_resources/tutorials",
							label: "Tutorials",
						},
						{
							to: "/docs/additional_resources/youtube",
							label: "YouTube",
						},
					],
				},
				{
					type: "dropdown",
					label: "🦜️🔗",
					position: "right",
					items: [
						{
							href: "https://smith.langchain.com",
							label: "LangSmith",
						},
						{
							href: "https://docs.smith.langchain.com/",
							label: "LangSmith Docs",
						},
						{
							href: "https://github.com/langchain-ai/langserve",
							label: "LangServe GitHub",
						},
						{
							href: "https://github.com/langchain-ai/langchain/tree/master/templates",
							label: "Templates GitHub",
						},
						{
							label: "Templates Hub",
							href: "https://templates.langchain.com",
						},
						{
							href: "https://smith.langchain.com/hub",
							label: "LangChain Hub",
						},
						{
							href: "https://js.langchain.com",
							label: "JS/TS Docs",
						},
					],
				},
				{
					href: "https://chat.langchain.com",
					label: "💬",
					position: "right",
				},
				// Please keep GitHub link to the right for consistency.
				{
					href: "https://github.com/langchain-ai/langchain",
					position: "right",
					className: "header-github-link",
					"aria-label": "GitHub repository",
				},
			],
		},
		footer: {
			style: "dark",
			links: [
				{
					title: "Docs",
					items: [
						{
							label: "Get started",
							to: "/docs/get_started/introduction",
						},
					],
				},
				{
					title: "LangChain",
					items: [
						{
							label: "LangChain",
							href: "https://python.langchain.com",
						},
					],
				},
				{
					title: "More",
					items: [
						{
							label: "Docs For All",
							href: "https://docsforall.com",
						},
					],
				},
			],
			copyright: `Copyright © ${new Date().getFullYear()} id-ego, Built with Docusaurus.`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
