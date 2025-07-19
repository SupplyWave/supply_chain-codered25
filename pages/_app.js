import "@/styles/globals.css";
import  NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";

export default function App({ Component, pageProps }) {
  return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
  
  );
}
