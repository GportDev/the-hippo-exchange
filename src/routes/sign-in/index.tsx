import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn, useUser } from "@clerk/clerk-react";
import { Navigate, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const Route = createFileRoute("/sign-in/")({
	component: SignInComponent,
});

function SignInComponent() {
	const { isLoaded, signIn, setActive } = useSignIn();
	const { isSignedIn, isLoaded: isUserLoaded } = useUser();
	const navigate = useNavigate({ from: "/sign-in" });
	const [clerkErrors, setClerkErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);

	// Redirect to assets if already signed in
	if (isUserLoaded && isSignedIn) {
		return <Navigate to="/assets/my-assets" replace />;
	}

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	const parseClerkError = (error: unknown) => {
		const fieldErrors: Record<string, string> = {};

		if (
			error &&
			typeof error === "object" &&
			"errors" in error &&
			Array.isArray(error.errors)
		) {
			for (const err of error.errors) {
				if (
					err &&
					typeof err === "object" &&
					"meta" in err &&
					err.meta &&
					typeof err.meta === "object" &&
					"paramName" in err.meta
				) {
					fieldErrors[err.meta.paramName as string] = (
						err as { message: string }
					).message;
				}
			}
		}

		return fieldErrors;
	};

	const onSubmit = async (data: Record<string, string>) => {
		if (!isLoaded || isLoading) {
			return;
		}

		setIsLoading(true);
		// Clear previous errors
		setClerkErrors({});

		try {
			const result = await signIn.create({
				identifier: data.username,
				password: data.password,
			});

			if (result.status === "complete") {
				await setActive({ session: result.createdSessionId });
				navigate({ to: "/" });
			}
		} catch (err: unknown) {
			const fieldErrors = parseClerkError(err);
			setClerkErrors(fieldErrors);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col md:flex-row min-h-screen bg-primary-yellow">
			<div className="flex flex-col justify-center items-center md:w-1/2 p-12 text-white bg-primary-gray rounded-b-[4rem] md:rounded-r-[6rem] md:rounded-bl-none flex-grow">
				<img
					src="/HippoTransparent.png"
					alt="Hippo Exchange Logo"
					className="w-70 h-70 mb-4"
				/>
				<div className="text-center">
					<h1 className="text-7xl font-bold text-primary-yellow mb-2">
						Hippo Exchange
					</h1>
					<p className="text-3xl text-white">Don't Buy. Borrow.</p>
				</div>
			</div>
			<div className="flex flex-col items-center justify-center md:w-1/2">
				<div className="w-full md:max-w-md p-8 space-y-8">
					<div>
						<h2 className="text-3xl font-bold text-center text-primary-gray">
							Log In
						</h2>
					</div>
					<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
						<div className="space-y-6">
							<div className="space-y-2 text-primary-gray">
								<Label htmlFor="username">Username</Label>
								<Input
									id="username"
									type="text"
									placeholder="Username"
									className="border border-primary-gray"
									{...register("username", { required: true })}
								/>
							</div>
							<div className="text-red-500 text-sm min-h-[1.25rem] my-4">
								{errors.username ? (
									<p>Username is required</p>
								) : (
									<p>{clerkErrors.identifier || "\u00A0"}</p>
								)}
							</div>
							<div className="space-y-2 text-primary-gray">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									placeholder="Password"
									className="border border-primary-gray"
									{...register("password", { required: true })}
								/>
							</div>
							<div className="text-red-500 text-sm min-h-[1.25rem] my-4">
								{errors.password ? (
									<p>Password is required</p>
								) : (
									<p>{clerkErrors.password || "\u00A0"}</p>
								)}
							</div>
						</div>

						<div>
							<Button
								type="submit"
								className="w-full text-primary-yellow bg-primary-gray cursor-pointer"
								disabled={isLoading}
							>
								{isLoading ? (
									<div className="flex items-center justify-center">
										<svg
											className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											role="img"
											aria-label="Loading spinner"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											/>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
										Logging In...
									</div>
								) : (
									"Log In"
								)}
							</Button>
						</div>
					</form>
					<div className="text-sm text-center">
						<p className="text-primary-gray">
							New?{" "}
							<a
								href="/sign-up"
								className="text-primary-gray underline-offset-2 underline hover:text-indigo-500"
							>
								Start Here
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
