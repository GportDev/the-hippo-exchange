import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignUp, useUser } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signUpSchema = z
	.object({
		username: z
			.string({ required_error: "Username is required" })
			.min(3, "Username must be at least 3 characters long."),
		email: z
			.string({ required_error: "Email is required" })
			.email("Please enter a valid email address."),
		firstName: z
			.string({ required_error: "First name is required" })
			.min(1, "First name cannot be empty."),
		lastName: z
			.string({ required_error: "Last name is required" })
			.min(1, "Last name cannot be empty."),
		password: z
			.string({ required_error: "Password is required" })
			.min(8, "Password must be at least 8 characters long."),
		confirmPassword: z.string({
			required_error: "Please confirm your password",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords must match!",
		path: ["confirmPassword"],
	});

type SignUpSchema = z.infer<typeof signUpSchema>;

export const Route = createFileRoute("/sign-up/")({
	component: SignUpComponent,
});

function SignUpComponent() {
	const { isLoaded, signUp, setActive } = useSignUp();
	const { isSignedIn, isLoaded: isUserLoaded } = useUser();
	const [clerkErrors, setClerkErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [pendingVerification, setPendingVerification] = useState(false);

	// Redirect to assets if already signed in
	if (isUserLoaded && isSignedIn) {
		return <Navigate to="/home" replace />;
	}

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
	} = useForm<SignUpSchema>({
		resolver: zodResolver(signUpSchema),
		mode: "onChange",
	});

	useEffect(() => {
		const subscription = watch((value) => {
			const { password, confirmPassword, ...rest } = value;
			localStorage.setItem("signUpFormCache", JSON.stringify(rest));
		});
		return () => subscription.unsubscribe();
	}, [watch]);

	useEffect(() => {
		const cachedValues = localStorage.getItem("signUpFormCache");
		if (cachedValues) {
			const parsedValues = JSON.parse(cachedValues);
			setValue("username", parsedValues.username);
			setValue("firstName", parsedValues.firstName);
			setValue("lastName", parsedValues.lastName);
			setValue("email", parsedValues.email);
		}
	}, [setValue]);

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

	const onSubmit = async (data: SignUpSchema) => {
		if (!isLoaded || isLoading) {
			return;
		}

		setIsLoading(true);
		// Clear previous errors
		setClerkErrors({});

		try {
			const result = await signUp.create({
				username: data.username,
				emailAddress: data.email,
				password: data.password,
				firstName: data.firstName,
				lastName: data.lastName,
			});

			if (result.status === "complete") {
				await setActive({ session: result.createdSessionId });
			} else {
				await signUp.prepareEmailAddressVerification({
					strategy: "email_code",
				});
				setPendingVerification(true);
			}
		} catch (err: unknown) {
			const fieldErrors = parseClerkError(err);
			setClerkErrors(fieldErrors);
		} finally {
			setIsLoading(false);
		}
	};

	const onVerify = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!isLoaded) {
			return;
		}

		try {
			const completeSignUp = await signUp.attemptEmailAddressVerification({
				code: (e.target as HTMLFormElement).code.value,
			});
			if (completeSignUp.status === "complete") {
				await setActive({ session: completeSignUp.createdSessionId });
			}
		} catch (err: unknown) {
			const fieldErrors = parseClerkError(err);
			setClerkErrors(fieldErrors);
		}
	};

	return (
		<div className="relative flex flex-col md:flex-row min-h-screen bg-primary-yellow overflow-x-hidden">
			<Link
				to="/"
				className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 inline-flex items-center gap-2 text-primary-yellow hover:text-primary-yellow/80 transition-colors"
			>
				<ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
				<span className="font-semibold text-sm sm:text-base">Back</span>
			</Link>
			<div className="flex flex-col justify-center items-center md:w-1/2 p-4 sm:p-6 md:p-12 text-white bg-primary-gray rounded-b-[2.5rem] md:rounded-r-[6rem] md:rounded-bl-none overflow-hidden">
				<img
					src="/HippoTransparent.png"
					alt="Hippo Exchange Logo"
					className="w-24 h-24 sm:w-40 sm:h-40 md:w-64 md:h-64 lg:w-70 lg:h-70 mb-2 sm:mb-3 md:mb-4"
				/>
				<div className="text-center">
					<h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-primary-yellow mb-1 sm:mb-2">
						Hippo Exchange
					</h1>
					<p className="text-base sm:text-lg md:text-2xl lg:text-3xl text-white">
						don't buy. borrow.
					</p>
				</div>
			</div>
			<div className="flex flex-col items-center justify-center md:w-1/2 ">
				<div className="w-full max-w-md p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
					{!pendingVerification && (
						<div>
							<h2 className="text-2xl sm:text-3xl font-bold text-center text-primary-gray">
								Create Account
							</h2>
						</div>
					)}
					{pendingVerification ? (
						<>
							<h2 className="text-2xl sm:text-3xl font-bold text-center text-primary-gray">
								Verify Your Email
							</h2>
							<p className="text-center text-primary-gray text-sm">
								Please enter the verification code sent to your email address.
							</p>
							<form className="mt-4 sm:mt-6 space-y-1" onSubmit={onVerify}>
								<div className="space-y-2 text-primary-gray">
									<Label htmlFor="code">Verification Code</Label>
									<Input
										id="code"
										name="code"
										type="text"
										required
										className="border border-primary-gray"
										placeholder="Verification Code"
									/>
								</div>
								<p className="text-red-500 text-xs min-h-[1.25rem] py-2">
									{clerkErrors.code || "\u00A0"}
								</p>

								<div className="pt-2">
									<Button
										type="submit"
										className="w-full text-primary-yellow bg-primary-gray cursor-pointer"
									>
										Verify
									</Button>
								</div>
							</form>
						</>
					) : (
						<form
							className="mt-4 sm:mt-6 space-y-1"
							onSubmit={handleSubmit(onSubmit)}
						>
							<div className="space-y-1 rounded-md">
								<div className="space-y-2 text-primary-gray">
									<Label htmlFor="username">Username</Label>
									<Input
										id="username"
										type="text"
										placeholder="Username"
										className="border border-primary-gray"
										{...register("username")}
									/>
								</div>
								<p className="text-red-500 text-xs min-h-[1.25rem] py-2">
									{errors.username?.message || clerkErrors.username || "\u00A0"}
								</p>

								{/* First and Last Name - Side by side on larger screens */}
								<div className="space-y-2">
									<div className="flex flex-col md:flex-row gap-4">
										<div className="flex-1 space-y-2 text-primary-gray">
											<Label htmlFor="firstName">First Name</Label>
											<Input
												id="firstName"
												type="text"
												placeholder="First Name"
												className="border border-primary-gray"
												{...register("firstName")}
											/>
										</div>
										<div className="flex-1 space-y-2 text-primary-gray">
											<Label htmlFor="lastName">Last Name</Label>
											<Input
												id="lastName"
												type="text"
												placeholder="Last Name"
												className="border border-primary-gray"
												{...register("lastName")}
											/>
										</div>
									</div>
								</div>
								<p className="text-red-500 text-xs min-h-[1.25rem] py-2">
									{[
										errors.firstName?.message || clerkErrors.firstName,
										errors.lastName?.message || clerkErrors.lastName,
									]
										.filter(Boolean)
										.join(", ") || "\u00A0"}
								</p>
								<div className="space-y-2 text-primary-gray">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="Email"
										className="border border-primary-gray"
										{...register("email")}
									/>
								</div>
								<p className="text-red-500 text-xs min-h-[1.25rem] py-2">
									{errors.email?.message ||
										clerkErrors.emailAddress ||
										"\u00A0"}
								</p>
								<div className="space-y-2 text-primary-gray">
									<Label htmlFor="password ">Password</Label>
									<Input
										id="password"
										type="password"
										placeholder="Password"
										className="border border-primary-gray"
										{...register("password")}
									/>
								</div>
								<p className="text-red-500 text-xs min-h-[1.25rem] py-2">
									{errors.password?.message || clerkErrors.password || "\u00A0"}
								</p>
								<div className="space-y-2 text-primary-gray">
									<Label htmlFor="confirmPassword">Confirm Password</Label>
									<Input
										id="confirmPassword"
										type="password"
										placeholder="Confirm Password"
										className="border border-primary-gray"
										{...register("confirmPassword")}
									/>
								</div>
								<p className="text-red-500 text-xs min-h-[1.25rem] py-2">
									{errors.confirmPassword?.message || "\u00A0"}
								</p>
							</div>

							<div className="space-y-4 pt-2">
								<Button
									type="submit"
									className="w-full text-primary-yellow bg-primary-gray cursor-pointer"
									disabled={isLoading}
								>
									{isLoading ? (
										<div className="flex items-center justify-center">
											<svg
												className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
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
											Signing Up...
										</div>
									) : (
										"Sign Up"
									)}
								</Button>
							</div>
						</form>
					)}
					<div className="text-xs text-center">
						<p className="text-primary-gray">
							Already Have an Account?{" "}
							<a
								href="/sign-in"
								className="text-primary-gray underline-offset-2 underline hover:text-indigo-500"
							>
								Log In
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
