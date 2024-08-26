import React from "react";
import DocItemLayout from "@theme-original/DocItem/Layout";
import { useDoc } from "@docusaurus/theme-common/internal";
import Head from "@docusaurus/Head";

export default function DocItemLayoutWrapper(props) {
	const { frontMatter } = useDoc();
	const { canonical } = frontMatter;

	return (
		<>
			{canonical && (
				<Head>
					<link rel="canonical" href={canonical} />
				</Head>
			)}
			<DocItemLayout {...props} />
		</>
	);
}
