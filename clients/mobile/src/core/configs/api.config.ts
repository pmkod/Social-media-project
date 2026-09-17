import { Platform } from "react-native";

export const ApiConfig = {
	baseUrl:
		process.env.EXPO_PUBLIC_API_URL ||
		(Platform.OS === "android"
			? "http://10.0.2.2:8000"
			: "http://localhost:8000"),
};
