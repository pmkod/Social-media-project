import * as React from "react";
import { View } from "react-native";
import { Image } from "expo-image";

export function AuthShowcaseCards() {
	return (
		<View className="relative w-full items-center justify-center py-4" style={{ height: 280 }}>
			{/* Left card — tilted behind */}
			<View
				className="absolute overflow-hidden rounded-[22px] border border-white/10 shadow-2xl"
				style={{
					width: 135,
					height: 225,
					top: 30,
					left: "50%",
					marginLeft: -145,
					transform: [{ rotate: "-12deg" }],
					zIndex: 1,
					elevation: 8,
				}}
			>
				<Image
					source={require("../../../../assets/images/auth-photo-1.jpg")}
					style={{ width: "100%", height: "100%" }}
					contentFit="cover"
					contentPosition="top center"
				/>
			</View>

			{/* Center card — in front */}
			<View
				className="absolute overflow-hidden rounded-[22px] border border-white/10 shadow-2xl"
				style={{
					width: 155,
					height: 255,
					top: 10,
					left: "50%",
					marginLeft: -77.5,
					zIndex: 3,
					elevation: 16,
				}}
			>
				<Image
					source={require("../../../../assets/images/auth-photo-2.jpg")}
					style={{ width: "100%", height: "100%" }}
					contentFit="cover"
					contentPosition="top center"
				/>
			</View>

			{/* Right card — tilted */}
			<View
				className="absolute overflow-hidden rounded-[22px] border border-white/10 shadow-2xl"
				style={{
					width: 135,
					height: 225,
					top: 30,
					left: "50%",
					marginLeft: 10,
					transform: [{ rotate: "12deg" }],
					zIndex: 2,
					elevation: 10,
				}}
			>
				<Image
					source={require("../../../../assets/images/auth-photo-3.jpg")}
					style={{ width: "100%", height: "100%" }}
					contentFit="cover"
					contentPosition="top center"
				/>
			</View>
		</View>
	);
}
