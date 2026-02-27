// app/not-found.js
import Link from "next/link";

export const metadata = {
  title: "410 - Page Gone | Dial Export Mart",
  description: "This page has been permanently removed or is no longer available.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="py-5 min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 text-center">
            <h1 className="display-1 fw-bold text-primary">410</h1>
            <h2 className="h4 text-dark mb-3">Page Gone</h2>
            <p className="text-muted mb-4">
              The page you are looking for has been permanently removed or its URL has changed.
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
