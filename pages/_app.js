import "@/styles/globals.css";
import { TrackingProvider } from "../Context/Tracking";
import { NavBar, Footer } from "../Components";

export default function App({ Component, pageProps }) {
  return (
    <TrackingProvider>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </TrackingProvider>
  );
}
