import * as React from "react";
import { View } from "react-native";
import { Button } from "@/core/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Text } from "@/core/components/ui/text";

export default function Index() {
	const [name, setName] = React.useState("");
	const [submitted, setSubmitted] = React.useState(false);

	return (
		<View className="flex-1 items-center justify-center bg-background p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>React Native Reusables</CardTitle>
					<CardDescription>
						L'équivalent de shadcn/ui pour React Native est prêt !
					</CardDescription>
				</CardHeader>
				<CardContent className="gap-4">
					<View className="gap-2">
						<Text className="text-sm font-medium">Votre nom</Text>
						<Input
							placeholder="Ex: Alexandre"
							value={name}
							onChangeText={setName}
						/>
					</View>
					{submitted && name.trim().length > 0 && (
						<Text className="text-sm text-primary">
							Bienvenue, {name} ! Vos composants shadcn fonctionnent
							parfaitement.
						</Text>
					)}
				</CardContent>
				<CardFooter className="justify-end gap-2">
					<Button
						variant="outline"
						onPress={() => {
							setName("");
							setSubmitted(false);
						}}
					>
						<Text>Effacer</Text>
					</Button>
					<Button onPress={() => setSubmitted(true)}>
						<Text>Valider</Text>
					</Button>
				</CardFooter>
			</Card>
		</View>
	);
}
