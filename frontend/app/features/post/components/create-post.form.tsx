import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Form, FormField } from "@/core/components/ui/form";
import { Textarea } from "@/core/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CreatePostValidationSchema } from "../post.validation-schemas";
import { useCreatePost } from "../use-create-post";

const CreatePostForm = () => {
	const { mutate, isPending } = useCreatePost();

	const form = useForm({
		resolver: zodResolver(CreatePostValidationSchema),
		defaultValues: {
			content: "",
		},
	});

	const rootErrorMessage = form.formState.errors.root?.message;

	const onSubmit = form.handleSubmit((data) => {
		mutate(data, {
			onSuccess: () => {},
			onError: (error) => {
				form.setError("root", {
					message: error.message,
				});
			},
		});
	});
	return (
		<div className="">
			{rootErrorMessage ? (
				<div className="mb-5">
					<Alert variant="destructive">
						<AlertDescription>{rootErrorMessage}</AlertDescription>
					</Alert>
				</div>
			) : null}
			<Form {...form}>
				<form onSubmit={onSubmit} className="space-y-8">
					<div className="grid gap-4">
						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<Textarea
									className="min-h-44 text-4xl"
									placeholder="What's new"
									{...field}
								/>
							)}
						/>
						<div className="flex justify-end">
							<Button size="lg" type="submit" isLoading={isPending}>
								Publish
							</Button>
						</div>
						{/* <Button variant="outline" className="w-full">
								Login with Google
							</Button> */}
					</div>
				</form>
			</Form>
		</div>
	);
};

export { CreatePostForm };
