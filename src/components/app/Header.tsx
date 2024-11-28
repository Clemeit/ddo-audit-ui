import React, { useState, useEffect } from "react";
import NavMenu from "./NavMenu.tsx";
import Banner from "./Banner.tsx";
import { useLocation } from "react-router-dom";
import { bannerTitleAndSubtitleMapping } from "../../config/Routes.ts";

const Header = () => {
	const location = useLocation();
	const [bannerTitleAndSubtitle, setBannerTitleAndSubtitle] = useState({
		title: "DDO Audit",
		subtitle: "Real-time Player Concurrency Data and LFM Viewer",
	});

	useEffect(() => {
		setBannerTitleAndSubtitle(bannerTitleAndSubtitleMapping[location.pathname]);
	}, [location.pathname]);

	return (
		<>
			<NavMenu />
			<Banner
				title={bannerTitleAndSubtitle.title}
				subtitle={bannerTitleAndSubtitle.subtitle}
			/>
		</>
	);
};

export default Header;
