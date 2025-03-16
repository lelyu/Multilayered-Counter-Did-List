import React from "react";

const FAQSection = () => {
	return (
		<section className="py-5 bg-light" id="faq">
			<div className="container">
				<h2 className="mb-4 text-center">Frequently Asked Questions</h2>
				<div className="accordion" id="faqAccordion">
					{/* FAQ 1 */}
					<div className="accordion-item">
						<h2 className="accordion-header" id="faqHeadingOne">
							<button
								className="accordion-button"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target="#faqCollapseOne"
								aria-expanded="true"
								aria-controls="faqCollapseOne"
							>
								How does DocIt protect my data?
							</button>
						</h2>
						<div
							id="faqCollapseOne"
							className="accordion-collapse collapse show"
							aria-labelledby="faqHeadingOne"
							data-bs-parent="#faqAccordion"
						>
							<div className="accordion-body">
								DocIt uses end-to-end data encryption to protect
								the users' data.
							</div>
						</div>
					</div>
					{/* FAQ 2 */}
					<div className="accordion-item">
						<h2 className="accordion-header" id="faqHeadingTwo">
							<button
								className="accordion-button collapsed"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target="#faqCollapseTwo"
								aria-expanded="false"
								aria-controls="faqCollapseTwo"
							>
								What are the benefits of using DocIt?
							</button>
						</h2>
						<div
							id="faqCollapseTwo"
							className="accordion-collapse collapse"
							aria-labelledby="faqHeadingTwo"
							data-bs-parent="#faqAccordion"
						>
							<div className="accordion-body">
								With DocIt, you can quickly document your daily
								work, streamline reports, and ensure no
								important detail is missed.
							</div>
						</div>
					</div>

					{/*FAQ3*/}
					<div className="accordion-item">
						<h2 className="accordion-header" id="faqHeadingThree">
							<button
								className="accordion-button collapsed"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target="#faqCollapseThree"
								aria-expanded="false"
								aria-controls="faqCollapseThree"
							>
								How do I contact support?
							</button>
						</h2>
						<div
							id="faqCollapseThree"
							className="accordion-collapse collapse"
							aria-labelledby="faqHeadingThree"
							data-bs-parent="#faqAccordion"
						>
							<div className="accordion-body">
								You can reach out directly to the developer of
								this app himself at lyulelok@gmail.com.
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default FAQSection;
