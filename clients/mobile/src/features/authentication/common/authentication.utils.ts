import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_VERIFICATION_FIELDS_KEYS } from "./authentication.constants";

type SaveUserVerificationParams = {
	id: string;
	token: string;
};

let cachedVerification: SaveUserVerificationParams | null = null;

export const saveUserVerificationData = async ({
	id,
	token,
}: SaveUserVerificationParams) => {
	cachedVerification = { id, token };
	await AsyncStorage.multiSet([
		[USER_VERIFICATION_FIELDS_KEYS.id, id],
		[USER_VERIFICATION_FIELDS_KEYS.token, token],
	]);
};

export const getUserVerificationData = async (): Promise<{
	userVerification: SaveUserVerificationParams;
}> => {
	if (cachedVerification) {
		return { userVerification: cachedVerification };
	}

	const [id, token] = await Promise.all([
		AsyncStorage.getItem(USER_VERIFICATION_FIELDS_KEYS.id),
		AsyncStorage.getItem(USER_VERIFICATION_FIELDS_KEYS.token),
	]);

	if (!id || !token) {
		throw new Error("Verification data not found");
	}

	cachedVerification = { id, token };
	return { userVerification: cachedVerification };
};

export const clearUserVerificationData = async () => {
	cachedVerification = null;
	await AsyncStorage.multiRemove([
		USER_VERIFICATION_FIELDS_KEYS.id,
		USER_VERIFICATION_FIELDS_KEYS.token,
	]);
};
