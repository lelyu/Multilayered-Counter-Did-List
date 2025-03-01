import img4 from "../assets/img4.webp";
import img5 from "../assets/img5.webp";
import img6 from "../assets/img6.webp";

const Carousel = () => {
	return (
		<div id="carouselExampleCaptions" className="carousel slide">
			<div className="carousel-indicators">
				<button
					type="button"
					data-bs-target="#carouselExampleCaptions"
					data-bs-slide-to="0"
					className="active"
					aria-current="true"
					aria-label="Slide 1"
				></button>
				<button
					type="button"
					data-bs-target="#carouselExampleCaptions"
					data-bs-slide-to="1"
					aria-label="Slide 2"
				></button>
				<button
					type="button"
					data-bs-target="#carouselExampleCaptions"
					data-bs-slide-to="2"
					aria-label="Slide 3"
				></button>
			</div>
			<div className="carousel-inner">
				<div className="carousel-item active">
					<img
						src={img4}
						className="d-block w-100 img-thumbnail"
						alt="..."
						style={{ height: "33vh", objectFit: "cover" }}
					/>
					<div className="carousel-caption d-none d-md-block">
						<h5 className="text-info">Welcome to DocIt</h5>
						<p className="text-info">
							A Better Way to Document Your Work
						</p>
					</div>
				</div>
				<div className="carousel-item">
					<img
						src={img5}
						className="d-block w-100 img-thumbnail"
						alt="..."
						style={{ height: "33vh", objectFit: "cover" }}
					/>
					<div className="carousel-caption d-none d-md-block">
						<h5 className="text-info">AI Powered</h5>
						<p className="text-info">
							Chat and Search. Powered by Google Gemini.
						</p>
					</div>
				</div>
				<div className="carousel-item">
					<img
						src={img6}
						className="d-block w-100 img-thumbnail"
						alt="..."
						style={{ height: "33vh", objectFit: "cover" }}
					/>
					<div className="carousel-caption d-none d-md-block">
						<h5 className="text-info">One More Thing.</h5>
						<p className="text-info">The Best is yet to Come.</p>
					</div>
				</div>
			</div>
			<button
				className="carousel-control-prev"
				type="button"
				data-bs-target="#carouselExampleCaptions"
				data-bs-slide="prev"
			>
				<span
					className="carousel-control-prev-icon"
					aria-hidden="true"
				></span>
				<span className="visually-hidden">Previous</span>
			</button>
			<button
				className="carousel-control-next"
				type="button"
				data-bs-target="#carouselExampleCaptions"
				data-bs-slide="next"
			>
				<span
					className="carousel-control-next-icon"
					aria-hidden="true"
				></span>
				<span className="visually-hidden">Next</span>
			</button>
		</div>
	);
};

export default Carousel;
