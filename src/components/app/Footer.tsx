import React from "react";
import "./Footer.css";
import useIsMobile from "../../hooks/useIsMobile.ts";

const Footer = () => {
	const isMobile = useIsMobile();

	return isMobile ? null : (
		<div className="footer">
			<p>
				DDO Audit is brought to you by Clemeit of Thelanis.
				<br />
				This utility is subject to change without notice.
			</p>
		</div>
	);
};

export default Footer;
