import Link from "next/link";

export const metadata = {
  title: "404 - Page Not Found | Dial Export Mart",
  description: "The page you are looking for does not exist or has been moved.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="py-5 min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 text-center">
            <h1 className="display-1 fw-bold text-primary">404</h1>
            <h2 className="h4 text-dark mb-3">Page Not Found</h2>
            <p className="text-muted mb-4">
              The page you are looking for does not exist or has been moved.
            </p>
            <Link
              href="/"
              className="btn btn-primary btn-lg px-4"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
