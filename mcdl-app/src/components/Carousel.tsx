import img4 from "../assets/docit2.webp";
import img5 from "../assets/docit3.webp";

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
			</div>
			<div className="carousel-inner">
				<div className="carousel-item active">
					<img
						src={img4}
						style={{ height: "100vh" }}
						className="d-block w-100 img-thumbnail"
						alt="..."
					/>
					<div className="carousel-caption d-none d-md-block">
						{/*	left empty on purpose */}
					</div>
				</div>
				<div className="carousel-item">
					<img
						src={img5}
						style={{ height: "100vh" }}
						className="d-block w-100 img-thumbnail"
						alt="..."
					/>
					<div className="carousel-caption d-none d-md-block"></div>
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
