import Carousel from "./Carousel.tsx";
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import FAQSection from "./FAQSection.tsx";

const LandingPage = () => {
	const navigate = useNavigate();
	const handleGetStarted = () => {
		navigate("/home"); // Navigates to the home page (root)
	};

	useEffect(() => {
		AOS.init({
			duration: 1000, // animation duration in milliseconds
			once: true, // whether animation should happen only once
			offset: 100, // offset (in px) from the original trigger point
		});
	}, []);
	return (
		<>
			{/* Hero Section */}
			<section
				className="bg-dark text-white text-center d-flex align-items-center justify-content-center border border-5 border-success rounded"
				style={{ height: "100vh" }}
			>
				<div className="container">
					<h1
						className="display-1 fw-bold"
						data-aos="fade-up" // <--- Animation type
					>
						Make Documenting Easier with{" "}
						<span className="text-warning">DocIt</span>
					</h1>
					<p
						className="lead mt-3"
						data-aos="fade-up"
						data-aos-delay="200" // <--- Delay the animation
					>
						AI Powered Document Management Tool
					</p>
					<button
						className="btn btn-success btn-lg mt-4"
						data-aos="fade-up"
						data-aos-delay="400"
						onClick={handleGetStarted}
					>
						Get Started
					</button>
				</div>
			</section>

			<section
				className="bg-dark text-white text-center d-flex align-items-center justify-content-center border border-5 border-success rounded"
				style={{ height: "100vh" }}
			>
				<div className="container px-5">
					{/* Main Heading */}
					<h1 className="display-3 fw-bold" data-aos="fade-up">
						Doc it? It docs!
					</h1>

					{/* Paragraph 1 */}
					<p
						className="lead mt-3"
						data-aos="fade-up"
						data-aos-delay="200"
					>
						Our attention span is getting shorter, and we're getting
						busier. A lot of times, I couldn't remember what I ate
						for breakfast!
					</p>

					{/* Paragraph 2 */}
					<p className="lead" data-aos="fade-up" data-aos-delay="300">
						DocIt solves this kind of problem in the workplace.
						Imagine you're asked to submit a monthly report by the
						end of today. I bet you can't remember all the details
						-- details that matter!
					</p>

					{/* Paragraph 3 */}
					<p className="lead" data-aos="fade-up" data-aos-delay="400">
						DocIt is a new way to document and organize your work
						journal. You just need to enter a few things, and DocIt
						will handle the rest. You could even use AI to write a
						work report for you. This time, you won't miss out on
						any important details, because DocIt meticulously checks
						your day to day work, acting like an unbiased assistant.
					</p>

					{/* Call-to-Action Button */}
					<button
						className="btn btn-success btn-lg mt-4"
						data-aos="fade-up"
						data-aos-delay="500"
						onClick={handleGetStarted}
					>
						Try DocIt Now
					</button>
				</div>
			</section>
			<div data-aos="fade-up">
				<FAQSection />
			</div>
			<div data-aos="fade-up">
				<Carousel />
			</div>
		</>
	);
};

export default LandingPage;
