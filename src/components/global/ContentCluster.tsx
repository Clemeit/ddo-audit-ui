import React from "react";
import PropTypes from "prop-types";
import "./ContentCluster.css";

const ContentCluster = ({ title, subtitle, link, showLink, children }) => {
	return (
		<div className="content-cluster">
			<h2>{title}</h2>
			{subtitle && <h3>{subtitle}</h3>}
			<hr />
			<div className="content">{children}</div>
		</div>
	);
};

ContentCluster.propTypes = {
	title: PropTypes.string,
	subtitle: PropTypes.string,
	link: PropTypes.string,
	showLink: PropTypes.bool,
	children: PropTypes.node,
};

ContentCluster.defaultProps = {
	title: "Title",
	subtitle: "",
	link: "#",
	showLink: true,
	children: null,
};

export default ContentCluster;
